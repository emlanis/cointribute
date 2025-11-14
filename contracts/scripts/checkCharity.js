const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";
  const CHARITY_ID = 0;

  console.log("\n🔍 Checking Charity Status");
  console.log("==========================\n");

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Get charity details
  const charity = await CharityRegistry.getCharity(CHARITY_ID);

  console.log(`📊 Charity ID ${CHARITY_ID}:`);
  console.log(`   Name: ${charity.name}`);
  console.log(`   Description: ${charity.description.substring(0, 80)}...`);
  console.log(`   Status: ${charity.status} (0=Pending, 1=Approved, 2=Rejected)`);
  console.log(`   AI Score: ${charity.aiScore}/100`);
  console.log(`   Is Active: ${charity.isActive}`);
  console.log(`   Registered At: ${new Date(Number(charity.registeredAt) * 1000).toISOString()}`);
  console.log(`   Verified At: ${charity.verifiedAt > 0 ? new Date(Number(charity.verifiedAt) * 1000).toISOString() : 'Not verified'}`);
  console.log(`   Verified By: ${charity.verifiedBy}`);

  // Get total charities
  const totalCharities = await CharityRegistry.getTotalCharities();
  console.log(`\n   Total Charities: ${totalCharities}`);

  // Check role
  const [deployer] = await hre.ethers.getSigners();
  const VERIFIER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("VERIFIER_ROLE")
  );
  const hasRole = await CharityRegistry.hasRole(VERIFIER_ROLE, deployer.address);
  console.log(`   Deployer has VERIFIER_ROLE: ${hasRole}`);

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
