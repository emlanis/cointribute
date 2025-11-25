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

  const charityId = 0;
  const charityData = await contract.getCharity(charityId);

  console.log('📊 Charity Data from Blockchain:');
  console.log('================================\n');
  console.log('All fields (raw):');
  charityData.forEach((field: any, index: number) => {
    console.log(`  [${index}]: ${field}`);
  });

  console.log('\n\nInterpreted fields:');
  console.log(`  Name: ${charityData[0]}`);
  console.log(`  Description: ${charityData[1]}`);
  console.log(`  IPFS Hash: ${charityData[2]}`);
  console.log(`  Wallet Address: ${charityData[3]}`);
  console.log(`  AI Score: ${charityData[4]}`);
  console.log(`  Status: ${charityData[5]} (0=Pending, 1=Approved, 2=Rejected)`);
  console.log(`  Registered At: ${new Date(Number(charityData[6]) * 1000).toISOString()}`);
  console.log(`  Verified At: ${charityData[7] > 0 ? new Date(Number(charityData[7]) * 1000).toISOString() : 'Not verified'}`);
  console.log(`  Verified By: ${charityData[8]}`);
  console.log(`  Total Donations Received: ${ethers.formatEther(charityData[9])} ETH`);
  console.log(`  Donor Count: ${charityData[10]}`);
  console.log(`  Funding Goal: ${ethers.formatEther(charityData[11])} ETH`);
  console.log(`  Deadline: ${charityData[12] > 0 ? new Date(Number(charityData[12]) * 1000).toISOString() : 'No deadline'}`);
  console.log(`  Is Active: ${charityData[13]}`);
  console.log(`  Total ETH Donations: ${ethers.formatEther(charityData[14])} ETH`);
  console.log(`  Total USDC Donations: ${ethers.formatUnits(charityData[15], 6)} USDC`);
  console.log(`  Image Hashes: ${charityData[16] || '[]'}`);
}

main();
