/**
 * Contract Addresses for Cointribute Platform
 * Network: Base Sepolia Testnet
 * Deployed: November 25, 2025 (v4.0)
 * Features: Smart fund holding + automatic release when goal reached OR deadline passed
 */

export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0' as `0x${string}`,
  VibeToken: '0x5d1475a5afA0Ac0350a4FA58049E3F0C466d3c47' as `0x${string}`,
  ImpactNFT: '0x4cf4C4af3c8A2bacE821Ddc720248CEfd3d51213' as `0x${string}`,
  DonationManager: '0xF2B1F17C3695cea507CE9F1fe76598c834bf3fb2' as `0x${string}`,
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
