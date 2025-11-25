# Cointribute Deployment Guide

## Current Deployment Status

**Network**: Base Sepolia Testnet  
**Date**: November 25, 2025  
**Status**: ✅ **FULLY OPERATIONAL**

## Contract Addresses

### Production Contracts (Latest)

```
Network: Base Sepolia (Chain ID: 84532)
RPC: https://sepolia.base.org

CharityRegistry:  0xc8928b40C1A494E1f039665E6f0C2ce64681254a
VibeToken:        0xc2780b90e32aAf93f7829929ac3A234Bc49617B6
ImpactNFT:        0xc241E5103a6B1E404024ADbA170C4Ca81003B459
DonationManager:  0x2d70ECd4ee1010Ac4CE53b5a284eC0e3c96Ed748
USDC (Testnet):   0x036CbD53842c5426634e7929541eC2318f3dCF7e

Deployer Address: 0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4
```

### Contract Features

#### CharityRegistry v3.0
- ✅ Fully automatic AI verification (no manual approval)
- ✅ Multi-charity registration per wallet
- ✅ 3-month cooldown between registrations
- ✅ Active charity check (prevents multiple active campaigns)
- ✅ Minimum AI score: 60 for auto-approval
- ✅ Image upload support (IPFS hash storage)

#### Backend Services
- **URL**: http://localhost:3001
- **AI Model**: OpenAI GPT-4
- **Features**:
  - Real-time event listening
  - Automatic charity verification
  - CoinMarketCap price integration
  - Historical charity scanning

#### Frontend Application
- **URL**: http://localhost:3000
- **Framework**: Next.js 14 (App Router)
- **Web3**: Wagmi v2 + RainbowKit
- **Network**: Base Sepolia

## Deployment History

### v3.0 - November 25, 2025 (CURRENT)
**CharityRegistry**: `0xc8928b40C1A494E1f039665E6f0C2ce64681254a`

**Changes**:
- Removed multi-sig approval system
- Made AI verification fully automatic
- Score >= 60 auto-approves, < 60 auto-rejects
- Optimized gas usage (~343k gas per registration)

### v2.0 - November 24, 2025
**CharityRegistry**: `0x04b2176dd992CF1b3A50e3a0253fF4b2AD1E7790`

**Changes**:
- Added multi-charity per wallet support
- Implemented 3-month cooldown
- Added active charity check
- Added image upload capability

### v1.0 - November 22, 2025
**CharityRegistry**: `0x371bdAA80A977F16DEB9c56F5Bff47e717d60b95`

**Initial Features**:
- Single charity per wallet
- Manual multi-sig approval
- Basic AI scoring

## Deployment Steps

### Prerequisites

```bash
# Node.js >= 18
# Hardhat
# Base Sepolia ETH for gas
```

### Environment Setup

Create `.env` files in each directory:

#### contracts/.env
```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

#### backend/.env
```bash
RPC_URL=https://sepolia.base.org
ADMIN_PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=your_openai_api_key
COINMARKETCAP_API_KEY=your_cmc_api_key
PORT=3001
NODE_ENV=development
```

#### frontend/.env.local
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

### Deploy Contracts

```bash
cd contracts

# Compile
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify on Basescan
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Update Contract Addresses

After deployment, update addresses in:

1. **Frontend**: `frontend/lib/contracts/addresses.ts`
2. **Backend**: `backend/src/config/contracts.ts`

### Copy ABIs

```bash
# Copy CharityRegistry ABI to frontend
cp contracts/artifacts/contracts/CharityRegistry.sol/CharityRegistry.json \
   frontend/lib/contracts/CharityRegistry.json
```

### Start Services

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## Verification

### Contract Verification on Basescan

```bash
# CharityRegistry
npx hardhat verify --network baseSepolia \
  0xc8928b40C1A494E1f039665E6f0C2ce64681254a \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4

# VibeToken
npx hardhat verify --network baseSepolia \
  0xc2780b90e32aAf93f7829929ac3A234Bc49617B6 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4

# ImpactNFT
npx hardhat verify --network baseSepolia \
  0xc241E5103a6B1E404024ADbA170C4Ca81003B459 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4 \
  "https://api.cointribute.xyz/metadata"

# DonationManager
npx hardhat verify --network baseSepolia \
  0x2d70ECd4ee1010Ac4CE53b5a284eC0e3c96Ed748 \
  0xc8928b40C1A494E1f039665E6f0C2ce64681254a \
  0xc2780b90e32aAf93f7829929ac3A234Bc49617B6 \
  0xc241E5103a6B1E404024ADbA170C4Ca81003B459 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4
```

### System Health Checks

```bash
# Check backend
curl http://localhost:3001/health

# Check if backend is listening
# Look for: "👂 Starting to listen for charity registrations..."

# Test registration
# 1. Go to http://localhost:3000/register-charity
# 2. Fill form and submit
# 3. Check backend logs for AI verification
# 4. Charity should be approved within 5-10 seconds
```

## Troubleshooting

### Backend Not Detecting Events

```bash
# Check contract address matches
cat backend/src/config/contracts.ts

# Restart backend
pkill -f "tsx watch"
cd backend && npm run dev
```

### Frontend Shows Old Contract

```bash
# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or clear cache and restart
cd frontend
rm -rf .next
npm run dev
```

### Transaction Failures

```bash
# Check gas estimation
cd backend
npx tsx scripts/testNewContract.ts

# Should show: Gas estimate: ~343k
```

## Production Deployment (Future)

### Mainnet Deployment Steps

1. Update `hardhat.config.js` with mainnet RPC
2. Ensure sufficient ETH for deployment (~0.1 ETH)
3. Deploy contracts: `npx hardhat run scripts/deploy.js --network base`
4. Verify contracts on Basescan
5. Update all contract addresses in frontend/backend
6. Run comprehensive tests
7. Monitor first transactions closely

### Security Considerations

- [ ] External security audit
- [ ] Bug bounty program
- [ ] Multi-sig admin wallet
- [ ] Emergency pause functionality
- [ ] Rate limiting on backend
- [ ] IPFS pinning service
- [ ] Monitoring and alerting

---

*Last updated: November 25, 2025*
*For issues, check logs in backend terminal and browser console*
