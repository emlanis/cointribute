// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ImpactNFT
 * @notice ERC721 NFTs for major donors on the Cointribute platform
 * @dev Dynamic NFTs with metadata based on donation impact
 */
contract ImpactNFT is ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Impact tiers
    enum ImpactTier {
        Bronze, // 1-5 ETH
        Silver, // 5-10 ETH
        Gold, // 10-50 ETH
        Platinum // 50+ ETH
    }

    // NFT metadata structure
    struct ImpactMetadata {
        address donor;
        uint256 charityId;
        uint256 totalImpact; // Total donation amount
        ImpactTier tier;
        uint256 mintedAt;
        uint256 lastUpdated;
        string ipfsMetadataHash;
    }

    // Storage
    mapping(uint256 => ImpactMetadata) public nftMetadata;
    mapping(address => uint256[]) public donorNFTs;
    mapping(address => uint256) public totalImpactByDonor;

    uint256 public tokenIdCounter;
    string public baseMetadataURI;

    // Tier thresholds (in wei)
    uint256 public constant BRONZE_THRESHOLD = 1 ether;
    uint256 public constant SILVER_THRESHOLD = 5 ether;
    uint256 public constant GOLD_THRESHOLD = 10 ether;
    uint256 public constant PLATINUM_THRESHOLD = 50 ether;

    // Events
    event ImpactNFTMinted(
        uint256 indexed tokenId,
        address indexed donor,
        uint256 indexed charityId,
        uint256 impact,
        ImpactTier tier
    );

    event ImpactUpdated(
        uint256 indexed tokenId,
        uint256 oldImpact,
        uint256 newImpact,
        ImpactTier oldTier,
        ImpactTier newTier
    );

    event MetadataURIUpdated(uint256 indexed tokenId, string newURI);
    event BaseURIUpdated(string newBaseURI);

    /**
     * @notice Constructor
     * @param _admin Admin address
     * @param _baseURI Base URI for metadata
     */
    constructor(address _admin, string memory _baseURI)
        ERC721("Cointribute Impact NFT", "IMPACT")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);

        baseMetadataURI = _baseURI;
    }

    /**
     * @notice Mint Impact NFT for a donor
     * @param _donor Donor address
     * @param _charityId Charity ID
     * @param _impact Donation amount
     * @return tokenId The ID of the minted NFT
     */
    function mintImpactNFT(
        address _donor,
        uint256 _charityId,
        uint256 _impact
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(_donor != address(0), "Invalid donor");
        require(_impact >= BRONZE_THRESHOLD, "Impact below threshold");

        uint256 tokenId = tokenIdCounter++;

        // Determine tier
        ImpactTier tier = _calculateTier(_impact);

        // Store metadata
        nftMetadata[tokenId] = ImpactMetadata({
            donor: _donor,
            charityId: _charityId,
            totalImpact: _impact,
            tier: tier,
            mintedAt: block.timestamp,
            lastUpdated: block.timestamp,
            ipfsMetadataHash: ""
        });

        // Mint NFT
        _safeMint(_donor, tokenId);

        // Set token URI
        string memory uri = _generateTokenURI(tokenId);
        _setTokenURI(tokenId, uri);

        // Update tracking
        donorNFTs[_donor].push(tokenId);
        totalImpactByDonor[_donor] += _impact;

        emit ImpactNFTMinted(tokenId, _donor, _charityId, _impact, tier);

        return tokenId;
    }

    /**
     * @notice Update impact for an existing NFT
     * @param _tokenId Token ID
     * @param _additionalImpact Additional donation amount
     */
    function updateImpact(uint256 _tokenId, uint256 _additionalImpact)
        external
        onlyRole(MINTER_ROLE)
    {
        require(_ownerOf(_tokenId) != address(0), "Token doesn't exist");

        ImpactMetadata storage metadata = nftMetadata[_tokenId];

        uint256 oldImpact = metadata.totalImpact;
        ImpactTier oldTier = metadata.tier;

        metadata.totalImpact += _additionalImpact;
        metadata.tier = _calculateTier(metadata.totalImpact);
        metadata.lastUpdated = block.timestamp;

        // Update donor total impact
        totalImpactByDonor[metadata.donor] += _additionalImpact;

        // Update metadata URI if tier changed
        if (metadata.tier != oldTier) {
            string memory newURI = _generateTokenURI(_tokenId);
            _setTokenURI(_tokenId, newURI);
            emit MetadataURIUpdated(_tokenId, newURI);
        }

        emit ImpactUpdated(
            _tokenId,
            oldImpact,
            metadata.totalImpact,
            oldTier,
            metadata.tier
        );
    }

    /**
     * @notice Set IPFS metadata hash for a token
     * @param _tokenId Token ID
     * @param _ipfsHash IPFS hash
     */
    function setIPFSMetadata(uint256 _tokenId, string memory _ipfsHash)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_ownerOf(_tokenId) != address(0), "Token doesn't exist");

        nftMetadata[_tokenId].ipfsMetadataHash = _ipfsHash;
        nftMetadata[_tokenId].lastUpdated = block.timestamp;

        // Update token URI
        string memory newURI = string(
            abi.encodePacked("ipfs://", _ipfsHash)
        );
        _setTokenURI(_tokenId, newURI);

        emit MetadataURIUpdated(_tokenId, newURI);
    }

    /**
     * @notice Calculate impact tier based on donation amount
     * @param _impact Donation amount
     * @return tier Impact tier
     */
    function _calculateTier(uint256 _impact)
        private
        pure
        returns (ImpactTier)
    {
        if (_impact >= PLATINUM_THRESHOLD) {
            return ImpactTier.Platinum;
        } else if (_impact >= GOLD_THRESHOLD) {
            return ImpactTier.Gold;
        } else if (_impact >= SILVER_THRESHOLD) {
            return ImpactTier.Silver;
        } else {
            return ImpactTier.Bronze;
        }
    }

    /**
     * @notice Generate token URI based on metadata
     * @param _tokenId Token ID
     * @return uri Token URI
     */
    function _generateTokenURI(uint256 _tokenId)
        private
        view
        returns (string memory)
    {
        ImpactMetadata memory metadata = nftMetadata[_tokenId];

        // If IPFS hash is set, use it
        if (bytes(metadata.ipfsMetadataHash).length > 0) {
            return string(abi.encodePacked("ipfs://", metadata.ipfsMetadataHash));
        }

        // Otherwise use base URI + tier + tokenId
        string memory tierString = _getTierString(metadata.tier);
        return
            string(
                abi.encodePacked(
                    baseMetadataURI,
                    "/",
                    tierString,
                    "/",
                    _tokenId.toString(),
                    ".json"
                )
            );
    }

    /**
     * @notice Get tier as string
     * @param _tier Impact tier
     * @return Tier string
     */
    function _getTierString(ImpactTier _tier)
        private
        pure
        returns (string memory)
    {
        if (_tier == ImpactTier.Platinum) return "platinum";
        if (_tier == ImpactTier.Gold) return "gold";
        if (_tier == ImpactTier.Silver) return "silver";
        return "bronze";
    }

    /**
     * @notice Set base metadata URI
     * @param _newBaseURI New base URI
     */
    function setBaseMetadataURI(string memory _newBaseURI)
        external
        onlyRole(ADMIN_ROLE)
    {
        baseMetadataURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    /**
     * @notice Get all NFTs owned by a donor
     * @param _donor Donor address
     * @return uint256[] Array of token IDs
     */
    function getDonorNFTs(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorNFTs[_donor];
    }

    /**
     * @notice Get NFT metadata
     * @param _tokenId Token ID
     * @return ImpactMetadata struct
     */
    function getMetadata(uint256 _tokenId)
        external
        view
        returns (ImpactMetadata memory)
    {
        require(_ownerOf(_tokenId) != address(0), "Token doesn't exist");
        return nftMetadata[_tokenId];
    }

    /**
     * @notice Get impact tier for an amount
     * @param _amount Donation amount
     * @return tier Impact tier
     */
    function getTierForAmount(uint256 _amount)
        external
        pure
        returns (ImpactTier)
    {
        return _calculateTier(_amount);
    }

    /**
     * @notice Get total impact by donor
     * @param _donor Donor address
     * @return Total impact amount
     */
    function getDonorTotalImpact(address _donor)
        external
        view
        returns (uint256)
    {
        return totalImpactByDonor[_donor];
    }

    /**
     * @notice Override supportsInterface for AccessControl + ERC721
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Prevent transfers (soulbound) - optional, can be enabled later
     * @dev Uncomment to make NFTs non-transferable
     */
    /*
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("ImpactNFTs are soulbound");
        }
        return super._update(to, tokenId, auth);
    }
    */
}
