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

  try {
    const minScore = await contract.minimumAiScore();
    console.log('Minimum AI Score required:', minScore.toString());
    
    const charityData = await contract.getCharity(0);
    console.log('Charity 0 AI Score:', charityData[4].toString());
    
    if (Number(charityData[4]) >= Number(minScore)) {
      console.log('✅ Charity meets minimum score requirement');
    } else {
      console.log('❌ Charity DOES NOT meet minimum score requirement');
    }
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

main();
