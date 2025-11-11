const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);
  console.log("⏳ This may take a few minutes...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy CharityRegistry
  console.log("📄 Deploying CharityRegistry...");
  const CharityRegistry = await hre.ethers.getContractFactory("CharityRegistry");
  const charityRegistry = await CharityRegistry.deploy(deployer.address);
  await charityRegistry.waitForDeployment();
  const charityRegistryAddress = await charityRegistry.getAddress();
  console.log("✅ CharityRegistry deployed to:", charityRegistryAddress);

  // Deploy VibeToken
  console.log("\n📄 Deploying VibeToken...");
  const VibeToken = await hre.ethers.getContractFactory("VibeToken");
  const vibeToken = await VibeToken.deploy(deployer.address);
  await vibeToken.waitForDeployment();
  const vibeTokenAddress = await vibeToken.getAddress();
  console.log("✅ VibeToken deployed to:", vibeTokenAddress);

  // Deploy ImpactNFT
  console.log("\n📄 Deploying ImpactNFT...");
  const ImpactNFT = await hre.ethers.getContractFactory("ImpactNFT");
  const baseURI = "https://api.cointribute.xyz/metadata";
  const impactNFT = await ImpactNFT.deploy(deployer.address, baseURI);
  await impactNFT.waitForDeployment();
  const impactNFTAddress = await impactNFT.getAddress();
  console.log("✅ ImpactNFT deployed to:", impactNFTAddress);

  // Deploy DonationManager
  console.log("\n📄 Deploying DonationManager...");
  const DonationManager = await hre.ethers.getContractFactory("DonationManager");
  const feeCollector = deployer.address; // Can be changed later
  const donationManager = await DonationManager.deploy(
    charityRegistryAddress,
    vibeTokenAddress,
    impactNFTAddress,
    feeCollector,
    deployer.address
  );
  await donationManager.waitForDeployment();
  const donationManagerAddress = await donationManager.getAddress();
  console.log("✅ DonationManager deployed to:", donationManagerAddress);

  // Grant roles
  console.log("\n🔐 Granting roles...");

  // Grant MINTER_ROLE to DonationManager in VibeToken
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  await vibeToken.grantRole(MINTER_ROLE, donationManagerAddress);
  console.log("✅ Granted MINTER_ROLE to DonationManager in VibeToken");

  // Grant MINTER_ROLE to DonationManager in ImpactNFT
  await impactNFT.grantRole(MINTER_ROLE, donationManagerAddress);
  console.log("✅ Granted MINTER_ROLE to DonationManager in ImpactNFT");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   CharityRegistry:", charityRegistryAddress);
  console.log("   VibeToken:", vibeTokenAddress);
  console.log("   ImpactNFT:", impactNFTAddress);
  console.log("   DonationManager:", donationManagerAddress);
  console.log("\n💡 Save these addresses to your .env file!");
  console.log("   CHARITY_REGISTRY_ADDRESS=" + charityRegistryAddress);
  console.log("   VIBE_TOKEN_ADDRESS=" + vibeTokenAddress);
  console.log("   IMPACT_NFT_ADDRESS=" + impactNFTAddress);
  console.log("   DONATION_MANAGER_ADDRESS=" + donationManagerAddress);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 To verify contracts on Basescan, run:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${charityRegistryAddress} ${deployer.address}`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${vibeTokenAddress} ${deployer.address}`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${impactNFTAddress} ${deployer.address} "${baseURI}"`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${donationManagerAddress} ${charityRegistryAddress} ${vibeTokenAddress} ${impactNFTAddress} ${feeCollector} ${deployer.address}`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Return addresses for potential use
  return {
    charityRegistry: charityRegistryAddress,
    vibeToken: vibeTokenAddress,
    impactNFT: impactNFTAddress,
    donationManager: donationManagerAddress,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
