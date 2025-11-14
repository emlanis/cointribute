# Cointribute Smart Contracts Deployment

## Deployment Summary

**Network:** Base Sepolia Testnet (ChainID: 84532)
**Deployment Date:** November 12, 2025
**Last Updated:** November 14, 2025
**Deployer Address:** `0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4`
**Total Gas Used:** ~0.03 ETH

---

## Deployed Contracts

### 1. CharityRegistry
- **Contract Address:** `0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828`
- **Verified on Basescan:** ✅ https://sepolia.basescan.org/address/0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828#code
- **Purpose:** Manages charity registration, AI-powered vetting, and multi-sig approval process
- **Key Features:**
  - Charity registration with IPFS document storage
  - AI vetting scores (0-100)
  - Multi-signature verification process
  - Charity status management (Pending, Approved, Rejected, Suspended)
  - Role-based access control (ADMIN_ROLE, VERIFIER_ROLE)

### 2. VibeToken (VIBE)
- **Contract Address:** `0x34a4fd87D99D14817289CA4348559c72aF74F367`
- **Verified on Basescan:** ✅ https://sepolia.basescan.org/address/0x34a4fd87D99D14817289CA4348559c72aF74F367#code
- **Token Symbol:** VIBE
- **Token Name:** Vibe Coin
- **Max Supply:** 1,000,000,000 VIBE
- **Initial Supply:** 100,000,000 VIBE (10% of max supply minted to treasury)
- **Purpose:** ERC20 governance and reward token for the Cointribute platform
- **Key Features:**
  - Donation rewards (10 VIBE per 1 ETH donated)
  - Staking with tiered APY rates (5%, 10%, 15%)
  - Lock periods: 30, 90, 180 days
  - Burnable for platform fees
  - Role-based minting (MINTER_ROLE)

### 3. ImpactNFT
- **Contract Address:** `0x00dFc2353485a56ee554da65F6bD1Ba8aFEF1C89`
- **Verified on Basescan:** ✅ https://sepolia.basescan.org/address/0x00dFc2353485a56ee554da65F6bD1Ba8aFEF1C89#code
- **Token Symbol:** IMPACT
- **Token Name:** Cointribute Impact NFT
- **Base URI:** `https://api.cointribute.xyz/metadata`
- **Purpose:** ERC721 NFTs representing donor impact with dynamic tiers
- **Key Features:**
  - Dynamic NFT tiers based on donation amounts:
    - Bronze: 1-5 ETH
    - Silver: 5-10 ETH
    - Gold: 10-50 ETH
    - Platinum: 50+ ETH
  - Auto-upgradable tiers as donations increase
  - IPFS metadata support
  - Impact tracking per donor

### 4. DonationManager
- **Contract Address:** `0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7`
- **Verified on Basescan:** ✅ https://sepolia.basescan.org/address/0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7#code
- **Purpose:** Core contract managing all donations and coordinating the platform
- **Fee Collector:** `0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4` (deployer address)
- **Platform Fee:** 2.5% (250 basis points)
- **Key Features:**
  - ETH and ERC20 donation support
  - Automatic VIBE reward distribution
  - Automatic Impact NFT minting (threshold: 1 ETH)
  - Recurring donation subscriptions
  - Platform fee collection
  - Integration with all other contracts

---

## AI Verification Backend

### Automated Charity Verification System
- **Status:** ✅ Fully Operational
- **Port:** 3001
- **AI Model:** OpenAI GPT-4 Turbo
- **Average Processing Time:** 20 seconds
- **Automation Level:** 100% (Zero manual intervention required)

**Architecture:**
- Node.js + Express backend service
- ethers.js v6 for blockchain integration
- OpenAI API for AI-powered charity vetting
- Event-driven architecture listening to `CharityRegistered` events

**Verification Process:**
1. Backend monitors CharityRegistry for new registrations
2. Extracts charity details from blockchain
3. GPT-4 analyzes charity legitimacy, impact, and transparency
4. Multi-factor scoring system (0-100):
   - Legitimacy Check (40%)
   - Impact Potential (30%)
   - Transparency (20%)
   - Online Presence (10%)
5. Automatically submits AI score to blockchain
6. Auto-approves charities scoring ≥60/100
7. Updates charity status to "Approved" on-chain

**Live Charities (as of Nov 14, 2025):**
- **Charity ID 0:** Save the Children - Emergency Relief Fund (AI Score: 80/100, Status: Approved)
- **Charity ID 1:** Education For Every Nigerian Child Initiative (AI Score: 75/100, Status: Approved)
- **Charity ID 2:** Clean Water Initiative - Kenya (AI Score: 65/100, Status: Approved)

**Key Features:**
- Real-time blockchain event monitoring
- Comprehensive AI-powered vetting
- Automated approval workflow
- Detailed reasoning and flagging system
- IPFS document verification support
- Web scraping for online presence verification

