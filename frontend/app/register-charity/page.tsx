'use client';

import { MainLayout } from '@/components/MainLayout';
import { charityRegistry } from '@/lib/contracts';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { useState, useEffect } from 'react';

export default function RegisterCharityPage() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    walletAddress: '',
    ipfsHash: '',
    fundingGoal: '',
    deadline: '',
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setFormData({
        name: '',
        description: '',
        walletAddress: '',
        ipfsHash: '',
        fundingGoal: '',
        deadline: '',
      });
      alert('🎉 Registration submitted! Your cause will be reviewed by our AI verification system.');
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.description || !formData.walletAddress || !formData.fundingGoal) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Convert funding goal from ETH to wei
      const fundingGoalWei = parseEther(formData.fundingGoal);

      // Convert deadline to timestamp (0 if not set)
      const deadlineTimestamp = formData.deadline
        ? BigInt(Math.floor(new Date(formData.deadline).getTime() / 1000))
        : BigInt(0);

      writeContract({
        ...charityRegistry,
        functionName: 'registerCharity',
        args: [
          formData.name,
          formData.description,
          formData.ipfsHash || '',
          formData.walletAddress as `0x${string}`,
          fundingGoalWei,
          deadlineTimestamp,
        ],
      });
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Register Your Cause
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Join our platform and receive transparent cointributions
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {/* Info Banner */}
          <div className="mb-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Submit your cause/charity information below</li>
              <li>Our AI system will verify your cause's legitimacy</li>
              <li>You'll receive an AI trust score (0-100)</li>
              <li>Once approved, you can start receiving cointributions</li>
            </ol>
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Please connect your wallet to register your charity</p>
              <p className="text-sm text-gray-500">
                The connected wallet will be used as your charity's admin address
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cause/Charity Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Cause/Charity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Save the Children Foundation"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your cause's mission and why it needs cointributions..."
                  required
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Provide a clear description to help the AI verify your cause
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-900 mb-2">
                  Wallet Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border font-mono text-sm text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Where cointributions will be sent. Can be different from the admin address.
                </p>
              </div>

              {/* Image/Document Upload */}
              <div>
                <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-900 mb-2">
                  Proof Images/Documents (IPFS Hash)
                </label>
                <input
                  type="text"
                  id="ipfsHash"
                  name="ipfsHash"
                  value={formData.ipfsHash}
                  onChange={handleInputChange}
                  placeholder="QmXxx... or https://ipfs.io/ipfs/QmXxx..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border font-mono text-sm text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Upload images showing proof of need, registration docs, or verification materials to IPFS. This helps improve your AI trust score.
                </p>
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-xs text-purple-900 font-medium mb-1">💡 How to upload:</p>
                  <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://www.pinata.cloud/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">Pinata.cloud</a> or <a href="https://nft.storage/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">NFT.Storage</a></li>
                    <li>Upload your images/documents to get an IPFS hash</li>
                    <li>Paste the IPFS hash (QmXxx...) here</li>
                  </ol>
                </div>
              </div>

              {/* Funding Goal */}
              <div>
                <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-900 mb-2">
                  Funding Goal (ETH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="fundingGoal"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleInputChange}
                  placeholder="10"
                  step="0.01"
                  min="0.01"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Target amount you want to raise for your cause
                </p>
              </div>

              {/* Deadline (Optional) */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-900 mb-2">
                  Campaign Deadline (Optional)
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Set a deadline for your fundraising campaign. Leave empty for no deadline.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    {error.message.includes('User rejected')
                      ? 'Transaction cancelled'
                      : 'Error: ' + error.message.slice(0, 100)}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Registration submitted! Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Your charity will be reviewed by our AI system. Check back soon!
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || isConfirming || !isConnected}
                className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Confirm in wallet...' :
                 isConfirming ? 'Processing...' :
                 'Register Cause'}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Why Register?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Receive transparent blockchain cointributions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Build trust with AI verification score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Access to engaged crypto cointributors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Low platform fees (2.5%)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-2">AI Verification</h3>
            <p className="text-sm text-gray-700 mb-3">
              Our AI system analyzes multiple factors:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Registration documentation & proof images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Online presence and reputation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Historical activities and impact</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Community feedback and reviews</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
