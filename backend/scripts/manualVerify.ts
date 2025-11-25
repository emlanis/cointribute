import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import { AIVerificationService } from '../src/services/aiVerification';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔧 Manual Charity Verification Script');
  console.log('=====================================\n');

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    wallet
  );

  const charityId = 0;
  console.log(`Verifying Charity ID: ${charityId}\n`);

  try {
    // Get charity details
    const charityData = await contract.getCharity(charityId);
    console.log(`Charity Name: ${charityData[0]}`);
    console.log(`Current Status: ${charityData[5]} (0=Pending, 1=Approved, 2=Rejected)`);
    console.log(`Current AI Score: ${charityData[4]}\n`);

    if (charityData[5] === 1) {
      console.log('✅ Charity is already approved!');
      return;
    }

    // Prepare charity data for AI verification
    const charity = {
      id: charityId,
      name: charityData[0],
      description: charityData[1],
      ipfsHash: charityData[2],
      walletAddress: charityData[3],
    };

    console.log('🤖 Running AI verification...');
    const aiService = new AIVerificationService();
    const result = await aiService.verifyCharity(charity);

    console.log(`\n📊 AI Verification Results:`);
    console.log(`   Score: ${result.score}/100`);
    console.log(`   Approved: ${result.approved}`);
    console.log(`   Reasoning: ${result.reasoning}`);
    if (result.flags.length > 0) {
      console.log(`   Flags: ${result.flags.join(', ')}`);
    }

    console.log(`\n📝 Submitting to blockchain...`);

    // Set AI score
    console.log(`   Setting AI score to ${result.score}...`);
    const scoreTx = await contract.updateAiScore(charityId, result.score);
    const scoreReceipt = await scoreTx.wait();
    console.log(`   ✅ Score updated in block ${scoreReceipt.blockNumber}`);

    // Approve charity
    console.log(`   Approving charity...`);
    const approveTx = await contract.approveCharity(charityId);
    const approveReceipt = await approveTx.wait();
    console.log(`   ✅ Charity approved in block ${approveReceipt.blockNumber}`);

    console.log(`\n✅ VERIFICATION COMPLETE!`);
    console.log(`   Transaction: ${approveReceipt.hash}`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

main();
