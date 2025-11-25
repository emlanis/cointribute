# Cointribute - Smart Charity Platform

> AI-powered blockchain donation platform built for Seedify Vibecoins Hackathon on DoraHacks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Base Network](https://img.shields.io/badge/Network-Base-blue.svg)](https://base.org)

## Overview

Cointribute is a transparent, AI-vetted charity donation platform built on Base (Ethereum L2). It combines smart contracts, artificial intelligence, and blockchain technology to create trust and transparency in charitable giving.

## Key Features

- 🤖 **Fully Automatic AI Verification**: Charities verified and approved in **5-10 seconds**
  - AI scores 0-100 using GPT-4
  - Score >= 60 → Automatic approval ✅
  - Score < 60 → Automatic rejection ❌
- 🔒 **Smart Fund Escrow**: Donations held securely until release
  - Funds released when **goal reached** OR **deadline passed**
  - Transparent fund tracking per campaign
  - Platform fee (2.5%) deducted at release
- ⏰ **Required Campaign Deadlines**: All campaigns must set a target deadline
  - Ensures accountability and time-bound goals
  - Automatic fund release on deadline
- 🔗 **Smart Contract Donations**: Transparent, immutable donation tracking
- 🏢 **Multi-Charity Support**: Same wallet can register multiple charities
  - 3-month cooldown between registrations
  - Smart anti-spam protection
- 💎 **Vibe Coins (VIBE)**: Impact verification tokens rewarding donors
- 🎨 **Impact NFTs**: Dynamic NFTs for major contributors
- 📊 **Real-Time Tracking**: Live donation flow visualization
- 🏆 **Donor Reputation**: Build your philanthropic portfolio

## Project Structure

```
cointribute/
├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── contracts/     # Contract source files
│   ├── scripts/       # Deployment scripts
│   └── test/          # Contract tests
├── frontend/          # Next.js 14 + TypeScript web app
├── backend/           # Node.js API + AI integration
├── ai-prompts/        # AI prompt documentation
├── docs/              # Additional documentation
└── README.md
```

## Tech Stack

### Blockchain
- **Chain**: Base (Ethereum L2)
- **Framework**: Hardhat
- **Language**: Solidity ^0.8.20
- **Standards**: ERC20, ERC721, ERC165

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + RainbowKit
- **State**: Zustand

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: IPFS (Pinata)
- **AI**: OpenAI API

### Integrations
- Alchemy/QuickNode RPC
- The Graph Protocol
- Push Protocol
- Dune Analytics

## Smart Contracts

### CharityRegistry.sol
Manages charity registration, verification, and AI vetting scores.

### DonationManager.sol
Handles donation processing with smart escrow, automatic fund releases when goal reached or deadline passed, and platform fee collection.

### VibeToken.sol
ERC20 governance and reward token with staking capabilities.

### ImpactNFT.sol
ERC721 NFTs for high-impact donors with dynamic metadata.

## Current Deployment

**Network**: Base Sepolia Testnet
**Version**: v4.0 - Smart Fund Release System
**Status**: ✅ **FULLY OPERATIONAL**
**Last Updated**: November 25, 2025

### Live Contract Addresses

```
CharityRegistry:  0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0
VibeToken:        0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47
ImpactNFT:        0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213
DonationManager:  0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2
```

### What's New in v4.0
- ✅ **Smart Fund Escrow** - Donations held until goal OR deadline
- ✅ **Dual Release Mechanism** - Automatic release when either condition met
- ✅ **Required Deadlines** - All campaigns must set a deadline
- ✅ **Transparent Fund Tracking** - View held funds per charity
- ✅ **Fully automatic AI verification** - No manual approval needed!
- ✅ **5-10 second approval time** - Lightning fast
- ✅ **Multi-charity per wallet** - With smart 3-month cooldown
- ✅ **Gas optimized** - Only ~343k gas per registration

[View CharityRegistry on Basescan →](https://sepolia.basescan.org/address/0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0)
[View DonationManager on Basescan →](https://sepolia.basescan.org/address/0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2)

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/emlanis/cointribute.git
cd cointribute

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Development

```bash
# Terminal 1: Backend (with AI verification)
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Frontend will be available at http://localhost:3000
# Backend API at http://localhost:3001
```

### Testing the System

1. **Register a Charity**
   - Go to http://localhost:3000/register-charity
   - Connect your wallet (Base Sepolia)
   - Fill in charity details
   - Submit transaction

2. **Watch AI Verification** (in backend terminal)
   - AI analyzes charity
   - Scores 0-100
   - Automatically approves if >= 60

3. **View Results**
   - Refresh http://localhost:3000/causes
   - Charity should be approved within 5-10 seconds!

### Deployment to Testnet

```bash
# Deploy all contracts to Base Sepolia
cd contracts
npx hardhat run scripts/deploy.js --network baseSepolia

# Update contract addresses in:
# - frontend/lib/contracts/addresses.ts
# - backend/src/config/contracts.ts

# Copy ABIs
cp contracts/artifacts/contracts/CharityRegistry.sol/CharityRegistry.json \
   frontend/lib/contracts/CharityRegistry.json

# Restart services to pick up changes
```

## Deployment

### Testnet (Base Sepolia)
```bash
cd contracts
pnpm hardhat run scripts/deploy.ts --network base-sepolia
```

### Mainnet (Base)
```bash
cd contracts
pnpm hardhat run scripts/deploy.ts --network base-mainnet
```

## Revenue Model

- 2.5% platform fee on donations
- Premium charity verification
- Sponsored placements
- Vibe Coin staking rewards
- NFT marketplace royalties
- Data analytics API

## Security

- OpenZeppelin contracts
- Multi-sig governance
- Comprehensive test coverage
- External audits (planned)

## Documentation

### Quick Links
- **[PROGRESS.md](./PROGRESS.md)** - Development progress and recent achievements
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide and contract addresses
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status and metrics

### Additional Resources
- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [Contract Documentation](./docs/CONTRACTS.md)
- [AI Prompts Used](./ai-prompts/prompts.md)

## Contributing

This project is built for the Seedify Vibecoins Hackathon. For contributions after the hackathon, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Hackathon Submission

**Event**: Seedify Vibecoins Hackathon @ DoraHacks
**Category**: DeFi / Social Impact
**Built With**: AI-assisted development (Vibe Coding)

---

Built with 💙 using AI-assisted development for the Seedify Vibecoins Hackathon
