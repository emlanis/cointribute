const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const START_BLOCK = 33653000; // Around when we started testing
  const END_BLOCK = 33654000; // Current

  console.log("\n🔍 Searching for Approval Transactions");
  console.log("======================================\n");

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Get CharityVerified events (status change)
  const verifiedFilter = CharityRegistry.filters.CharityVerified();
  const verifiedEvents = await CharityRegistry.queryFilter(verifiedFilter, START_BLOCK, END_BLOCK);

  console.log(`Found ${verifiedEvents.length} CharityVerified events:\n`);

  for (const event of verifiedEvents) {
    console.log(`Block ${event.blockNumber}:`);
    console.log(`   Charity ID: ${event.args.charityId}`);
    console.log(`   Verifier: ${event.args.verifier}`);
    console.log(`   Status: ${event.args.status} (0=Pending, 1=Approved, 2=Rejected)`);
    console.log(`   Transaction: ${event.transactionHash}\n`);
  }

  // Get CharityStatusChanged events
  const statusFilter = CharityRegistry.filters.CharityStatusChanged();
  const statusEvents = await CharityRegistry.queryFilter(statusFilter, START_BLOCK, END_BLOCK);

  console.log(`Found ${statusEvents.length} CharityStatusChanged events:\n`);

  for (const event of statusEvents) {
    console.log(`Block ${event.blockNumber}:`);
    console.log(`   Charity ID: ${event.args.charityId}`);
    console.log(`   Old Status: ${event.args.oldStatus}`);
    console.log(`   New Status: ${event.args.newStatus}`);
    console.log(`   Transaction: ${event.transactionHash}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
