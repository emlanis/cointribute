import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../config/contracts';
import { AIVerificationService } from './aiVerification';
import { charityImageRegistry } from './charityImageRegistry';

export class BlockchainListener {
  private provider: ethers.JsonRpcProvider | ethers.WebSocketProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;
  private aiService: AIVerificationService;

  constructor() {
    // Setup provider - Use WebSocket for better event listening
    const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';

    // Try WebSocket first, fallback to HTTP
    if (rpcUrl.startsWith('wss://') || rpcUrl.startsWith('ws://')) {
      this.provider = new ethers.WebSocketProvider(rpcUrl);
    } else {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    // Setup wallet (admin)
    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error('ADMIN_PRIVATE_KEY not set in environment');
    }
    this.wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);

    // Setup contract
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.CharityRegistry,
      CHARITY_REGISTRY_ABI,
      this.wallet
    );

    // Initialize AI service
    this.aiService = new AIVerificationService();

    console.log('📡 Blockchain Listener initialized');
    console.log(`   RPC: ${process.env.RPC_URL}`);
    console.log(`   Contract: ${CONTRACT_ADDRESSES.CharityRegistry}`);
    console.log(`   Admin: ${this.wallet.address}`);
  }

  /**
   * Start listening for CharityRegistered events
   */
  async startListening() {
    console.log('👂 Starting to listen for charity registrations...\n');

    // Listen for new registrations
    this.contract.on('CharityRegistered', async (charityId, registrant, name, timestamp, event) => {
      console.log('\n🔔 New Charity Registration Detected!');
      console.log(`   ID: ${charityId.toString()}`);
      console.log(`   Name: ${name}`);
      console.log(`   Registrant: ${registrant}`);
      console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);

      try {
        // Fetch full charity details
        const charityData = await this.getCharityDetails(Number(charityId));

        // Check if there are images uploaded for this wallet
        const imageUrls = charityImageRegistry.getImagesByWallet(registrant);
        if (imageUrls && imageUrls.length > 0) {
          console.log(`📸 Found ${imageUrls.length} uploaded images for this charity`);
          charityData.imageUrls = imageUrls;

          // Move images from wallet to charity ID
          charityImageRegistry.moveToCharityId(registrant, Number(charityId), imageUrls);
        } else {
          console.log(`ℹ️  No images uploaded for this charity`);
        }

        // Run AI verification (will analyze images if present)
        const verificationResult = await this.aiService.verifyCharity(charityData);

        console.log(`\n🤖 AI Verification Results:`);
        console.log(`   Score: ${verificationResult.score}/100`);
        console.log(`   Approved: ${verificationResult.approved}`);
        console.log(`   Reasoning: ${verificationResult.reasoning}`);
        if (verificationResult.flags.length > 0) {
          console.log(`   Flags: ${verificationResult.flags.join(', ')}`);
        }

        // Submit verification to blockchain
        await this.submitVerification(
          Number(charityId),
          verificationResult.score,
          verificationResult.approved
        );

        console.log(`✅ Verification submitted to blockchain!\n`);

      } catch (error) {
        console.error(`❌ Error processing charity ${charityId}:`, error);
      }
    });

    // Also scan for any past unverified charities
    await this.scanPastCharities();
  }

  /**
   * Get charity details from blockchain
   */
  private async getCharityDetails(charityId: number): Promise<{
    charityId: number;
    name: string;
    description: string;
    ipfsHash: string;
    walletAddress: string;
    imageUrls?: string[];
  }> {
    try {
      const charityData = await this.contract.getCharity(charityId);

      // Access struct fields by index to avoid ABI decoding issues
      // Order: name, description, ipfsHash, walletAddress, aiScore, status, ...
      return {
        charityId,
        name: charityData[0],        // name
        description: charityData[1], // description
        ipfsHash: charityData[2],    // ipfsHash
        walletAddress: charityData[3], // walletAddress
      };
    } catch (error: any) {
      console.error(`Failed to get charity ${charityId} details:`, error.message);
      throw error;
    }
  }

  /**
   * Submit verification result to blockchain
   */
  private async submitVerification(charityId: number, score: number, approved: boolean) {
    console.log(`📝 Submitting verification to blockchain...`);

    try {
      // Step 1: Update AI score
      console.log(`   Setting AI score to ${score}...`);
      const scoreTx = await this.contract.updateAiScore(charityId, score);
      console.log(`   Score transaction hash: ${scoreTx.hash}`);

      const scoreReceipt = await scoreTx.wait();
      console.log(`   ✅ Score updated in block ${scoreReceipt.blockNumber}`);

      // Approval/rejection happens automatically in the contract based on score
      if (approved) {
        console.log(`   ✅ Charity automatically APPROVED (score >= 60)`);
      } else {
        console.log(`   ❌ Charity automatically REJECTED (score < 60)`);
      }

      return scoreReceipt;
    } catch (error: any) {
      console.error(`   ❌ Transaction failed:`, error.message);
      throw error;
    }
  }

  /**
   * Scan for past charities that haven't been verified yet
   */
  private async scanPastCharities() {
    console.log('🔍 Scanning for unverified charities from past blocks...\n');

    try {
      // Get total number of charities directly
      const totalCharities = await this.contract.getTotalCharities();
      console.log(`   Total charities registered: ${totalCharities.toString()}`);

      // Check each charity
      for (let charityId = 0; charityId < Number(totalCharities); charityId++) {
        try {
          const charityData = await this.contract.getCharity(charityId);
          const status = Number(charityData[5]); // status is at index 5

          if (status === 0) { // 0 = Pending
            console.log(`\n📋 Processing unverified charity ID ${charityId}...`);

            const details = await this.getCharityDetails(charityId);

            // Check for images by charity ID first
            let imageUrls = charityImageRegistry.getImagesByCharityId(charityId);

            // If not found by charity ID, check by wallet address
            if (!imageUrls || imageUrls.length === 0) {
              imageUrls = charityImageRegistry.getImagesByWallet(details.walletAddress);
              if (imageUrls && imageUrls.length > 0) {
                console.log(`📸 Found ${imageUrls.length} images by wallet address for charity ${charityId}`);
                // Move images from wallet to charity ID
                charityImageRegistry.moveToCharityId(details.walletAddress, charityId, imageUrls);
                details.imageUrls = imageUrls;
              }
            } else {
              console.log(`📸 Found ${imageUrls.length} images for charity ${charityId}`);
              details.imageUrls = imageUrls;
            }

            const verificationResult = await this.aiService.verifyCharity(details);

            await this.submitVerification(
              charityId,
              verificationResult.score,
              verificationResult.approved
            );

            // Wait between verifications
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`   Charity ${charityId}: Already verified (status: ${status})`);
          }
        } catch (error: any) {
          console.error(`   Error processing charity ${charityId}:`, error.message);
          // Continue with next charity
        }
      }

      console.log('\n✅ Past charity scan complete\n');

    } catch (error) {
      console.error('Error scanning past charities:', error);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    this.contract.removeAllListeners();
    console.log('🛑 Stopped listening for events');
  }
}
