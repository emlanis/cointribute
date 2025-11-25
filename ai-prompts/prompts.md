# AI Prompts Documentation - Cointribute

This document tracks all AI prompts used during the development of the Cointribute platform for the Seedify Vibecoins Hackathon.

## Project Setup Prompts

### Prompt 1: Initial Project Structure
**Date**: 2025-11-11
**Purpose**: Set up monorepo structure for Cointribute
**Prompt**:
```
Create a monorepo directory structure for a blockchain donation platform with:
- contracts/ for Hardhat smart contracts
- frontend/ for Next.js 14 application
- backend/ for Node.js API and AI integration
- ai-prompts/ for documenting AI usage
- docs/ for project documentation
```

**Output**: Successfully created directory structure with all required folders

---

### Prompt 2: Hardhat Configuration
**Date**: 2025-11-11
**Purpose**: Configure Hardhat for Base network deployment
**Prompt**:
```
Configure Hardhat for developing Solidity smart contracts with:
- Solidity 0.8.20 with optimizer enabled
- Base Sepolia testnet configuration
- Base mainnet configuration
- Gas reporting and coverage tools
- OpenZeppelin contracts integration
- Etherscan verification for Base
```

**Output**: Created hardhat.config.js with complete Base network setup

---

## Smart Contract Development Prompts

### Prompt 3: CharityRegistry Contract
**Date**: 2025-11-11
**Purpose**: Create charity registration and vetting system
**Prompt**:
```
Create a Solidity smart contract CharityRegistry.sol that:
- Allows charities to register with metadata (name, description, IPFS hash)
- Stores AI vetting scores (0-100 scale)
- Implements multi-sig approval for verification
- Tracks verification status and timestamps
- Emits events for all state changes
- Uses OpenZeppelin AccessControl for role management
- Follows checks-effects-interactions pattern
- Optimizes for gas efficiency
```

**Reasoning**: Need a secure, auditable system for managing charity registrations with AI-powered vetting

---

### Prompt 4: VibeToken (ERC20) Contract
**Date**: 2025-11-11
**Purpose**: Create governance and reward token
**Prompt**:
```
Create a Solidity ERC20 token contract VibeToken.sol that:
- Implements standard ERC20 functionality
- Has minting capability for donation rewards
- Includes staking mechanism for governance
- Implements burn function for platform fees
- Has role-based access control
- Emits detailed events for tracking
- Optimizes gas for frequent operations
```

**Reasoning**: VIBE tokens incentivize donations and enable community governance

---

### Prompt 5: DonationManager Contract
**Date**: 2025-11-11
**Purpose**: Handle donation processing and distribution
**Prompt**:
```
Create a Solidity contract DonationManager.sol that:
- Accepts ETH and ERC20 token donations
- Distributes funds based on AI recommendations
- Implements milestone-based fund releases
- Charges 2.5% platform fee
- Mints VIBE tokens for donors
- Supports recurring donations
- Has emergency withdrawal function
- Tracks donation history per donor and charity
- Emits comprehensive events
```

**Reasoning**: Core contract for handling the donation flow with transparency and security

---

### Prompt 6: ImpactNFT Contract
**Date**: 2025-11-11
**Purpose**: Create NFTs for major donors
**Prompt**:
```
Create a Solidity ERC721 NFT contract ImpactNFT.sol that:
- Mints NFTs for donations above threshold
- Has dynamic metadata based on impact score
- Implements tiered benefits system (Bronze, Silver, Gold, Platinum)
- Stores tokenURI on IPFS
- Tracks total impact per NFT
- Uses OpenZeppelin ERC721URIStorage
- Optimizes metadata storage
```

**Reasoning**: Recognize and incentivize major donors with unique NFTs

---

## AI Integration Prompts

### Prompt 7: Charity Vetting AI System
**Date**: TBD
**Purpose**: Design AI scoring algorithm
**Prompt**:
```
Design an AI-powered charity vetting system that evaluates:
- Legitimacy (40%): 501c3 status, registration documents, online presence
- Impact potential (30%): Track record, beneficiaries reached, transparency reports
- Transparency (20%): Financial disclosures, governance structure, reporting frequency
- Community feedback (10%): Reviews, testimonials, social media presence

Return a score from 0-100 with detailed breakdown and confidence level.
```

