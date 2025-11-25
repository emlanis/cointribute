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

  const totalCharities = await contract.getTotalCharities();
  console.log('Total charities:', totalCharities.toString());
  
  // Check the latest charity
  const latestId = Number(totalCharities) - 1;
  if (latestId >= 0) {
    const charity = await contract.getCharity(latestId);
    console.log(`\nLatest Charity (ID ${latestId}):`);
    console.log('Name:', charity[0]);
    console.log('AI Score:', charity[4].toString());
    console.log('Status:', charity[5], '(0=Pending, 1=Approved, 2=Rejected)');
    console.log('Wallet:', charity[3]);
  }
}

main();
