const hre = require("hardhat");

async function main() {
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";

  console.log("\n🎯 Registering Test Charity");
  console.log("===========================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Using wallet: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Create a new test wallet address for the charity
  const testWallet = hre.ethers.Wallet.createRandom();

  const charityData = {
    name: "Education For Every Nigerian Child Initiative",
    description: `Nigeria currently has the highest number of out-of-school children in the world, with over 20 million children between ages 6-16 denied access to basic education.

The Education For Every Nigerian Child Initiative works directly in underserved communities across Borno, Yobe, and Kaduna states to break down barriers preventing children from accessing quality education.

Our three-pillar approach includes:
1. Community Learning Centers
2. Girl-Child Education Support
3. Teacher Training & Support

Impact So Far:
- 3,500+ children enrolled
- 89% retention rate over 2 years
- 15 community learning centers established
- 200+ teachers trained and employed

[Preferred Donation Token: USDC]`,
    ipfsHash: "QmTestEducationNigeria123456789",
    walletAddress: testWallet.address,
    fundingGoal: hre.ethers.parseEther("5"), // 5 ETH
    deadline: 0 // No deadline
  };

  console.log(`📝 Charity Details:`);
  console.log(`   Name: ${charityData.name}`);
  console.log(`   Wallet: ${charityData.walletAddress}`);
  console.log(`   Goal: ${hre.ethers.formatEther(charityData.fundingGoal)} ETH`);
  console.log(`   IPFS: ${charityData.ipfsHash}\n`);

  try {
    console.log(`🔄 Submitting transaction...`);
    const tx = await CharityRegistry.registerCharity(
      charityData.name,
      charityData.description,
      charityData.ipfsHash,
      charityData.walletAddress,
      charityData.fundingGoal,
      charityData.deadline
    );

    console.log(`   Transaction hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...\n`);

    const receipt = await tx.wait();
    console.log(`   ✅ Registered in block ${receipt.blockNumber}!`);

    // Get the charity ID from the event
    const event = receipt.logs.find(
      log => log.topics[0] === hre.ethers.id("CharityRegistered(uint256,address,string,uint256)")
    );

    if (event) {
      const charityId = Number(event.topics[1]);
      console.log(`   Charity ID: ${charityId}\n`);

      // Fetch the registered charity
      const registered = await CharityRegistry.getCharity(charityId);
      console.log(`📊 Registered Charity:`);
      console.log(`   Name: ${registered.name}`);
      console.log(`   Status: ${registered.status} (0=Pending)`);
      console.log(`   AI Score: ${registered.aiScore}/100`);
      console.log(`   Funding Goal: ${hre.ethers.formatEther(registered.fundingGoal)} ETH\n`);
    }

    console.log("✅ Registration successful! Backend should pick this up automatically.\n");

  } catch (error) {
    console.error("\n❌ Registration failed:");
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes("already registered")) {
      console.log("💡 Tip: This wallet address is already registered. Try with a different address.\n");
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