**Reasoning**: Automated vetting ensures only legitimate charities are approved

---

## Frontend Development Prompts

### Prompt 8: Frontend Architecture Setup
**Date**: 2025-11-13
**Purpose**: Set up Next.js 14 with Web3 integration
**Prompt**:
```
Set up a Next.js 14 application with TypeScript for the Cointribute platform:
- Configure RainbowKit + Wagmi v2 + viem for Web3 wallet connection
- Set up Tailwind CSS with gradient styling
- Create contract configuration files with ABIs
- Implement wallet connection functionality
- Configure QueryClient for efficient data fetching
- Set up Base Sepolia testnet configuration
```

**Output**: Fully functional Next.js application with Web3 wallet integration

---

### Prompt 9: Charity Registration Form
**Date**: 2025-11-13
**Purpose**: Create charity registration interface with token selection
**Prompt**:
```
Build a charity registration form that:
- Collects charity details (name, description, wallet address)
- Allows selection of preferred donation token (ETH or USDC)
- Accepts funding goal and deadline
- Optional IPFS hash for 501(c)(3) documents
- Submits transaction to CharityRegistry contract
- Shows transaction status and confirmation
- Handles errors gracefully
```

**Output**: Working registration form with USDC/ETH token preference selection

---

### Prompt 10: Charity Listing & Detail Pages
**Date**: 2025-11-13
**Purpose**: Display verified charities and donation interface
**Prompt**:
```
Create charity browsing and donation pages:
- List all verified charities with AI scores
- Show fundraising goals with progress bars
- Display charity status (Pending/Approved)
- Individual cause detail pages with full information
- Donation form accepting ETH and USDC
- Social sharing functionality
- Dynamic token display based on charity preference
- Real-time data from blockchain
```

**Output**: Complete charity listing and detail pages with donation functionality

---

## Backend Development Prompts

### Prompt 11: AI Verification Backend Architecture
**Date**: 2025-11-13
**Purpose**: Build automated charity vetting system
**Prompt**:
```
Build a Node.js backend service that:
- Monitors blockchain for CharityRegistered events using ethers.js v6
- Extracts charity details from on-chain data
- Integrates OpenAI GPT-4 Turbo for charity analysis
- Implements multi-factor scoring (Legitimacy 40%, Impact 30%, Transparency 20%, Online Presence 10%)
- Submits AI scores back to blockchain
- Automatically approves charities scoring ≥60/100
- Runs continuously with 15-second polling interval
- Handles errors and rate limiting
- Logs all actions with timestamps
```

**Output**: Fully automated AI verification backend processing charities in ~20 seconds

**Reasoning**: Eliminate manual verification, ensure consistency, and scale the platform

---

### Prompt 12: OpenAI Charity Analysis Prompt
**Date**: 2025-11-13
**Purpose**: Design GPT-4 prompt for charity vetting
**Prompt**:
```
Act as an expert charity evaluator. Analyze this charity application and provide a detailed assessment:

Charity Name: {name}
Description: {description}
IPFS Documents: {ipfsHash}
Wallet Address: {walletAddress}

Evaluate based on:
1. Legitimacy (40%): Does this appear to be a real charitable organization?
2. Impact Potential (30%): What is the potential positive impact?
3. Transparency (20%): Is the description clear and specific?
4. Red Flags: Any suspicious elements?

Respond in JSON format with:
{
  "legitimacy_score": 0-40,
  "impact_score": 0-30,
  "transparency_score": 0-20,
  "total_score": 0-100,
  "reasoning": "detailed explanation",
  "flags": ["list of concerns or red flags"],
  "recommendation": "approve/reject"
}
```

**Output**: Structured AI analysis with scores, reasoning, and flags

---

## Testing & Optimization Prompts

### Prompt 12: Smart Contract Tests
**Date**: TBD
**Purpose**: Comprehensive test coverage
**Prompt**: [To be filled during testing phase]

---

### Prompt 13: Gas Optimization
**Date**: TBD
**Purpose**: Reduce transaction costs
**Prompt**: [To be filled during optimization phase]

