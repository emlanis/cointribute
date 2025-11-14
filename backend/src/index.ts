// Load environment variables FIRST
import './env';

import express from 'express';
import cors from 'cors';
import { BlockchainListener } from './services/blockchainListener';
import { coinMarketCapService } from './services/coinMarketCapService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cointribute AI Verification Backend',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/stats', async (req, res) => {
  res.json({
    message: 'Stats endpoint - coming soon',
    // TODO: Add verification stats from database
  });
});

// Price conversion endpoints
app.get('/api/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await coinMarketCapService.getPrice(symbol.toUpperCase());

    if (price === null) {
      return res.status(404).json({ error: `Price not found for ${symbol}` });
    }

    res.json({ symbol: symbol.toUpperCase(), price_usd: price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

app.get('/api/prices', async (req, res) => {
  try {
    const symbols = (req.query.symbols as string)?.split(',') || ['ETH', 'USDC'];
    const prices = await coinMarketCapService.getPrices(symbols.map(s => s.toUpperCase()));

    const result: any = {};
    prices.forEach((price, symbol) => {
      result[symbol] = price;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.post('/api/convert-to-usd', async (req, res) => {
  try {
    const { ethAmount = '0', usdcAmount = '0' } = req.body;
    const result = await coinMarketCapService.getTotalUSD(ethAmount, usdcAmount);

    if (result === null) {
      return res.status(500).json({ error: 'Failed to calculate USD value' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert to USD' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log('\n==============================================');
  console.log('🚀 Cointribute AI Verification Backend');
  console.log('==============================================');
  console.log(`   Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================\n');

  // Start blockchain listener
  try {
    const listener = new BlockchainListener();
    await listener.startListening();

    console.log('✅ Backend is fully operational!\n');
    console.log('📊 The system is now:');
    console.log('   - Listening for new charity registrations');
    console.log('   - Running AI verification automatically');
    console.log('   - Submitting results to blockchain\n');

  } catch (error) {
    console.error('❌ Failed to start blockchain listener:', error);
    console.error('\nPlease check your .env configuration:');
    console.error('   - RPC_URL is set correctly');
    console.error('   - ADMIN_PRIVATE_KEY is valid');
    console.error('   - OPENAI_API_KEY is configured');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});
