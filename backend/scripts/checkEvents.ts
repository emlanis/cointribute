import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  
  const iface = new ethers.Interface([
    "event CharityRegistered(uint256 indexed charityId, address indexed registrant, string name, uint256 timestamp)",
    "event CharityApproved(uint256 indexed charityId, address indexed verifier, uint256 timestamp)",
    "event CharityVerified(uint256 indexed charityId, uint8 status, uint256 timestamp)",
    "event AiScoreUpdated(uint256 indexed charityId, uint256 score, uint256 timestamp)"
  ]);
  
  const filter = {
    address: CONTRACT_ADDRESSES.CharityRegistry,
    fromBlock: -10000,
    toBlock: 'latest'
  };
  
  const logs = await provider.getLogs(filter);
  console.log(`Found ${logs.length} events\n`);
  
  for (const log of logs.slice(-20)) {
    try {
      const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
      console.log(`Block ${log.blockNumber}: ${parsed?.name}`);
      console.log(`  Args:`, parsed?.args);
    } catch (e) {
      console.log(`Block ${log.blockNumber}: Unknown event`);
    }
  }
}

main();