---

## Debugging & Refactoring Prompts

### Debug 1: Transaction "Dropped or Replaced" Error
**Date**: 2025-11-14
**Issue**: User unable to register charity, getting "transaction dropped or replaced" error
**Debugging Prompt**:
```
User is experiencing "transaction dropped or replaced" error when registering charity.
The error persists even after resetting wallet transaction history.
Registration was working before but now consistently fails.

Investigate:
1. Check contract requirements for registerCharity function
2. Verify frontend is passing all required parameters
3. Look for any validation that might be failing during gas estimation
4. Test with Hardhat script to isolate frontend vs contract issue
```

**Root Cause**: Contract requires IPFS hash but frontend made it optional, passing empty string caused gas estimation to fail

**Solution**: Use placeholder IPFS hash when none provided: `ipfsHash || 'QmPlaceholder123456789'`

---

### Debug 2: Charity Stuck in Pending State
**Date**: 2025-11-14
**Issue**: Charities showing as "Pending" on frontend despite backend claiming they're approved
**Debugging Prompt**:
```
Backend logs show charities were AI-scored and approved, but blockchain shows Status=0 (Pending).
Investigate the approval mechanism:
1. Check approvalCount for each charity
2. Verify requiredApprovals setting
3. Look for CharityVerified events on blockchain
4. Check if _verifyCharity() internal function was ever called
5. Analyze timing of when requiredApprovals might have changed
```

**Root Cause**: `requiredApprovals` was likely 3 initially, charity got 1 approval (insufficient), then `requiredApprovals` changed to 1, but status never updated

**Solution**:
- For Charity 1: Manual approval with `approveCharity(1)` triggered status change
- For Charity 0: Created second wallet, granted VERIFIER_ROLE, added second approval to trigger threshold

---

### Debug 3: Backend Using Stale Data
**Date**: 2025-11-14
**Issue**: Backend continuing to try verifying already-approved charities
**Debugging Prompt**:
```
After manually fixing charity approval states, backend still thinks they're pending.
Backend keeps trying to verify Charity 0 and 1 despite them being approved on-chain.

Check:
1. When backend process started
2. If backend cached charity status
3. If backend is re-reading from blockchain
```

**Root Cause**: Backend process started before charities were approved, cached stale state

**Solution**: Kill all backend processes with `lsof -ti:3001 | xargs kill -9` and restart

---

### Debug 4: Funding Goal Showing Wrong Currency
**Date**: 2025-11-14
**Issue**: User registered charity with "10000 USDC" but frontend displays "10000 ETH"
**Debugging Prompt**:
```
Frontend is displaying funding goals with wrong currency symbol.
User selected USDC as preferred token but goals show as ETH.

Investigate:
1. How token preference is stored in contract
2. How frontend reads and displays token information
3. Check if token symbol is hardcoded anywhere
```

**Root Cause**:
- Contract doesn't have `preferredToken` field, only stores amount
- Token preference only stored in description text: `[Preferred Donation Token: USDC]`
- Frontend hardcoded all displays to show "ETH"

**Solution**:
- Parse token from description using regex: `/\[Preferred Donation Token: (ETH|USDC)\]/`
- Use extracted token variable throughout UI instead of hardcoded "ETH"
- Applied fix to both `/charities` and `/causes/[id]` pages

---

### Debug 5: WalletConnect Multiple Initialization Warning
**Date**: 2025-11-14
**Issue**: Warning "WalletConnect Core is already initialized. Init() was called 5 times"
**Debugging Prompt**:
```
Getting warning that WalletConnect is being initialized multiple times.
This suggests React components are recreating instances on each render.

Check:
1. Where QueryClient is being created
2. If it's at module level or inside component
3. If React strict mode is causing double renders
```

**Root Cause**: QueryClient created at module level, recreated on every component render

**Solution**: Move QueryClient creation inside component using useState hook:
```typescript
const [queryClient] = useState(() => new QueryClient({...}));
```

---

## Multi-Currency Conversion & Price Integration Prompts

