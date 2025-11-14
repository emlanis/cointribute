import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BlockchainListener } from './services/blockchainListener';

// Load environment variables
dotenv.config();

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
