const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const NEW_REQUIRED_APPROVALS = 1;

  console.log("\n⚙️  Setting Required Approvals");
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

  // Check current required approvals
  const currentRequired = await CharityRegistry.requiredApprovals();
  console.log(`📊 Current required approvals: ${currentRequired}`);
  console.log(`   New required approvals: ${NEW_REQUIRED_APPROVALS}\n`);

  if (Number(currentRequired) === NEW_REQUIRED_APPROVALS) {
    console.log("✅ Required approvals already set to desired value!\n");
    return;
  }

  console.log(`🔧 Setting required approvals to ${NEW_REQUIRED_APPROVALS}...`);

  try {
    const tx = await CharityRegistry.setRequiredApprovals(NEW_REQUIRED_APPROVALS);
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ Updated in block ${receipt.blockNumber}!`);

    // Verify
    const newRequired = await CharityRegistry.requiredApprovals();
    console.log(`   Verification: ${newRequired} approval(s) now required\n`);

    console.log("✅ Configuration complete!\n");

  } catch (error) {
    console.error("❌ Configuration failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
