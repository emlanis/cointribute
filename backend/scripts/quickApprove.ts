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

  const charityId = 0;
  
  console.log('Approving charity ID', charityId);
  const tx = await contract.approveCharity(charityId);
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('✅ Approved in block:', receipt.blockNumber);
}

main();
