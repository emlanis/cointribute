import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    provider
  );

  console.log('🔍 Checking Approval Settings\n');

  try {
    const requiredApprovals = await contract.requiredApprovals();
    console.log(`Required Approvals: ${requiredApprovals}`);
    console.log('\nℹ️  This is a multi-sig approval system.');
    console.log(`    ${requiredApprovals} verifier(s) must approve before a charity is fully approved.\n`);

    console.log('💡 To change this, call: contract.setRequiredApprovals(1)');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