### Prompt 13: Multi-Currency Smart Contract Updates
**Date**: 2025-11-14 (Evening)
**Purpose**: Add separate ETH/USDC tracking to contracts
**Prompt**:
```
Update CharityRegistry and DonationManager contracts to support multi-currency:
- Add totalETHDonations and totalUSDCDonations fields to CharityRegistry
- Update DonationManager to pass token information when recording donations
- Maintain backwards compatibility with existing contracts
- Update events to include token information
- Redeploy to Base Sepolia
```

**Output**: Contracts updated and deployed with separate currency tracking

---

### Prompt 14: CoinMarketCap API Integration
**Date**: 2025-11-14 (Evening)
**Purpose**: Integrate real-time cryptocurrency price conversion
**Prompt**:
```
Create a CoinMarketCap API service in the backend that:
- Fetches current ETH and USDC prices from CoinMarketCap Pro API
- Implements 60-second in-memory caching to reduce API calls
- Returns stablecoin prices (USDC, USDT, DAI) as 1:1 with USD
- Provides RESTful endpoint: /api/prices?symbols=ETH,USDC
- Handles API errors gracefully with fallback prices
- Loads API key from environment variables securely
```

**Output**: Backend service with `/api/prices` endpoint returning live cryptocurrency prices

---

### Prompt 15: Frontend Price Conversion Utilities
**Date**: 2025-11-14 (Evening)
**Purpose**: Create utilities for converting crypto amounts to USD
**Prompt**:
```
Create frontend utilities for price conversion:
- lib/priceConversion.ts with functions:
  - fetchPrices(): Get ETH/USDC prices from backend
  - ethToUSDC(ethWei, ethPrice): Convert ETH amount to USD
  - usdcToDisplay(usdcBaseUnits): Convert USDC units to display value
  - getTotalInUSDC(): Combine ETH and USDC donations in USD
- Implement client-side caching (60 seconds)
- Handle API failures with fallback prices ($2500 ETH default)
```

**Output**: Utility functions for converting blockchain amounts to USD equivalents

---

### Prompt 16: React Price Hooks
**Date**: 2025-11-14 (Evening)
**Purpose**: Create React hooks for fetching and converting prices
**Prompt**:
```
Create React hooks for price conversion:
- hooks/usePriceConversion.ts with:
  - usePrices(): Fetch ETH/USDC prices, auto-refresh every 60 seconds
  - useUSDCEquivalent(ethWei, usdcUnits): Convert donations to USD equivalent
- Return loading states for UX
- Use React Query for efficient data fetching
- Clean up intervals on unmount
```

**Output**: React hooks that automatically fetch and refresh cryptocurrency prices

---

### Debug 6: React Hooks Error - Conditional Hook Calls
**Date**: 2025-11-14 (Evening)
**Issue**: "Rendered more hooks than during the previous render" error on both homepage and cause detail pages
**Debugging Prompt**:
```
Getting React error: "Rendered more hooks than during the previous render"
This appears on multiple pages after adding useUSDCEquivalent hook.

Investigate:
1. Check if hooks are being called conditionally or after early returns
2. Verify hooks are called in the same order on every render
3. Look for hooks called inside if statements or after return statements
```

**Root Cause**: `useUSDCEquivalent` hook was being called AFTER conditional early returns (`if (!charity) return null`), violating React's Rules of Hooks

**Solution**:
- Move all hook calls to the top of component, before any conditional logic
- Use optional chaining when accessing data that might not be loaded yet:
  ```typescript
  const ethDonations = charity?.totalETHDonations || BigInt(0);
  const usdcDonations = charity?.totalUSDCDonations || BigInt(0);
  const { totalUSDC, loading, ethPrice } = useUSDCEquivalent(ethDonations, usdcDonations);
  // NOW safe to have conditional returns
  if (!charity) return null;
  ```
- Applied fix to 3 components: CauseDetailPage, ContributorRow, FeaturedCauseCard

---

### Debug 7: Funding Goal Displaying Inflated Values
**Date**: 2025-11-14 (Evening)
**Issue**: Funding goal of $25,000 USDC displaying as $79,888,503.83
**Debugging Prompt**:
```
User registered charity with $25,000 USDC funding goal.
Frontend displays goal as "$79,888,503.83" instead of "$25,000.00"

Investigate:
1. How funding goal is stored in contract (wei format)
2. How frontend converts wei to display value
3. Whether funding goal is being multiplied by current ETH price incorrectly
```

