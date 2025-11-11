# Cointribute Smart Contracts

Solidity smart contracts for the Cointribute donation platform on Base (Ethereum L2).

## Contracts Overview

### 1. CharityRegistry.sol
Manages charity registration and AI-powered vetting.

**Key Features:**
- Charity registration with IPFS metadata
- AI vetting score storage (0-100)
- Multi-sig approval process
- Verification status management (Pending, Approved, Rejected, Suspended)
- Role-based access control (VERIFIER_ROLE, ADMIN_ROLE)
- Donation tracking per charity

**Main Functions:**
```solidity
registerCharity(name, description, ipfsHash, walletAddress)
updateAiScore(charityId, score)
approveCharity(charityId)  // Multi-sig required
rejectCharity(charityId)
suspendCharity(charityId)
```

### 2. VibeToken.sol
ERC20 governance and reward token (VIBE).

**Key Features:**
- Max supply: 1 billion VIBE
- Minting rewards for donations (10 VIBE per 1 ETH)
- Staking mechanism with 3 lock periods:
  - 30 days: 5% APY
  - 90 days: 10% APY
  - 180 days: 15% APY
- Burnable for platform fees
- Role-based minting control

**Main Functions:**
```solidity
mintReward(to, amount)  // MINTER_ROLE only
stake(amount, lockPeriod)
unstake(stakeIndex)
calculateReward(amount, rewardRate, duration)
```

### 3. DonationManager.sol
Core contract for donation processing and distribution.

**Key Features:**
- ETH and ERC20 donations
- 2.5% platform fee (configurable)
- Automatic VIBE token rewards
- NFT minting for major donors (≥ 1 ETH)
- Recurring donation support
- Emergency withdrawal function

**Main Functions:**
```solidity
donateETH(charityId) payable
donateERC20(charityId, token, amount)
createRecurringDonation(charityId, amount, token, interval)
executeRecurringDonation(recurringId)
```

### 4. ImpactNFT.sol
ERC721 NFTs for high-impact donors.

**Key Features:**
- Dynamic metadata based on donation tiers:
  - Bronze: 1-5 ETH
  - Silver: 5-10 ETH
  - Gold: 10-50 ETH
  - Platinum: 50+ ETH
- IPFS metadata storage
- Impact tracking and updates
- Non-transferable (soulbound) - optional

**Main Functions:**
```solidity
mintImpactNFT(donor, charityId, impact)
updateImpact(tokenId, additionalImpact)
setIPFSMetadata(tokenId, ipfsHash)
```

## Deployment

### Prerequisites
```bash
npm install
```

### Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

### Compile
```bash
npx hardhat compile
```

### Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Deploy to Base Mainnet
```bash
npx hardhat run scripts/deploy.js --network base
```

### Verify Contracts
After deployment, verify on Basescan:
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Testing

### Run all tests
```bash
npx hardhat test
```

### Run with gas reporting
```bash
REPORT_GAS=true npx hardhat test
```

### Coverage
```bash
npx hardhat coverage
```

## Contract Interactions

### Register a Charity
```javascript
const tx = await charityRegistry.registerCharity(
  "Hope Foundation",
  "Helping communities worldwide",
  "QmXyz123...", // IPFS hash
  "0x..." // Charity wallet
);
```

### Make a Donation
```javascript
// ETH donation
const tx = await donationManager.donateETH(charityId, {
  value: ethers.parseEther("1.0")
});

// ERC20 donation
await token.approve(donationManagerAddress, amount);
const tx = await donationManager.donateERC20(charityId, tokenAddress, amount);
```

### Stake VIBE Tokens
```javascript
const amount = ethers.parseEther("100");
const lockPeriod = 90 * 24 * 60 * 60; // 90 days
const tx = await vibeToken.stake(amount, lockPeriod);
```

## Security Considerations

1. **Access Control**: All contracts use OpenZeppelin's AccessControl
2. **Reentrancy Protection**: ReentrancyGuard on all state-changing functions
3. **SafeERC20**: Used for all ERC20 transfers
4. **Multi-sig**: Charity approval requires multiple verifiers
5. **Emergency Functions**: Admin-only emergency withdrawal

## Gas Optimization

- Optimized storage layouts
- Minimal SLOAD operations
- Batch operations where possible
- Events for off-chain indexing
- Constructor parameters for upgradeable values

## Architecture

```
┌─────────────────────┐
│  DonationManager    │  ← Main entry point
└──────────┬──────────┘
           │
     ┌─────┼─────┐
     │     │     │
     ▼     ▼     ▼
  ┌────┐ ┌────┐ ┌────┐
  │ CR │ │ VT │ │ IN │
  └────┘ └────┘ └────┘
   Charity  Vibe  Impact
   Registry Token  NFT
```

- **CR** verifies charities
- **VT** rewards donors
- **IN** recognizes major donors
- **DonationManager** orchestrates all interactions

## License

MIT

## Built For

Seedify Vibecoins Hackathon @ DoraHacks

**Author**: emlanis
**Platform**: Base (Ethereum L2)
**Development**: AI-assisted with Claude
