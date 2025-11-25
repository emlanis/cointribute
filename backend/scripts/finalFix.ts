import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CHARITY_REGISTRY_ABI } from '../src/config/contracts';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CharityRegistry,
    CHARITY_REGISTRY_ABI,
    adminWallet
  );

  // Create a second wallet (for testing, just use a random wallet)
  const secondWallet = ethers.Wallet.createRandom().connect(provider);
  console.log('Second verifier address:', secondWallet.address);

  // Fund the second wallet
  console.log('\n1. Funding second wallet...');
  const fundTx = await adminWallet.sendTransaction({
    to: secondWallet.address,
    value: ethers.parseEther('0.01')
  });
  await fundTx.wait();
  console.log('✅ Funded');

  // Grant VERIFIER_ROLE to second wallet
  console.log('\n2. Granting VERIFIER_ROLE...');
  const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));
  const grantTx = await contract.grantRole(VERIFIER_ROLE, secondWallet.address);
  await grantTx.wait();
  console.log('✅ Role granted');

  // Approve from second wallet
  console.log('\n3. Approving charity 0 from second verifier...');
  const contractWithSecond = contract.connect(secondWallet);
  const approveTx = await contractWithSecond.approveCharity(0);
  console.log('   Transaction hash:', approveTx.hash);
  const approveReceipt = await approveTx.wait();
  console.log('✅ Approved in block:', approveReceipt.blockNumber);

  console.log('\n✅ Charity 0 should now be approved!');
}

main().catch(console.error);
