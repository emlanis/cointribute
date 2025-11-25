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

  const requiredApprovals = await contract.requiredApprovals();
  console.log('Required approvals:', requiredApprovals.toString());
  
  // Check approval count for charity 0
  try {
    const approvalCount = await contract.approvalCount(0);
    console.log('Charity 0 current approvals:', approvalCount.toString());
  } catch (e) {
    console.log('Could not get approval count (method may not exist in ABI)');
  }
}

main();
