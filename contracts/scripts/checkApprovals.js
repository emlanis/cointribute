const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const CHARITY_ID = 0;

  console.log("\n🔍 Checking Approval Status");
  console.log("===========================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Checking with wallet: ${deployer.address}\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Check required approvals
  const requiredApprovals = await CharityRegistry.requiredApprovals();
  console.log(`⚙️  Required approvals: ${requiredApprovals}`);

  // Check both charities
  for (let charityId = 0; charityId < 2; charityId++) {
    console.log(`\n📋 Charity ID ${charityId}:`);

    // Check approval count
    const approvalCount = await CharityRegistry.approvalCount(charityId);
    console.log(`   Approval count: ${approvalCount}`);

    // Check if deployer has already approved
    const hasApproved = await CharityRegistry.approvals(charityId, deployer.address);
    console.log(`   Deployer has approved: ${hasApproved}`);

    // Check charity details
    const charity = await CharityRegistry.getCharity(charityId);
    console.log(`   Name: ${charity[0]}`);
    console.log(`   AI Score: ${charity[4]}/100`);
    console.log(`   Status: ${charity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
  }

  // Check minimum AI score
  const minimumAiScore = await CharityRegistry.minimumAiScore();
  console.log(`\n⚙️  Minimum AI score required: ${minimumAiScore}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
