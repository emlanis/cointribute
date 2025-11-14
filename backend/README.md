# Cointribute AI Verification Backend

AI-powered charity verification system that automatically verifies charity registrations on the blockchain.

## 🚀 Features

- **Automatic Event Listening**: Monitors blockchain for new charity registrations
- **AI-Powered Verification**: Uses OpenAI GPT-4 to analyze charity legitimacy
- **Multi-Factor Analysis**:
  - Name credibility assessment
  - Description quality analysis
  - IPFS document verification
  - Online presence checking (optional)
  - Red flag detection
- **Automatic Blockchain Updates**: Submits verification results back to smart contract
- **Manual Verification Tool**: CLI tool for manual charity verification

## 📋 Prerequisites

- Node.js 18+
- OpenAI API key
- Admin wallet private key (with ETH for gas on Base Sepolia)
- Base Sepolia RPC access

## 🛠️ Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
RPC_URL=https://sepolia.base.org
CHARITY_REGISTRY_ADDRESS=0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828
ADMIN_PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=your_openai_key_here
AI_MODEL=gpt-4-turbo-preview
PORT=3001
```

## 🏃 Running

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm start
```

### Manual Verification Tool:
```bash
npm run verify
```

## 📊 How It Works

1. **Event Detection**: Listens for `CharityRegistered` events on the blockchain
2. **Data Fetching**: Retrieves full charity details from smart contract
3. **AI Analysis**:
   - Analyzes charity name and description
   - Checks for scam indicators
   - Verifies IPFS documents (if provided)
   - Calculates legitimacy score (0-100)
4. **Scoring**:
   - Base AI analysis: 0-100
   - +10 bonus for professional naming
   - +10 bonus for accessible IPFS documents
   - -5 per red flag detected
5. **Approval Decision**: Score >= 60 = Approved
6. **Blockchain Update**: Calls `verifyCharity()` with score and approval status

## 🔒 Security

- Private keys stored in `.env` (never commit)
- Admin wallet used only for verification transactions
- All blockchain interactions are signed and verified
- AI responses sanitized and validated

## 📝 API Endpoints

- `GET /health` - Health check
- `GET /api/stats` - Verification statistics (coming soon)

## 🧪 Testing

To test the verification system:

1. Register a test charity through the frontend
2. Backend will automatically detect and verify it
3. Check console logs for verification details
4. Or use manual verification tool: `npm run verify`

## 📈 Monitoring

The backend logs all activities:
- New charity registrations detected
- AI analysis results
- Blockchain transaction submissions
- Errors and warnings

## 🆘 Troubleshooting

**"ADMIN_PRIVATE_KEY not set"**
- Make sure your `.env` file exists and has `ADMIN_PRIVATE_KEY`

**"OpenAI API error"**
- Check your `OPENAI_API_KEY` is valid
- Ensure you have API credits

**"Transaction failed"**
- Ensure admin wallet has ETH for gas on Base Sepolia
- Check contract address is correct
- Verify you have OPERATOR_ROLE on the contract

## 🔄 Future Enhancements

- Database for caching verification results
- Enhanced web search integration (Serper API)
- Social media verification
- Detailed verification reports
- Admin dashboard API
- Webhook notifications
