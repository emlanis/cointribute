// Load environment variables FIRST
import './env';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { BlockchainListener } from './services/blockchainListener';
import { coinMarketCapService } from './services/coinMarketCapService';
import { upload, processImage, getImageUrl } from './services/imageUpload';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Get charity images by ID
app.get('/api/charity-images/:charityId', async (req, res) => {
  try {
    const { charityId } = req.params;
    const { charityImageRegistry } = await import('./services/charityImageRegistry');

    const images = charityImageRegistry.getImagesByCharityId(parseInt(charityId));

    res.json({
      success: true,
      charityId: parseInt(charityId),
      images: images || [],
      count: images?.length || 0
    });
  } catch (error) {
    console.error('Error fetching charity images:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch images'
    });
  }
});

// Image upload endpoint
app.post('/api/upload-images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];
    const processedFiles: string[] = [];

    // Process each uploaded image
    for (const file of files) {
      const result = await processImage(file.path);

      if (result.success && result.optimizedPath) {
        const imageUrl = getImageUrl(path.basename(result.optimizedPath), req);
        imageUrls.push(imageUrl);
        processedFiles.push(result.optimizedPath);
      } else {
        console.error(`Failed to process image: ${file.originalname}`);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(500).json({ error: 'Failed to process any images' });
    }

    // Store images with wallet address (will be moved to charityId after registration)
    const { charityImageRegistry } = await import('./services/charityImageRegistry');
    charityImageRegistry.storeImagesByWallet(walletAddress, imageUrls);

    console.log(`✅ Successfully uploaded and processed ${imageUrls.length} images for wallet ${walletAddress}`);

    res.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length,
      walletAddress
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload images'
    });
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
