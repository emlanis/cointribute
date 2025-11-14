const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const CHARITY_ID = 1; // Nigerian Education charity

  console.log("\n✅ Manually Approving Charity 1");
  console.log("===============================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Using wallet: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Check current state
  const charity = await CharityRegistry.getCharity(CHARITY_ID);
  const approvalCount = await CharityRegistry.approvalCount(CHARITY_ID);
  const hasApproved = await CharityRegistry.approvals(CHARITY_ID, deployer.address);
  const requiredApprovals = await CharityRegistry.requiredApprovals();

  console.log(`📊 Current State:`);
  console.log(`   Charity: ${charity[0]}`);
  console.log(`   AI Score: ${charity[4]}/100`);
  console.log(`   Status: ${charity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
  console.log(`   Approval Count: ${approvalCount}/${requiredApprovals}`);
  console.log(`   Deployer has approved: ${hasApproved}\n`);

  if (hasApproved) {
    console.log("⚠️  Deployer has already approved this charity!");
    console.log("   Cannot approve again.\n");
    return;
  }

  if (charity[5] !== 0n) {
    console.log(`⚠️  Charity status is ${charity[5]}, not Pending (0)`);
    console.log("   Cannot approve non-pending charity.\n");
    return;
  }

  console.log(`🔄 Approving charity ${CHARITY_ID}...`);

  try {
    const tx = await CharityRegistry.approveCharity(CHARITY_ID);
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ Approved in block ${receipt.blockNumber}!`);

    // Check new state
    const newCharity = await CharityRegistry.getCharity(CHARITY_ID);
    const newApprovalCount = await CharityRegistry.approvalCount(CHARITY_ID);

    console.log(`\n📊 New State:`);
    console.log(`   AI Score: ${newCharity[4]}/100`);
    console.log(`   Status: ${newCharity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
    console.log(`   Approval Count: ${newApprovalCount}/${requiredApprovals}`);
    console.log(`   Is Active: ${newCharity[13]}\n`);

    if (newCharity[5] === 1) {
      console.log("🎉 SUCCESS! Charity is now APPROVED!\n");
    } else {
      console.log(`⚠️  Status is still ${newCharity[5]}, not Approved (1)\n`);
    }

  } catch (error) {
    console.error("\n❌ Approval failed:");
    console.error(`   Error: ${error.message}\n`);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
