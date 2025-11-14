export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x0cA13eB99B282Cd23490B34C51dF9cBBD8528828',
} as const;

export const CHARITY_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "charityId", "type": "uint256"},
      {"indexed": true, "name": "registrant", "type": "address"},
      {"indexed": false, "name": "name", "type": "string"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "CharityRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getTotalCharities",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_charityId", "type": "uint256"}],
    "name": "getCharity",
    "outputs": [
      {
        "components": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "ipfsHash", "type": "string"},
          {"name": "walletAddress", "type": "address"},
          {"name": "aiScore", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "registeredAt", "type": "uint256"},
          {"name": "verifiedAt", "type": "uint256"},
          {"name": "verifiedBy", "type": "address"},
          {"name": "totalDonationsReceived", "type": "uint256"},
          {"name": "donorCount", "type": "uint256"},
          {"name": "fundingGoal", "type": "uint256"},
          {"name": "deadline", "type": "uint256"},
          {"name": "isActive", "type": "bool"}
        ],
        "name": "charity",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_charityId", "type": "uint256"},
      {"name": "_score", "type": "uint256"}
    ],
    "name": "updateAiScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_charityId", "type": "uint256"}
    ],
    "name": "approveCharity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_charityId", "type": "uint256"}
    ],
    "name": "rejectCharity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requiredApprovals",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_newCount", "type": "uint256"}
    ],
    "name": "setRequiredApprovals",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
