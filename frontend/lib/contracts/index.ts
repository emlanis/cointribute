/**
 * Cointribute Smart Contract Configuration
 * Exports contract addresses and ABIs for use with Wagmi
 */

import { CONTRACT_ADDRESSES } from './addresses';
import CharityRegistryABI from './CharityRegistry.json';
import VibeTokenABI from './VibeToken.json';
import ImpactNFTABI from './ImpactNFT.json';
import DonationManagerABI from './DonationManager.json';

// Standard ERC20 ABI for USDC
const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address","name": "spender","type": "address"},{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8","name": "","type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"},{"internalType": "address","name": "spender","type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

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
  USDC: {
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
  },
} as const;

// Export individual contracts for convenience
export const charityRegistry = contracts.CharityRegistry;
export const vibeToken = contracts.VibeToken;
export const impactNFT = contracts.ImpactNFT;
export const donationManager = contracts.DonationManager;
export const usdc = contracts.USDC;

// Export addresses
export { CONTRACT_ADDRESSES };

// Export ABIs
export { CharityRegistryABI, VibeTokenABI, ImpactNFTABI, DonationManagerABI };
