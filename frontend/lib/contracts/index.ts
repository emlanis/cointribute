/**
 * Cointribute Smart Contract Configuration
 * Exports contract addresses and ABIs for use with Wagmi
 */

import { CONTRACT_ADDRESSES } from './addresses';
import CharityRegistryABI from './CharityRegistry.json';
import VibeTokenABI from './VibeToken.json';
import ImpactNFTABI from './ImpactNFT.json';
import DonationManagerABI from './DonationManager.json';

// Contract configurations for Wagmi
export const contracts = {
  CharityRegistry: {
    address: CONTRACT_ADDRESSES.CharityRegistry,
    abi: CharityRegistryABI.abi,
  },
  VibeToken: {
    address: CONTRACT_ADDRESSES.VibeToken,
    abi: VibeTokenABI.abi,
  },
  ImpactNFT: {
    address: CONTRACT_ADDRESSES.ImpactNFT,
    abi: ImpactNFTABI.abi,
  },
  DonationManager: {
    address: CONTRACT_ADDRESSES.DonationManager,
    abi: DonationManagerABI.abi,
  },
} as const;

// Export individual contracts for convenience
export const charityRegistry = contracts.CharityRegistry;
export const vibeToken = contracts.VibeToken;
export const impactNFT = contracts.ImpactNFT;
export const donationManager = contracts.DonationManager;

// Export addresses
export { CONTRACT_ADDRESSES };

// Export ABIs
export { CharityRegistryABI, VibeTokenABI, ImpactNFTABI, DonationManagerABI };
