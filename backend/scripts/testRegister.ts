import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  
  // Add explicit ABI for registerCharity
  const abi = [
    {
      "inputs": [
        {"name": "_name", "type": "string"},
        {"name": "_description", "type": "string"},
        {"name": "_ipfsHash", "type": "string"},
        {"name": "_walletAddress", "type": "address"},
        {"name": "_fundingGoal", "type": "uint256"},
        {"name": "_deadline", "type": "uint256"},
        {"name": "_imageHashes", "type": "string[]"}
      ],
      "name": "registerCharity",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    abi,
    wallet
  );

  console.log('Testing charity registration...');
  console.log('Wallet:', wallet.address);
  console.log('Contract:', CONTRACT_ADDRESSES.CharityRegistry);
  
  try {
    // Estimate gas first
    console.log('\nEstimating gas...');
    const gasEstimate = await contract.registerCharity.estimateGas(
      "Test Charity " + Date.now(),
      "This is a test charity registration",
      "QmTestHash123",
      wallet.address,
      ethers.parseEther("10"),
      0,
      []
    );
    console.log('Gas estimate:', gasEstimate.toString());
    
    // Now send the transaction
    console.log('\nSending transaction...');
    const tx = await contract.registerCharity(
      "Test Charity " + Date.now(),
      "This is a test charity registration to verify the contract works",
      "QmTestHash123",
      wallet.address,
      ethers.parseEther("10"),
      0,
      [],
      { gasLimit: gasEstimate * 120n / 100n } // Add 20% buffer
    );
    
    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Success! Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

main();
