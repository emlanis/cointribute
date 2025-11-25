// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CharityRegistry
 * @notice Manages charity registration and AI-powered vetting for the Cointribute platform
 * @dev Implements role-based access control for multi-sig approval process
 */
contract CharityRegistry is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Charity verification status
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Suspended
    }

    // Charity struct
    struct Charity {
        string name;
        string description;
        string ipfsHash; // IPFS hash for documents (501c3, etc.)
        address walletAddress;
        uint256 aiScore; // AI vetting score (0-100)
        VerificationStatus status;
        uint256 registeredAt;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 totalDonationsReceived; // Total in wei (backward compatible)
        uint256 donorCount;
        uint256 fundingGoal; // Target amount to raise in wei
        uint256 deadline; // Fundraising deadline (REQUIRED, must be > 0)
        bool isActive;
        uint256 totalETHDonations; // Track ETH donations separately
        uint256 totalUSDCDonations; // Track USDC donations separately (in USDC base units)
        string[] imageHashes; // IPFS hashes for campaign images
    }

    // Storage
    mapping(uint256 => Charity) public charities;
    mapping(address => uint256[]) public charitiesByAddress; // Multiple charities per wallet
    mapping(address => uint256) public lastRegistrationTime; // Last registration timestamp

    uint256 public charityCount;
    uint256 public minimumAiScore = 60; // Minimum score for automatic approval
    uint256 public constant REGISTRATION_COOLDOWN = 90 days; // 3 months between registrations

    mapping(uint256 => mapping(address => bool)) public approvals;
    mapping(uint256 => uint256) public approvalCount;

    // Events
    event CharityRegistered(
        uint256 indexed charityId,
        address indexed wallet,
        string name,
        uint256 timestamp
    );

    event CharityVerified(
        uint256 indexed charityId,
        address indexed verifier,
        VerificationStatus status,
        uint256 timestamp
    );

    event AiScoreUpdated(
        uint256 indexed charityId,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );

    event CharityStatusChanged(
        uint256 indexed charityId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus,
        uint256 timestamp
    );

    event DonationRecorded(
        uint256 indexed charityId,
        uint256 amount,
        uint256 totalDonations
    );

    event MinimumAiScoreUpdated(uint256 oldScore, uint256 newScore);
    event RequiredApprovalsUpdated(uint256 oldCount, uint256 newCount);

    event CharityImagesAdded(
        uint256 indexed charityId,
        string[] imageHashes,
        uint256 timestamp
    );

    /**
     * @notice Constructor sets up initial roles
     * @param _admin Address of the initial admin
     */
    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(VERIFIER_ROLE, _admin);
    }

    /**
     * @notice Register a new charity
     * @param _name Charity name
     * @param _description Charity description
     * @param _ipfsHash IPFS hash containing charity documents
     * @param _walletAddress Wallet to receive donations
     * @param _fundingGoal Target amount to raise (in wei)
     * @param _deadline Fundraising deadline (timestamp, REQUIRED)
     * @param _imageHashes Initial IPFS hashes for campaign images (optional)
     * @return charityId The ID of the newly registered charity
     */
    function registerCharity(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        address _walletAddress,
        uint256 _fundingGoal,
        uint256 _deadline,
        string[] memory _imageHashes
    ) external nonReentrant returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_walletAddress != address(0), "Invalid wallet address");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_deadline > 0, "Deadline is required");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        // Check cooldown period (3 months between registrations)
        if (lastRegistrationTime[_walletAddress] > 0) {
            require(
                block.timestamp >= lastRegistrationTime[_walletAddress] + REGISTRATION_COOLDOWN,
                "Must wait 3 months between charity registrations"
            );
        }

        // Check if wallet has any active/pending charities
        uint256[] storage walletCharities = charitiesByAddress[_walletAddress];
        for (uint256 i = 0; i < walletCharities.length; i++) {
            Charity storage existingCharity = charities[walletCharities[i]];
            require(
                !existingCharity.isActive && existingCharity.status != VerificationStatus.Pending,
                "Cannot register new charity while you have an active or pending charity"
            );
        }

        uint256 charityId = charityCount++;

        charities[charityId] = Charity({
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            walletAddress: _walletAddress,
            aiScore: 0,
            status: VerificationStatus.Pending,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0),
            totalDonationsReceived: 0,
            donorCount: 0,
            fundingGoal: _fundingGoal,
            deadline: _deadline,
            isActive: true,
            totalETHDonations: 0,
            totalUSDCDonations: 0,
            imageHashes: _imageHashes
        });

        charitiesByAddress[_walletAddress].push(charityId);
        lastRegistrationTime[_walletAddress] = block.timestamp;

        emit CharityRegistered(charityId, _walletAddress, _name, block.timestamp);

        return charityId;
    }

    /**
     * @notice Update AI vetting score for a charity
     * @param _charityId Charity ID
     * @param _score AI score (0-100)
     */
    function updateAiScore(uint256 _charityId, uint256 _score)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        require(_score <= 100, "Score must be 0-100");

        Charity storage charity = charities[_charityId];
        require(charity.status == VerificationStatus.Pending, "Charity already verified");

        uint256 oldScore = charity.aiScore;
        charity.aiScore = _score;

        emit AiScoreUpdated(_charityId, oldScore, _score, block.timestamp);

        // Automatic approval/rejection based on AI score
        if (_score >= minimumAiScore) {
            _verifyCharity(_charityId, VerificationStatus.Approved);
        } else {
            _verifyCharity(_charityId, VerificationStatus.Rejected);
        }
    }

    // Manual approval/rejection removed - now fully automatic based on AI score
    // Charities are automatically approved if score >= minimumAiScore
    // Charities are automatically rejected if score < minimumAiScore

    /**
     * @notice Suspend an approved charity
     * @param _charityId Charity ID to suspend
     */
    function suspendCharity(uint256 _charityId)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];
        require(
            charity.status == VerificationStatus.Approved,
            "Charity not approved"
        );

        VerificationStatus oldStatus = charity.status;
        charity.status = VerificationStatus.Suspended;
        charity.isActive = false;

        emit CharityStatusChanged(
            _charityId,
            oldStatus,
            VerificationStatus.Suspended,
            block.timestamp
        );
    }

    /**
     * @notice Record a donation to a charity (called by DonationManager)
     * @param _charityId Charity ID
     * @param _amount Donation amount
     * @param _token Token address (address(0) for ETH)
     */
    function recordDonation(uint256 _charityId, uint256 _amount, address _token)
        external
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];

        charity.totalDonationsReceived += _amount;
        charity.donorCount++;

        // Track ETH and USDC separately
        if (_token == address(0)) {
            charity.totalETHDonations += _amount;
        } else {
            // Assuming USDC token (can add validation if needed)
            charity.totalUSDCDonations += _amount;
        }

        emit DonationRecorded(
            _charityId,
            _amount,
            charity.totalDonationsReceived
        );
    }

    /**
     * @notice Internal function to verify charity
     * @param _charityId Charity ID
     * @param _status New status
     */
    function _verifyCharity(uint256 _charityId, VerificationStatus _status)
        private
    {
        Charity storage charity = charities[_charityId];
        VerificationStatus oldStatus = charity.status;

        charity.status = _status;
        charity.verifiedAt = block.timestamp;
        charity.verifiedBy = msg.sender;

        if (_status == VerificationStatus.Approved) {
            charity.isActive = true;
        } else {
            charity.isActive = false;
        }

        emit CharityVerified(_charityId, msg.sender, _status, block.timestamp);
        emit CharityStatusChanged(_charityId, oldStatus, _status, block.timestamp);
    }

    /**
     * @notice Update minimum AI score requirement
     * @param _newScore New minimum score
     */
    function setMinimumAiScore(uint256 _newScore)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_newScore <= 100, "Score must be 0-100");
        uint256 oldScore = minimumAiScore;
        minimumAiScore = _newScore;

        emit MinimumAiScoreUpdated(oldScore, _newScore);
    }

    // setRequiredApprovals removed - approval is now automatic based on AI score

    /**
     * @notice Add or update images for a charity campaign
     * @param _charityId Charity ID
     * @param _imageHashes Array of IPFS hashes for campaign images
     */
    function addCharityImages(uint256 _charityId, string[] memory _imageHashes)
        external
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];

        // Only charity wallet owner can add images
        require(
            msg.sender == charity.walletAddress,
            "Only charity owner can add images"
        );

        // Add new images to existing array
        for (uint256 i = 0; i < _imageHashes.length; i++) {
            charity.imageHashes.push(_imageHashes[i]);
        }

        emit CharityImagesAdded(_charityId, _imageHashes, block.timestamp);
    }

    /**
     * @notice Get charity details
     * @param _charityId Charity ID
     * @return Charity struct
     */
    function getCharity(uint256 _charityId)
        external
        view
        returns (Charity memory)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        return charities[_charityId];
    }

    /**
     * @notice Get all charity IDs by wallet address
     * @param _wallet Charity wallet address
     * @return Array of charity IDs
     */
    function getCharitiesByWallet(address _wallet)
        external
        view
        returns (uint256[] memory)
    {
        return charitiesByAddress[_wallet];
    }

    /**
     * @notice Check if charity is verified and active
     * @param _charityId Charity ID
     * @return bool True if verified and active
     */
    function isCharityVerified(uint256 _charityId)
        external
        view
        returns (bool)
    {
        if (_charityId >= charityCount) return false;
        Charity memory charity = charities[_charityId];
        return charity.status == VerificationStatus.Approved && charity.isActive;
    }

    /**
     * @notice Get total number of charities
     * @return Total charity count
     */
    function getTotalCharities() external view returns (uint256) {
        return charityCount;
    }

    /**
     * @notice Get separate ETH and USDC donations for a charity
     * @param _charityId Charity ID
     * @return ethAmount Total ETH donations in wei
     * @return usdcAmount Total USDC donations in USDC base units (6 decimals)
     */
    function getCharityDonationsByToken(uint256 _charityId)
        external
        view
        returns (uint256 ethAmount, uint256 usdcAmount)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity memory charity = charities[_charityId];
        return (charity.totalETHDonations, charity.totalUSDCDonations);
    }
}
