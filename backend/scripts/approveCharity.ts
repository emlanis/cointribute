import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('✅ Approving Charity\n');

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    wallet
  );

  const charityId = 0;

  try {
    console.log(`Approving charity ID ${charityId}...`);
    const tx = await contract.approveCharity(charityId);
    console.log(`Transaction sent: ${tx.hash}`);

    console.log('Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log(`\n✅ SUCCESS!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Transaction: ${receipt.hash}`);
    console.log(`\nCharity ID ${charityId} is now APPROVED!`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

main();
