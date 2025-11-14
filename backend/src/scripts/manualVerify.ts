/**
 * Manual verification script
 * Usage: npm run verify
 *
 * This script allows you to manually verify a specific charity
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { AIVerificationService } from '../services/aiVerification';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../config/contracts';
import * as readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function manualVerify() {
  console.log('\n🔍 Manual Charity Verification Tool');
  console.log('====================================\n');

  // Setup blockchain connection
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    wallet
  );

  // Ask for charity ID
  rl.question('Enter charity ID to verify: ', async (charityIdStr) => {
    const charityId = parseInt(charityIdStr);

    try {
      // Fetch charity details
      console.log(`\n📋 Fetching charity details...`);
      const charity = await contract.getCharity(charityId);

      console.log('\n📊 Charity Information:');
      console.log(`   Name: ${charity.name}`);
      console.log(`   Description: ${charity.description}`);
      console.log(`   Wallet: ${charity.walletAddress}`);
      console.log(`   IPFS: ${charity.ipfsHash || 'None'}`);
      console.log(`   Current Status: ${['Pending', 'Approved', 'Rejected', 'Suspended'][charity.status]}`);
      console.log(`   Current AI Score: ${charity.aiScore.toString()}/100\n`);

      // Run AI verification
      const aiService = new AIVerificationService();
      const result = await aiService.verifyCharity({
        charityId,
        name: charity.name,
        description: charity.description,
        ipfsHash: charity.ipfsHash,
        walletAddress: charity.walletAddress,
      });

      console.log('\n🤖 AI Verification Results:');
      console.log(`   Score: ${result.score}/100`);
      console.log(`   Approved: ${result.approved ? '✅ Yes' : '❌ No'}`);
      console.log(`   Reasoning: ${result.reasoning}`);
      if (result.flags.length > 0) {
        console.log(`   Flags: ${result.flags.join(', ')}`);
      }

      // Ask for confirmation
      rl.question('\nSubmit this verification to blockchain? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log('\n📝 Submitting to blockchain...');

          const tx = await contract.verifyCharity(charityId, result.score, result.approved);
          console.log(`   Transaction: ${tx.hash}`);

          const receipt = await tx.wait();
          console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);
          console.log('✅ Verification complete!\n');
        } else {
          console.log('\n❌ Verification cancelled\n');
        }

        rl.close();
        process.exit(0);
      });

    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      rl.close();
      process.exit(1);
    }
  });
}

manualVerify();
