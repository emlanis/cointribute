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
Handles donation processing, fund distribution, and milestone releases.

### VibeToken.sol
ERC20 governance and reward token with staking capabilities.

### ImpactNFT.sol
ERC721 NFTs for high-impact donors with dynamic metadata.

## Current Deployment

**Network**: Base Sepolia Testnet
**Status**: ✅ **FULLY OPERATIONAL**
**Last Updated**: November 25, 2025

### Live Contract Addresses

```
CharityRegistry:  0xc8928b40C1A494E1f039665E6f0C2ce64681254a
VibeToken:        0xc2780b90e32aAf93f7829929ac3A234Bc49617B6
ImpactNFT:        0xc241E5103a6B1E404024ADbA170C4Ca81003B459
DonationManager:  0x2d70ECd4ee1010Ac4CE53b5a284eC0e3c96Ed748
```

### What's New in v3.0
- ✅ **Fully automatic AI verification** - No manual approval needed!
- ✅ **5-10 second approval time** - Lightning fast
- ✅ **Multi-charity per wallet** - With smart 3-month cooldown
- ✅ **Gas optimized** - Only ~343k gas per registration
- ✅ **Zero pending charities** - Everything processes automatically

[View on Base Sepolia Basescan →](https://sepolia.basescan.org/address/0xc8928b40C1A494E1f039665E6f0C2ce64681254a)

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
