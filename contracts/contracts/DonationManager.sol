// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CharityRegistry.sol";
import "./VibeToken.sol";
import "./ImpactNFT.sol";

/**
 * @title DonationManager
 * @notice Core contract for managing donations to verified charities
 * @dev Handles ETH and ERC20 donations, fee collection, and VIBE rewards
 */
contract DonationManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Contracts
    CharityRegistry public charityRegistry;
    VibeToken public vibeToken;
    ImpactNFT public impactNFT;

    // Platform fee (in basis points: 250 = 2.5%)
    uint256 public platformFeeBps = 250;
    uint256 public constant MAX_FEE_BPS = 1000; // 10% maximum
    address public feeCollector;

    // VIBE reward parameters
    uint256 public vibeRewardRate = 10 * 10**18; // 10 VIBE per 1 ETH

    // NFT threshold
    uint256 public nftThreshold = 1 ether; // Minimum donation for NFT

    // Donation tracking
    struct Donation {
        address donor;
        uint256 charityId;
        uint256 amount;
        address token; // address(0) for ETH
        uint256 timestamp;
        uint256 vibeRewarded;
        bool nftMinted;
    }

    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public donorDonations;
    mapping(uint256 => uint256[]) public charityDonations;
    mapping(address => uint256) public totalDonatedByDonor;
    mapping(address => mapping(uint256 => uint256))
        public donorCharityTotal;

    uint256 public donationCount;
    uint256 public totalPlatformFees;
    uint256 public totalDonationsValue; // in ETH equivalent

    // Recurring donations
    struct RecurringDonation {
        address donor;
        uint256 charityId;
        uint256 amount;
        address token;
        uint256 interval; // in seconds
        uint256 lastDonation;
        bool active;
    }

    mapping(uint256 => RecurringDonation) public recurringDonations;
    mapping(address => uint256[]) public donorRecurringDonations;
    uint256 public recurringDonationCount;

    // Events
    event DonationMade(
        uint256 indexed donationId,
        address indexed donor,
        uint256 indexed charityId,
        uint256 amount,
        address token,
        uint256 vibeRewarded,
        uint256 timestamp
    );

    event RecurringDonationCreated(
        uint256 indexed recurringId,
        address indexed donor,
        uint256 indexed charityId,
        uint256 amount,
        uint256 interval
    );

    event RecurringDonationExecuted(
        uint256 indexed recurringId,
        uint256 donationId,
        uint256 timestamp
    );

    event RecurringDonationCancelled(
        uint256 indexed recurringId,
        uint256 timestamp
    );

    event FeeCollected(uint256 amount, address token, uint256 timestamp);
    event NFTMinted(
        uint256 indexed donationId,
        address indexed donor,
        uint256 tokenId
    );
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event VibeRewardRateUpdated(uint256 oldRate, uint256 newRate);
    event NFTThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event EmergencyWithdrawal(
        address indexed token,
        uint256 amount,
        address to
    );

    /**
     * @notice Constructor
     * @param _charityRegistry Address of CharityRegistry contract
     * @param _vibeToken Address of VibeToken contract
     * @param _impactNFT Address of ImpactNFT contract
     * @param _feeCollector Address to collect platform fees
     * @param _admin Admin address
     */
    constructor(
        address _charityRegistry,
        address _vibeToken,
        address _impactNFT,
        address _feeCollector,
        address _admin
    ) {
        require(_charityRegistry != address(0), "Invalid registry");
        require(_vibeToken != address(0), "Invalid VIBE token");
        require(_impactNFT != address(0), "Invalid NFT contract");
        require(_feeCollector != address(0), "Invalid fee collector");

        charityRegistry = CharityRegistry(_charityRegistry);
        vibeToken = VibeToken(_vibeToken);
        impactNFT = ImpactNFT(_impactNFT);
        feeCollector = _feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
    }

    /**
     * @notice Donate ETH to a charity
     * @param _charityId ID of the charity to donate to
     */
    function donateETH(uint256 _charityId)
        external
        payable
        nonReentrant
    {
        require(msg.value > 0, "Donation must be > 0");
        require(
            charityRegistry.isCharityVerified(_charityId),
            "Charity not verified"
        );

        _processDonation(
            _charityId,
            msg.value,
            address(0) // ETH
        );
    }

    /**
     * @notice Donate ERC20 tokens to a charity
     * @param _charityId ID of the charity
     * @param _token Address of the ERC20 token
     * @param _amount Amount to donate
     */
    function donateERC20(
        uint256 _charityId,
        address _token,
        uint256 _amount
    ) external nonReentrant {
        require(_amount > 0, "Donation must be > 0");
        require(_token != address(0), "Invalid token");
        require(
            charityRegistry.isCharityVerified(_charityId),
            "Charity not verified"
        );

        // Transfer tokens from donor to contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        _processDonation(_charityId, _amount, _token);
    }

    /**
     * @notice Internal function to process donations
     * @param _charityId Charity ID
     * @param _amount Donation amount
     * @param _token Token address (address(0) for ETH)
     */
    function _processDonation(
        uint256 _charityId,
        uint256 _amount,
        address _token
    ) private {
        // Calculate platform fee
        uint256 fee = (_amount * platformFeeBps) / 10000;
        uint256 netDonation = _amount - fee;

        // Get charity wallet
        CharityRegistry.Charity memory charity = charityRegistry.getCharity(
            _charityId
        );

        // Transfer net donation to charity
        if (_token == address(0)) {
            // ETH transfer
            (bool success, ) = charity.walletAddress.call{value: netDonation}(
                ""
            );
            require(success, "ETH transfer failed");

            // Transfer fee to collector
            (success, ) = feeCollector.call{value: fee}("");
            require(success, "Fee transfer failed");
        } else {
            // ERC20 transfer
            IERC20(_token).safeTransfer(charity.walletAddress, netDonation);
            IERC20(_token).safeTransfer(feeCollector, fee);
        }

        // Calculate VIBE rewards (based on ETH value)
        uint256 vibeReward = (_amount * vibeRewardRate) / 1 ether;

        // Mint VIBE rewards
        if (vibeReward > 0) {
            try vibeToken.mintReward(msg.sender, vibeReward) {
                // Success
            } catch {
                vibeReward = 0; // Set to 0 if minting fails
            }
        }

        // Record donation
        uint256 donationId = donationCount++;
        donations[donationId] = Donation({
            donor: msg.sender,
            charityId: _charityId,
            amount: _amount,
            token: _token,
            timestamp: block.timestamp,
            vibeRewarded: vibeReward,
            nftMinted: false
        });

        donorDonations[msg.sender].push(donationId);
        charityDonations[_charityId].push(donationId);

        totalDonatedByDonor[msg.sender] += _amount;
        donorCharityTotal[msg.sender][_charityId] += _amount;
        totalDonationsValue += _amount;
        totalPlatformFees += fee;

        // Record donation in CharityRegistry
        charityRegistry.recordDonation(_charityId, _amount);

        // Mint NFT if threshold reached
        if (_amount >= nftThreshold) {
            try
                impactNFT.mintImpactNFT(
                    msg.sender,
                    _charityId,
                    _amount
                )
            returns (uint256 tokenId) {
                donations[donationId].nftMinted = true;
                emit NFTMinted(donationId, msg.sender, tokenId);
            } catch {
                // NFT minting failed, continue without NFT
            }
        }

        emit DonationMade(
            donationId,
            msg.sender,
            _charityId,
            _amount,
            _token,
            vibeReward,
            block.timestamp
        );

        emit FeeCollected(fee, _token, block.timestamp);
    }

    /**
     * @notice Create recurring donation
     * @param _charityId Charity ID
     * @param _amount Amount per donation
     * @param _token Token address (address(0) for ETH)
     * @param _interval Interval between donations in seconds
     */
    function createRecurringDonation(
        uint256 _charityId,
        uint256 _amount,
        address _token,
        uint256 _interval
    ) external {
        require(_amount > 0, "Amount must be > 0");
        require(_interval >= 1 days, "Interval too short");
        require(
            charityRegistry.isCharityVerified(_charityId),
            "Charity not verified"
        );

        uint256 recurringId = recurringDonationCount++;

        recurringDonations[recurringId] = RecurringDonation({
            donor: msg.sender,
            charityId: _charityId,
            amount: _amount,
            token: _token,
            interval: _interval,
            lastDonation: block.timestamp,
            active: true
        });

        donorRecurringDonations[msg.sender].push(recurringId);

        emit RecurringDonationCreated(
            recurringId,
            msg.sender,
            _charityId,
            _amount,
            _interval
        );
    }

    /**
     * @notice Execute recurring donation
     * @param _recurringId Recurring donation ID
     */
    function executeRecurringDonation(uint256 _recurringId)
        external
        payable
        nonReentrant
    {
        RecurringDonation storage recurring = recurringDonations[
            _recurringId
        ];
        require(recurring.active, "Recurring donation not active");
        require(
            block.timestamp >= recurring.lastDonation + recurring.interval,
            "Too early"
        );
        require(
            charityRegistry.isCharityVerified(recurring.charityId),
            "Charity no longer verified"
        );

        uint256 donationId = donationCount;

        if (recurring.token == address(0)) {
            // ETH - donor must send value
            require(msg.value == recurring.amount, "Incorrect ETH amount");
            _processDonation(recurring.charityId, msg.value, address(0));
        } else {
            // ERC20 - transfer from donor
            IERC20(recurring.token).safeTransferFrom(
                recurring.donor,
                address(this),
                recurring.amount
            );
            _processDonation(
                recurring.charityId,
                recurring.amount,
                recurring.token
            );
        }

        recurring.lastDonation = block.timestamp;

        emit RecurringDonationExecuted(
            _recurringId,
            donationId,
            block.timestamp
        );
    }

    /**
     * @notice Cancel recurring donation
     * @param _recurringId Recurring donation ID
     */
    function cancelRecurringDonation(uint256 _recurringId) external {
        RecurringDonation storage recurring = recurringDonations[
            _recurringId
        ];
        require(recurring.donor == msg.sender, "Not donation owner");
        require(recurring.active, "Already cancelled");

        recurring.active = false;

        emit RecurringDonationCancelled(_recurringId, block.timestamp);
    }

    /**
     * @notice Update platform fee
     * @param _newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 _newFeeBps)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _newFeeBps;

        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }

    /**
     * @notice Update VIBE reward rate
     * @param _newRate New reward rate
     */
    function setVibeRewardRate(uint256 _newRate)
        external
        onlyRole(ADMIN_ROLE)
    {
        uint256 oldRate = vibeRewardRate;
        vibeRewardRate = _newRate;

        emit VibeRewardRateUpdated(oldRate, _newRate);
    }

    /**
     * @notice Update NFT threshold
     * @param _newThreshold New threshold
     */
    function setNFTThreshold(uint256 _newThreshold)
        external
        onlyRole(ADMIN_ROLE)
    {
        uint256 oldThreshold = nftThreshold;
        nftThreshold = _newThreshold;

        emit NFTThresholdUpdated(oldThreshold, _newThreshold);
    }

    /**
     * @notice Emergency withdrawal function
     * @param _token Token address (address(0) for ETH)
     * @param _amount Amount to withdraw
     * @param _to Recipient address
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyRole(ADMIN_ROLE) {
        require(_to != address(0), "Invalid recipient");

        if (_token == address(0)) {
            (bool success, ) = _to.call{value: _amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(_token).safeTransfer(_to, _amount);
        }

        emit EmergencyWithdrawal(_token, _amount, _to);
    }

    /**
     * @notice Get donation details
     * @param _donationId Donation ID
     * @return Donation struct
     */
    function getDonation(uint256 _donationId)
        external
        view
        returns (Donation memory)
    {
        return donations[_donationId];
    }

    /**
     * @notice Get all donations by a donor
     * @param _donor Donor address
     * @return uint256[] Array of donation IDs
     */
    function getDonorDonations(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorDonations[_donor];
    }

    /**
     * @notice Get all donations to a charity
     * @param _charityId Charity ID
     * @return uint256[] Array of donation IDs
     */
    function getCharityDonations(uint256 _charityId)
        external
        view
        returns (uint256[] memory)
    {
        return charityDonations[_charityId];
    }

    /**
     * @notice Receive ETH
     */
    receive() external payable {}
}
