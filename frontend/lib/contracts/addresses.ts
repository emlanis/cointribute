/**
 * Contract Addresses for Cointribute Platform
 * Network: Base Sepolia Testnet
 * Deployed: November 14, 2025 (Updated with Multi-Currency Support)
 */

export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x1D7503fCC34eD0e16CDEE2EbCdE02B5a1A598DBF' as `0x${string}`,
  VibeToken: '0x01BC0683f9Af50b1505bFBEaF46eCCdfa65046C3' as `0x${string}`,
  ImpactNFT: '0x3E259f629c804dc7e4dE23b3f5a96D44A59db998' as `0x${string}`,
  DonationManager: '0x74b7F1173347ac24f0E69356b540C0873A1f144F' as `0x${string}`,
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
