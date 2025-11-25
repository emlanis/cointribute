import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('⚙️  Setting Required Approvals to 1\n');

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    wallet
  );

  try {
    const currentValue = await contract.requiredApprovals();
    console.log(`Current required approvals: ${currentValue}`);

    console.log('\nSetting to 1 for automatic AI verification...');
    const tx = await contract.setRequiredApprovals(1);
    console.log(`Transaction sent: ${tx.hash}`);

    console.log('Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log(`\n✅ SUCCESS!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Required approvals is now: 1`);
    console.log(`\n💡 Now charity approvals will work automatically with a single verifier!`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

main();