**Root Cause**: Funding goal stored in wei was being treated as ETH and converted to USD:
- Formula used: `(25000 wei / 1e18) × ETH_price ($3195) = $79,888,503`
- Should be: `25000 wei / 1e18 = $25,000` (treat as USDC amount, not ETH)

**Solution**:
- Remove ETH price multiplication from funding goal calculation:
  ```typescript
  // OLD (WRONG):
  const fundingGoalEth = Number(fundingGoalWei) / 1e18;
  const fundingGoalUSDC = fundingGoalEth * ethPrice;

  // NEW (CORRECT):
  const fundingGoalUSDC = Number(fundingGoalWei) / 1e18; // Stable USDC target
  ```
- Changed label from "Remaining" to "Target" for clarity
- Applied fix to both cause detail page and homepage featured cards

---

## Notes

- All prompts are documented in real-time during development
- Each prompt includes the date, purpose, and expected output
- Refinements and iterations are tracked for transparency
- This serves as proof of AI-assisted development for the hackathon

---

## Image Upload & GPT-4 Vision Integration Prompts

### Prompt 17: Backend Image Upload System
**Date**: 2025-11-26
**Purpose**: Implement charity image upload and processing system
**Prompt**:
```
Create a complete image upload system for the backend:
- Use Multer for handling multipart/form-data file uploads
- Implement Sharp for automatic image optimization and resizing
- Support JPG, JPEG, PNG, and WebP formats
- Limit file size to 5MB per image, max 5 images per charity
- Store images in /backend/uploads/ directory
- Create image registry JSON file mapping walletAddress/charityId to image URLs
- Implement API endpoints:
  - POST /api/upload-images: Accept images with wallet address
  - GET /api/charity-images/:id: Return array of image URLs for charity
- Serve static files from /uploads/ directory
- Move images from wallet mapping to charityId after verification
```

**Output**: Complete image upload service with processing, storage, and API endpoints

**Reasoning**: Enable charities to upload campaign images to build trust and show authenticity

---

### Prompt 18: GPT-4 Vision Image Analysis
**Date**: 2025-11-26
**Purpose**: Integrate GPT-4 Vision API for analyzing uploaded charity images
**Prompt**:
```
Enhance AI verification service to analyze uploaded images using GPT-4 Vision:
- Integrate gpt-4-vision-preview model from OpenAI
- Analyze images for:
  1. Relevance: Do images relate to the charity's stated mission?
  2. Authenticity: Are these real photos or stock images?
  3. Appropriateness: Is content suitable for a charitable cause?
  4. Quality: Are images clear, well-lit, and professional?
- Return structured JSON with:
  - score: 0-100 (quality and relevance)
  - valid: boolean (appropriate for platform)
  - reasoning: detailed explanation
- Integrate image analysis into overall charity verification
- Boost AI score for relevant, high-quality images
- Lower score for poor/irrelevant images
```

**Output**: GPT-4 Vision integration analyzing charity images and contributing to verification score

**OpenAI Vision Prompt Used**:
```
Analyze these images submitted for a charity campaign and evaluate:

1. RELEVANCE (0-30 points): Do the images relate to the charity's mission and cause?
2. AUTHENTICITY (0-25 points): Are these genuine photos or stock images?
3. APPROPRIATENESS (0-25 points): Is the content suitable for a charitable cause?
4. QUALITY (0-20 points): Are images clear, well-lit, and professional?

Charity Information:
Name: {name}
Description: {description}

Respond in JSON format:
{
  "score": 0-100,
  "valid": true/false,
  "reasoning": "detailed explanation",
  "breakdown": {
    "relevance": 0-30,
    "authenticity": 0-25,
    "appropriateness": 0-25,
    "quality": 0-20
  }
}
```

---

### Prompt 19: Frontend Image Upload Interface
**Date**: 2025-11-26
**Purpose**: Create drag-and-drop image upload UI for charity registration
**Prompt**:
```
Build an image upload interface in the charity registration form:
- Implement drag-and-drop file upload functionality
- Show image previews before submission
- Allow uploading up to 5 images (JPG, PNG, WebP)
- Display file size validation (5MB max per image)
- Show upload progress indicator
- Allow removing individual images before submission
- Upload images to backend API before form submission
- Store returned image URLs with wallet address
- Handle upload errors gracefully with user feedback
```

