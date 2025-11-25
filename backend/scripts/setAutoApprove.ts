import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    wallet
  );

  console.log('Setting requiredApprovals to 0 for automatic approval...');
  const tx = await contract.setRequiredApprovals(0);
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('✅ Updated in block:', receipt.blockNumber);
  console.log('\nNow charities with good AI scores will be auto-approved!');
}

main();