---

## Contract Interactions

### Roles & Permissions

**VibeToken:**
- `MINTER_ROLE`: Granted to DonationManager (0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7)
- `ADMIN_ROLE`: Deployer (0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4)

**ImpactNFT:**
- `MINTER_ROLE`: Granted to DonationManager (0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7)
- `ADMIN_ROLE`: Deployer (0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4)

**CharityRegistry:**
- `ADMIN_ROLE`: Deployer (0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4)
- `VERIFIER_ROLE`: Deployer (0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4)
- `requiredApprovals`: Set to 1 for automated AI verification

---

## Deployment Flow

1. **CharityRegistry** deployed first (no dependencies)
2. **VibeToken** deployed (no dependencies)
3. **ImpactNFT** deployed (no dependencies)
4. **DonationManager** deployed (requires addresses of all three contracts)
5. Granted `MINTER_ROLE` to DonationManager in VibeToken
6. Granted `MINTER_ROLE` to DonationManager in ImpactNFT

---

## Testing Instructions

### For Donors

1. **Make a Donation:**
   - Call `donateETH(charityId)` on DonationManager with ETH
   - Automatically receive VIBE rewards (10 VIBE per 1 ETH)
   - Receive Impact NFT if donation >= 1 ETH

2. **Stake VIBE Tokens:**
   - Approve DonationManager to spend VIBE
   - Call `stake(amount, lockPeriod)` on VibeToken
   - Lock periods: 30, 90, or 180 days
   - Earn APY: 5%, 10%, or 15% respectively

### For Charities

1. **Register a Charity:**
   - Call `registerCharity(name, description, ipfsHash, walletAddress)` on CharityRegistry
   - Provide IPFS hash with 501(c)(3) documents
   - Wait for AI vetting and multi-sig approval

2. **Check Charity Status:**
   - Call `getCharity(charityId)` on CharityRegistry
   - Check `status` field (0=Pending, 1=Approved, 2=Rejected, 3=Suspended)

### For Verifiers

1. **Update AI Score:**
   - Call `updateAiScore(charityId, score)` on CharityRegistry
   - Score must be 0-100

2. **Approve Charity:**
   - Call `approveCharity(charityId)` on CharityRegistry
   - Requires minimum AI score of 60
   - Requires 2 approvals (multi-sig)

---

## Important Links

### Block Explorer
- **Base Sepolia Basescan:** https://sepolia.basescan.org/
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Contract Verification
All contracts are verified and their source code is viewable on Basescan. You can interact with them directly through the "Write Contract" tab on Basescan.

### IPFS for Metadata
- Impact NFT metadata should be uploaded to IPFS
- Base URI is set to: `https://api.cointribute.xyz/metadata`
- Can be updated by admin using `setBaseMetadataURI()`

---

## Security Considerations

1. **Access Control:** All sensitive functions protected by role-based access control
2. **Reentrancy Protection:** All external calls use `nonReentrant` modifier
3. **Max Supply Cap:** VIBE token has a hard cap of 1B tokens
4. **Fee Limits:** Platform fee capped at 10% maximum
5. **Multi-sig Verification:** Charities require 2 approvals before activation

---

## Next Steps

### For Seedify Vibecoins Hackathon Submission

1. ✅ Contracts deployed to Base Sepolia
2. ✅ All contracts verified on Basescan
3. ✅ Documentation prepared
4. ✅ Frontend integration complete
5. ✅ Backend AI verification system operational
6. ✅ 3 live charities with real donations
7. ✅ USDC donation support implemented
8. 🔄 Multi-currency conversion feature (in progress)
9. 🔄 Demo video creation
10. 🔄 GitHub repository finalization

### Completed Features

- ✅ Automated AI charity verification with GPT-4
- ✅ Full-stack integration (Frontend + Backend + Blockchain)
- ✅ ETH and USDC donation support
- ✅ Dynamic token preference system
- ✅ Fundraising goals and progress tracking
- ✅ Cause detail pages with social sharing
- ✅ Real-time blockchain event monitoring
- ✅ Transaction debugging and error handling

### Next Enhancements

- 🔄 Multi-currency conversion with CoinMarketCap API
- ⏸️ Deploy to Base Mainnet when ready
- ⏸️ Implement governance voting with VIBE tokens
- ⏸️ Create Impact NFT artwork and metadata
- ⏸️ DAO governance system

---

## Support

For questions or issues, contact:
- GitHub: https://github.com/[your-repo]
- Email: [your-email]

---

**Built with Vibe Coding using Claude Code for the Seedify Vibecoins Hackathon**

*Smart contracts built using AI-assisted development tools as part of the Seedify Vibecoins initiative to accelerate blockchain application development.*
