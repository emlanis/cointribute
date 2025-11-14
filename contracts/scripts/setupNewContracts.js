const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x1D7503fCC34eD0e16CDEE2EbCdE02B5a1A598DBF";

  console.log("\n⚙️  Setting up new contracts for automated AI verification\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Using wallet: ${deployer.address}\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Set required approvals to 1 for automated verification
  console.log("   Setting requiredApprovals to 1...");
  const tx = await CharityRegistry.setRequiredApprovals(1);
  await tx.wait();
  console.log("   ✅ Required approvals set to 1\n");

  // Verify
  const requiredApprovals = await CharityRegistry.requiredApprovals();
  console.log(`📊 Current Configuration:`);
  console.log(`   Required Approvals: ${requiredApprovals}`);
  console.log(`   Total Charities: ${await CharityRegistry.getTotalCharities()}\n`);

  console.log("✅ Setup complete! Backend can now auto-approve charities.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
