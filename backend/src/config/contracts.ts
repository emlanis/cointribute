export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x3c921FCB6E75bDD7C0386D14CA5594030D7e6df0',
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
          {"name": "isActive", "type": "bool"},
          {"name": "totalETHDonations", "type": "uint256"},
          {"name": "totalUSDCDonations", "type": "uint256"},
          {"name": "imageHashes", "type": "string[]"}
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
  },
  {
    "inputs": [
      {"name": "role", "type": "bytes32"},
      {"name": "account", "type": "address"}
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
