const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const CHARITY_ID = 0;

  console.log("\n🔧 Fixing Charity 0 Stuck State");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Primary wallet: ${deployer.address}\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Create a temporary second wallet
  const secondWallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  console.log(`   Created temporary wallet: ${secondWallet.address}`);

  // Fund the second wallet with some ETH for gas
  console.log(`   Funding temporary wallet with 0.01 ETH...`);
  const fundTx = await deployer.sendTransaction({
    to: secondWallet.address,
    value: hre.ethers.parseEther("0.01")
  });
  await fundTx.wait();
  console.log(`   ✅ Funded\n`);

  // Grant VERIFIER_ROLE to second wallet
  const VERIFIER_ROLE = await CharityRegistry.VERIFIER_ROLE();
  console.log(`   Granting VERIFIER_ROLE to temporary wallet...`);
  const grantTx = await CharityRegistry.grantRole(VERIFIER_ROLE, secondWallet.address);
  await grantTx.wait();
  console.log(`   ✅ Role granted\n`);

  // Check current state
  const charity = await CharityRegistry.getCharity(CHARITY_ID);
  const approvalCount = await CharityRegistry.approvalCount(CHARITY_ID);
  const hasApproved = await CharityRegistry.approvals(CHARITY_ID, secondWallet.address);

  console.log(`📊 Current State:`);
  console.log(`   Charity: ${charity[0]}`);
  console.log(`   Status: ${charity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
  console.log(`   Approval Count: ${approvalCount}`);
  console.log(`   Second wallet has approved: ${hasApproved}\n`);

  // Approve with second wallet
  console.log(`   Second wallet approving charity ${CHARITY_ID}...`);
  const CharityRegistryWithSecondWallet = CharityRegistry.connect(secondWallet);
  const approveTx = await CharityRegistryWithSecondWallet.approveCharity(CHARITY_ID);
  console.log(`   Transaction hash: ${approveTx.hash}`);
  console.log(`   Waiting for confirmation...\n`);

  const receipt = await approveTx.wait();
  console.log(`   ✅ Approved in block ${receipt.blockNumber}!\n`);

  // Check new state
  const newCharity = await CharityRegistry.getCharity(CHARITY_ID);
  const newApprovalCount = await CharityRegistry.approvalCount(CHARITY_ID);

  console.log(`📊 New State:`);
  console.log(`   Status: ${newCharity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
  console.log(`   Approval Count: ${newApprovalCount}`);
  console.log(`   Is Active: ${newCharity[13]}\n`);

  if (newCharity[5] === 1n) {
    console.log("🎉 SUCCESS! Charity 0 is now APPROVED!\n");
  } else {
    console.log(`⚠️  Status is ${newCharity[5]}, not Approved (1)\n`);
  }

  // Clean up: revoke role from temporary wallet
  console.log(`   Revoking VERIFIER_ROLE from temporary wallet...`);
  const revokeTx = await CharityRegistry.revokeRole(VERIFIER_ROLE, secondWallet.address);
  await revokeTx.wait();
  console.log(`   ✅ Role revoked\n`);

  console.log("✅ Fix complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
