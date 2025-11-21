# Smart Contracts Overview

Cointribute's smart contract architecture consists of four main contracts that work together to create a transparent, efficient, and rewarding donation ecosystem.

## Deployed Contracts

All contracts are deployed and verified on Base Sepolia testnet.

| Contract | Address | Purpose |
|----------|---------|----------|
| **CharityRegistry** | 0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828 | Charity management & verification |
| **DonationManager** | 0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7 | Donation processing & rewards |
| **VibeToken** | 0x34a4fd87D99D14817289CA4348559c72aF74F367 | Platform governance token |
| **ImpactNFT** | 0x00dFc2353485a56ee554da65F6bD1Ba8aFEF1C89 | Donor recognition NFTs |

## Technical Specifications

### Compiler & Framework
- **Solidity Version**: 0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin v5.4.0
- **Network**: Base Sepolia (Chain ID: 84532)

## Core Components

### 1. CharityRegistry
The central registry for all charities on the platform.

**Key Features:**
- Charity registration with IPFS metadata
- AI-powered vetting scores (0-100)
- Multi-signature approval process
- Status management (Pending/Approved/Rejected/Suspended)

### 2. DonationManager
Handles all donation logic and reward distribution.

**Key Features:**
- ETH and ERC20 token donations
- Automatic VIBE reward calculation (10 VIBE per 1 ETH)
- Impact NFT minting (threshold: 1 ETH)
- Platform fee collection (2.5%)

### 3. VibeToken (VIBE)
ERC20 governance and reward token.

**Tokenomics:**
- **Max Supply**: 1,000,000,000 VIBE
- **Initial Supply**: 100,000,000 VIBE
- **Reward Rate**: 10 VIBE per 1 ETH donated
- **Staking APY**: 5% (30d), 10% (90d), 15% (180d)

### 4. ImpactNFT
Dynamic NFTs representing donor impact.

**Tier System:**
| Tier | Donation Range | NFT Features |
|------|---------------|--------------|
| Bronze | 1-5 ETH | Basic design |
| Silver | 5-10 ETH | Enhanced design |
| Gold | 10-50 ETH | Premium design |
| Platinum | 50+ ETH | Exclusive design |
