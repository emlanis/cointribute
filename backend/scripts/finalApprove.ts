import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔐 Creating temporary verifier wallet and approving charity\n');

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    adminWallet
  );

  // Create a temporary wallet
  const tempWallet = ethers.Wallet.createRandom().connect(provider);
  console.log(`Temporary wallet created: ${tempWallet.address}\n`);

  try {
    // VERIFIER_ROLE = keccak256("VERIFIER_ROLE")
    const VERIFIER_ROLE = ethers.id("VERIFIER_ROLE");
    console.log(`Step 1: Granting VERIFIER_ROLE to temp wallet...`);
    const grantTx = await contract.grantRole(VERIFIER_ROLE, tempWallet.address);
    await grantTx.wait();
    console.log(`✅ VERIFIER_ROLE granted\n`);

    // Fund the temp wallet with a tiny amount of ETH for gas
    console.log(`Step 2: Funding temp wallet with gas...`);
    const fundTx = await adminWallet.sendTransaction({
      to: tempWallet.address,
      value: ethers.parseEther('0.001') // 0.001 ETH for gas
    });
    await fundTx.wait();
    console.log(`✅ Temp wallet funded\n`);

    // Connect contract with temp wallet
    const tempContract = contract.connect(tempWallet);

    // Approve charity
    console.log(`Step 3: Approving charity ID 0 from temp wallet...`);
    const approveTx = await tempContract.approveCharity(0);
    console.log(`Transaction sent: ${approveTx.hash}`);
    const approveReceipt = await approveTx.wait();
    console.log(`✅ Charity approved in block ${approveReceipt.blockNumber}\n`);

    console.log(`\n✅ SUCCESS! Charity ID 0 is now APPROVED!`);
    console.log(`\n💡 Refresh http://localhost:3000/charities to see it!`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

main();
