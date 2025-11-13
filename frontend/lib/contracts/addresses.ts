/**
 * Contract Addresses for Cointribute Platform
 * Network: Base Sepolia Testnet
 * Deployed: November 13, 2025 (Updated with Fundraising Goals)
 */

export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828' as `0x${string}`,
  VibeToken: '0x34a4fd87D99D14817289CA4348559c72aF74F367' as `0x${string}`,
  ImpactNFT: '0x00dFc2353485a56ee554da65F6bD1Ba8aFEF1C89' as `0x${string}`,
  DonationManager: '0x2b1F4bFc8DC29e96e86c5E2A85b48D5920f63fe7' as `0x${string}`,
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
