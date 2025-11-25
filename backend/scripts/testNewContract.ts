import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  
  const contractAddress = '0x04b2176dd992CF1b3A50e3a0253fF4b2AD1E7790';
  
  // Minimal ABI for testing
  const abi = [
    "function registerCharity(string _name, string _description, string _ipfsHash, address _walletAddress, uint256 _fundingGoal, uint256 _deadline, string[] _imageHashes) returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  // Use a random new wallet address
  const testWallet = ethers.Wallet.createRandom();
  
  console.log('Testing gas estimation...');
  console.log('Test wallet:', testWallet.address);
  
  try {
    const gasEstimate = await contract.registerCharity.estimateGas(
      "Test Charity",
      "Test Description",
      "QmTestHash",
      testWallet.address,
      ethers.parseEther("10"),
      0,
      []
    );
    
    console.log('✅ Gas estimate:', gasEstimate.toString());
    console.log('Recommended gas limit:', (gasEstimate * 120n / 100n).toString(), '(+20% buffer)');
    
  } catch (error: any) {
    console.error('❌ Gas estimation failed:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

main();
