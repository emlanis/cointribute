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
        uint256 totalDonationsReceived;
        uint256 donorCount;
        bool isActive;
    }

    // Storage
    mapping(uint256 => Charity) public charities;
    mapping(address => uint256) public charityIdByAddress;
    mapping(address => bool) public isRegistered;

    uint256 public charityCount;
    uint256 public minimumAiScore = 60; // Minimum score to be eligible for approval
    uint256 public requiredApprovals = 2; // Multi-sig requirement

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
     * @return charityId The ID of the newly registered charity
     */
    function registerCharity(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        address _walletAddress
    ) external nonReentrant returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_walletAddress != address(0), "Invalid wallet address");
        require(!isRegistered[_walletAddress], "Charity already registered");

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
            isActive: true
        });

        charityIdByAddress[_walletAddress] = charityId;
        isRegistered[_walletAddress] = true;

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
        uint256 oldScore = charity.aiScore;
        charity.aiScore = _score;

        emit AiScoreUpdated(_charityId, oldScore, _score, block.timestamp);
    }

    /**
     * @notice Approve charity verification (multi-sig)
     * @param _charityId Charity ID to approve
     */
    function approveCharity(uint256 _charityId)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];
        require(
            charity.status == VerificationStatus.Pending,
            "Charity not pending"
        );
        require(
            charity.aiScore >= minimumAiScore,
            "AI score below minimum"
        );
        require(!approvals[_charityId][msg.sender], "Already approved");

        approvals[_charityId][msg.sender] = true;
        approvalCount[_charityId]++;

        if (approvalCount[_charityId] >= requiredApprovals) {
            _verifyCharity(_charityId, VerificationStatus.Approved);
        }
    }

    /**
     * @notice Reject a charity application
     * @param _charityId Charity ID to reject
     */
    function rejectCharity(uint256 _charityId)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];
        require(
            charity.status == VerificationStatus.Pending,
            "Charity not pending"
        );

        _verifyCharity(_charityId, VerificationStatus.Rejected);
    }

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
     */
    function recordDonation(uint256 _charityId, uint256 _amount)
        external
    {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];

        charity.totalDonationsReceived += _amount;
        charity.donorCount++;

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

    /**
     * @notice Update required approvals for verification
     * @param _newCount New approval count
     */
    function setRequiredApprovals(uint256 _newCount)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_newCount > 0, "Must require at least 1 approval");
        uint256 oldCount = requiredApprovals;
        requiredApprovals = _newCount;

        emit RequiredApprovalsUpdated(oldCount, _newCount);
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
     * @notice Get charity ID by wallet address
     * @param _wallet Charity wallet address
     * @return Charity ID
     */
    function getCharityIdByWallet(address _wallet)
        external
        view
        returns (uint256)
    {
        require(isRegistered[_wallet], "Charity not registered");
        return charityIdByAddress[_wallet];
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
}
