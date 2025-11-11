# Cointribute - Smart Charity Platform

> AI-powered blockchain donation platform built for Seedify Vibecoins Hackathon on DoraHacks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Base Network](https://img.shields.io/badge/Network-Base-blue.svg)](https://base.org)

## Overview

Cointribute is a transparent, AI-vetted charity donation platform built on Base (Ethereum L2). It combines smart contracts, artificial intelligence, and blockchain technology to create trust and transparency in charitable giving.

## Key Features

- 🤖 **AI-Powered Vetting**: Automated charity verification using advanced AI scoring
- 🔗 **Smart Contract Donations**: Transparent, immutable donation tracking
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
# Start local blockchain
cd contracts && pnpm hardhat node

# Deploy contracts to local network
pnpm hardhat run scripts/deploy.ts --network localhost

# Start backend
cd ../backend && pnpm dev

# Start frontend
cd ../frontend && pnpm dev
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
