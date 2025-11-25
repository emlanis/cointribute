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
    preferredToken: 'ETH', // ETH or USDC
  });

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  useEffect(() => {
    if (isSuccess) {
      setFormData({
        name: '',
        description: '',
        walletAddress: '',
        ipfsHash: '',
        fundingGoal: '',
        deadline: '',
        preferredToken: 'ETH',
      });
      alert('🎉 Registration submitted! Your cause will be reviewed by our AI verification system within seconds.');
      reset();
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      alert(`❌ Transaction failed: ${error.message}\n\nTip: Wait 30 seconds and try again. Make sure you have enough Base Sepolia ETH for gas.`);
      reset();
    }
  }, [error, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.description || !formData.walletAddress || !formData.fundingGoal || !formData.deadline) {
      alert('Please fill in all required fields including the campaign deadline');
      return;
    }

    try {
      // Convert funding goal from ETH/USDC to wei
      const fundingGoalWei = parseEther(formData.fundingGoal);

      // Convert deadline to timestamp (REQUIRED)
      const deadlineTimestamp = BigInt(Math.floor(new Date(formData.deadline).getTime() / 1000));

      // Validate deadline is in the future
      if (deadlineTimestamp <= BigInt(Math.floor(Date.now() / 1000))) {
        alert('Deadline must be in the future');
        return;
      }

      // Store preferred token in description for now (until contract upgrade)
      const descriptionWithToken = `${formData.description}\n\n[Preferred Donation Token: ${formData.preferredToken}]`;

      console.log('Submitting charity registration:', {
        name: formData.name,
        walletAddress: formData.walletAddress,
        fundingGoal: formData.fundingGoal,
        preferredToken: formData.preferredToken,
      });

      // Use placeholder IPFS hash if none provided (contract requires it)
      const ipfsHash = formData.ipfsHash || 'QmPlaceholder123456789';

      writeContract({
        address: charityRegistry.address,
        abi: charityRegistry.abi,
        functionName: 'registerCharity',
        args: [
          formData.name,
          descriptionWithToken,
          ipfsHash,
          formData.walletAddress as `0x${string}`,
          fundingGoalWei,
          deadlineTimestamp,
          [], // imageHashes - empty array for now, will add upload feature next
        ],
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(`Error: ${err?.message || 'Unknown error occurred'}`);
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

              {/* Preferred Donation Token */}
              <div>
                <label htmlFor="preferredToken" className="block text-sm font-medium text-gray-900 mb-2">
                  Preferred Donation Token <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredToken: 'ETH' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.preferredToken === 'ETH'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💎</div>
                      <div className="font-semibold text-gray-900">ETH</div>
                      <div className="text-xs text-gray-600 mt-1">Native Token</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredToken: 'USDC' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.preferredToken === 'USDC'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💵</div>
                      <div className="font-semibold text-gray-900">USDC</div>
                      <div className="text-xs text-gray-600 mt-1">Stablecoin</div>
                    </div>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Select your preferred donation currency. Donors can contribute using {formData.preferredToken}.
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
                  Funding Goal ({formData.preferredToken}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 pr-16 border text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">{formData.preferredToken}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Target amount you want to raise for your cause in {formData.preferredToken}
                </p>
              </div>

              {/* Campaign Deadline (REQUIRED) */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-900 mb-2">
                  Campaign Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-600">
                  <strong>Required:</strong> Campaign deadline for fundraising. Funds will be automatically released when goal is reached OR deadline passes.
                </p>
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs text-amber-900">
                    💡 <strong>How it works:</strong> Donations are held until (1) your goal is reached OR (2) deadline passes. Whichever comes first triggers automatic fund release!
                  </p>
                </div>
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
