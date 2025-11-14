const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  const totalCharities = await CharityRegistry.getTotalCharities();
  console.log(`\n📊 Total Charities: ${totalCharities}\n`);

  // Check the latest charity
  if (totalCharities > 0) {
    const latestId = Number(totalCharities) - 1;
    const charity = await CharityRegistry.getCharity(latestId);

    console.log(`Latest Charity (ID ${latestId}):`);
    console.log(`   Name: ${charity[0]}`);
    console.log(`   AI Score: ${charity[4]}/100`);
    console.log(`   Status: ${charity[5]} (0=Pending, 1=Approved, 2=Rejected)`);
    console.log(`   Is Active: ${charity[13]}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
