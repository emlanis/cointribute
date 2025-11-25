# Cointribute Deployment Guide

## Current Deployment Status

**Network**: Base Sepolia Testnet
**Date**: November 25, 2025
**Version**: v4.0 - Smart Fund Release System
**Status**: ✅ **FULLY OPERATIONAL**

## Contract Addresses

### Production Contracts (Latest)

```
Network: Base Sepolia (Chain ID: 84532)
RPC: https://sepolia.base.org

CharityRegistry:  0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0
VibeToken:        0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47
ImpactNFT:        0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213
DonationManager:  0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2
USDC (Testnet):   0x036CbD53842c5426634e7929541eC2318f3dCF7e

Deployer Address: 0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4
```

### Contract Features

#### CharityRegistry v4.0
- ✅ Fully automatic AI verification (no manual approval)
- ✅ Multi-charity registration per wallet
- ✅ 3-month cooldown between registrations
- ✅ Active charity check (prevents multiple active campaigns)
- ✅ **REQUIRED campaign deadlines** (no longer optional)
- ✅ Minimum AI score: 60 for auto-approval
- ✅ Image upload support (IPFS hash storage)

#### DonationManager v4.0
- ✅ **Smart escrow system** - funds held until release
- ✅ **Automatic release on goal reached** (even before deadline)
- ✅ **Automatic release on deadline passed** (regardless of goal)
- ✅ Separate ETH and USDC fund tracking
- ✅ Platform fee collection (2.5%) at release time
- ✅ Public `releaseFunds()` function
- ✅ `getCharityFunds()` view for transparency
- ✅ `finalizeCharity()` admin function
- ✅ Multi-token support (ETH + USDC)

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

### v4.0 - November 25, 2025 (CURRENT)
**CharityRegistry**: `0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0`
**DonationManager**: `0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2`
**VibeToken**: `0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47`
**ImpactNFT**: `0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213`

**Major Changes**:
- **Smart Fund Holding**: Donations held in escrow until release
- **Dual Release Mechanism**: Funds released when goal reached OR deadline passed
- **Required Deadlines**: All campaigns must set a deadline (no longer optional)
- **Transparent Fund Tracking**: `CharityFunds` struct for each charity
- **Public Release Function**: Anyone can trigger `releaseFunds()` when conditions met
- **Enhanced UI**: Fund release explanation section on cause pages

### v3.0 - November 25, 2025
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
# CharityRegistry v4.0
npx hardhat verify --network baseSepolia \
  0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4

# VibeToken
npx hardhat verify --network baseSepolia \
  0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4

# ImpactNFT
npx hardhat verify --network baseSepolia \
  0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213 \
  0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4 \
  "https://api.cointribute.xyz/metadata"

# DonationManager v4.0
npx hardhat verify --network baseSepolia \
  0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2 \
  0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0 \
  0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47 \
  0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213 \
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
