const hre = require("hardhat");

async function main() {
  // Address to grant VERIFIER_ROLE to (your backend admin)
  const BACKEND_ADMIN = "0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4";

  // Contract address
  const CHARITY_REGISTRY = "0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828";

  console.log("\n🔐 Granting VERIFIER_ROLE to Backend Admin");
  console.log("==========================================");
  console.log(`   Contract: ${CHARITY_REGISTRY}`);
  console.log(`   Admin: ${BACKEND_ADMIN}\n`);

  // Get contract instance
  const CharityRegistry = await hre.ethers.getContractAt(
    "CharityRegistry",
    CHARITY_REGISTRY
  );

  // Calculate VERIFIER_ROLE hash
  const VERIFIER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("VERIFIER_ROLE")
  );

  console.log(`   VERIFIER_ROLE hash: ${VERIFIER_ROLE}`);

  // Check if already has role
  const hasRole = await CharityRegistry.hasRole(VERIFIER_ROLE, BACKEND_ADMIN);

  if (hasRole) {
    console.log("\n✅ Admin already has VERIFIER_ROLE!");
    return;
  }

  console.log("   Admin does not have role yet. Granting...\n");

  // Grant role
  const tx = await CharityRegistry.grantRole(VERIFIER_ROLE, BACKEND_ADMIN);
  console.log(`   Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log(`   ✅ Role granted successfully!\n`);

  // Verify
  const hasRoleNow = await CharityRegistry.hasRole(VERIFIER_ROLE, BACKEND_ADMIN);
  console.log(`   Verification: ${hasRoleNow ? "✅ Confirmed" : "❌ Failed"}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
