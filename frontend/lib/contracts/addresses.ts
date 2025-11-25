/**
 * Contract Addresses for Cointribute Platform
 * Network: Base Sepolia Testnet
 * Deployed: November 24, 2025
 * Features: Multiple charities per wallet with 3-month cooldown + active charity check
 */

export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0xc8928b40C1A494E1f039665E6f0C2ce64681254a' as `0x${string}`,
  VibeToken: '0xc2780b90e32aAf93f7829929ac3A234Bc49617B6' as `0x${string}`,
  ImpactNFT: '0xc241E5103a6B1E404024ADbA170C4Ca81003B459' as `0x${string}`,
  DonationManager: '0x2d70ECd4ee1010Ac4CE53b5a284eC0e3c96Ed748' as `0x${string}`,
  // USDC on Base Sepolia
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
} as const;

export const DEPLOYER_ADDRESS = '0x29Dc0B53e65048e0f11C9F21Eb33e444b1b84EB4' as `0x${string}`;

// Basescan URLs
export const BASESCAN_BASE_URL = 'https://sepolia.basescan.org';

export const getContractUrl = (address: string) => {
  return `${BASESCAN_BASE_URL}/address/${address}`;
};

export const getTxUrl = (txHash: string) => {
  return `${BASESCAN_BASE_URL}/tx/${txHash}`;
};