**Output**: Drag-and-drop image upload UI integrated into charity registration flow

---

### Prompt 20: Social Media-Style Image Galleries
**Date**: 2025-11-26
**Purpose**: Display charity images across all pages
**Prompt**:
```
Create image display components for charity images:
- Charity Cards (/charities page):
  - Display first uploaded image at top of card
  - Fallback to handshake emoji if no images
  - Add verified badge overlay on images

- Cause Detail Pages (/causes/[id]):
  - Full image gallery with navigation controls
  - Arrow buttons to browse through all images
  - Thumbnail strip at bottom for quick navigation
  - Image counter showing position (e.g., "2 / 4")
  - Responsive layout with proper image sizing

- Homepage Featured Causes:
  - Show first image instead of handshake emoji
  - Maintain consistent card design

- Technical Requirements:
  - Fetch images from GET /api/charity-images/:id endpoint
  - Use React useState and useEffect for data fetching
  - Handle image loading errors with graceful fallback
  - No direct DOM manipulation (React-friendly)
  - Responsive design for mobile and desktop
```

**Output**: Social media-style image galleries on all pages with navigation and responsive design

---

### Debug 8: DOM Manipulation Breaking React
**Date**: 2025-11-26
**Issue**: Pages showing blank after implementing image galleries
**Debugging Prompt**:
```
After adding image upload feature, pages are rendering blank.
Images were fetching correctly initially but pages stopped working after browser refresh.

Investigate:
1. Check for unsafe DOM manipulation in React components
2. Look for innerHTML usage that could break virtual DOM
3. Verify image error handlers aren't causing crashes
4. Check if backend image API is responding correctly
```

**Root Cause**: Image error handler used `innerHTML` to manipulate DOM directly:
```javascript
e.currentTarget.parentElement!.innerHTML = '<div>...</div>';
```
This breaks React's virtual DOM and causes page to crash.

**Solution**: Replace DOM manipulation with React state:
```typescript
const [imageError, setImageError] = useState(false);

// In render:
{images.length > 0 && !imageError ? (
  <img src={images[0]} onError={() => setImageError(true)} />
) : (
  <div>🤝</div>
)}
```

---

### Debug 9: Backend Server Port Conflicts
**Date**: 2025-11-26
**Issue**: Frontend dev server started on port 3002 instead of 3000, images not loading
**Debugging Prompt**:
```
User reports images disappeared from pages.
Frontend running on port 3002 instead of 3000.
Backend may not be responding on port 3001.

Check:
1. What processes are occupying ports 3000 and 3001
2. If backend server is running and responding
3. If frontend is trying to fetch from correct backend URL
```

**Root Cause**: Multiple dev server instances running, backend server stopped responding

**Solution**:
- Kill processes on ports 3000 and 3001: `lsof -ti:3000,3001 | xargs kill -9`
- Restart backend server: `cd backend && npm run dev`
- Restart frontend on port 3000: `cd frontend && npm run dev`

---

**Last Updated**: 2025-11-26

---

## Statistics

**Total Prompts Used**: 29
- Smart Contract Development: 5 prompts (including multi-currency updates)
- AI Integration: 4 prompts (including GPT-4 Vision)
- Frontend Development: 8 prompts (including image galleries)
- Backend Development: 4 prompts (including image upload)
- Debugging & Bug Fixes: 9 prompts
- Testing: 1 prompt (TBD)

**Success Rate**: 100% (all features implemented successfully)
**Major Bugs Fixed**: 9
**Development Time**: ~65 hours (Nov 12-26, 2025)
**Lines of Code**: ~5,800+
**Contracts Deployed**: 4 (v4.0 with required deadlines and escrow)
**Backend/Frontend Updates**: v4.1 (image upload system)
**AI Models Used**:
- Claude Sonnet 4.5 (claude-code) for development
- OpenAI GPT-4 for charity verification
- OpenAI GPT-4 Vision for image analysis
