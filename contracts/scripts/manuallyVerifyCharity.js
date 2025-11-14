const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const CHARITY_ID = 0;
  const AI_SCORE = 75; // From AI verification
  const APPROVED = true;

  console.log("\n🔧 Manual Charity Verification");
  console.log("==============================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Using wallet: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  console.log(`📝 Verifying Charity ID ${CHARITY_ID}:`);
  console.log(`   AI Score: ${AI_SCORE}/100`);
  console.log(`   Approved: ${APPROVED}\n`);

  try {
    const tx = await CharityRegistry.verifyCharity(CHARITY_ID, AI_SCORE, APPROVED);
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ Verified in block ${receipt.blockNumber}!\n`);

    // Check new status
    const charity = await CharityRegistry.getCharity(CHARITY_ID);
    console.log(`📊 Updated Charity Status:`);
    console.log(`   Status: ${charity.status} (0=Pending, 1=Approved, 2=Rejected)`);
    console.log(`   AI Score: ${charity.aiScore}/100`);
    console.log(`   Verified By: ${charity.verifiedBy}\n`);

    console.log("✅ Manual verification complete!\n");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
