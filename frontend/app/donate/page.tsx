'use client';

import { MainLayout } from '@/components/MainLayout';
import { charityRegistry, donationManager } from '@/lib/contracts';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useSearchParams } from 'next/navigation';

export default function DonatePage() {
  const searchParams = useSearchParams();
  const preselectedCharityId = searchParams.get('charity');

  const [selectedCharityId, setSelectedCharityId] = useState<string>(preselectedCharityId || '');
  const [donationAmount, setDonationAmount] = useState('');

  const { data: charityCount } = useReadContract({
    ...charityRegistry,
    functionName: 'getTotalCharities',
  });

  const totalCharities = charityCount ? Number(charityCount) : 0;

  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: selectedCharityId ? [BigInt(selectedCharityId)] : undefined,
    query: {
      enabled: !!selectedCharityId,
    },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      setDonationAmount('');
      alert('🎉 Cointribution successful! You earned VIBE tokens!');
    }
  }, [isSuccess]);

  const handleDonate = async () => {
    if (!selectedCharityId || !donationAmount) {
      alert('Please select a charity and enter an amount');
      return;
    }

    try {
      writeContract({
        ...donationManager,
        functionName: 'donateETH',
        args: [BigInt(selectedCharityId)],
        value: parseEther(donationAmount),
      });
    } catch (err) {
      console.error('Donation error:', err);
    }
  };

  const platformFee = donationAmount ? (parseFloat(donationAmount) * 0.025).toFixed(4) : '0';
  const netDonation = donationAmount ? (parseFloat(donationAmount) * 0.975).toFixed(4) : '0';
  const vibeReward = donationAmount ? (parseFloat(donationAmount) * 10).toFixed(2) : '0';

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Make a Cointribution
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Support verified causes and earn VIBE tokens
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {totalCharities === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No verified charities available yet.</p>
              <a href="/register-charity" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                Register your charity →
              </a>
            </div>
          ) : (
            <>
              {/* Charity Selection */}
              <div className="mb-6">
                <label htmlFor="charity" className="block text-sm font-medium text-gray-900 mb-2">
                  Select Cause
                </label>
                <select
                  id="charity"
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                >
                  <option value="">Choose a charity...</option>
                  {Array.from({ length: totalCharities }, (_, i) => (
                    <CharityOption key={i} charityId={i} />
                  ))}
                </select>
              </div>

              {/* Selected Charity Info */}
              {charity && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{charity.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{charity.description}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-gray-600">AI Score: <strong>{charity.aiScore.toString()}/100</strong></span>
                    <span className="text-gray-600">Donors: <strong>{charity.donorCount.toString()}</strong></span>
                  </div>
                </div>
              )}

              {/* Donation Amount */}
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
                  Cointribution Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    step="0.001"
                    min="0"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">ETH</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {['0.01', '0.05', '0.1', '0.5', '1'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount)}
                      className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {amount} ETH
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              {donationAmount && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Transaction Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Your cointribution:</span>
                    <span className="font-medium text-gray-900">{donationAmount} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Platform fee (2.5%):</span>
                    <span className="font-medium text-gray-600">-{platformFee} ETH</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span className="text-gray-900 font-semibold">Cause receives:</span>
                    <span className="font-semibold text-green-600">{netDonation} ETH</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VIBE rewards:</span>
                      <span className="font-semibold text-purple-600">+{vibeReward} VIBE</span>
                    </div>
                    {parseFloat(donationAmount) >= 1 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Eligible for Impact NFT!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    {error.message.includes('User rejected')
                      ? 'Transaction cancelled'
                      : 'Error: ' + error.message.slice(0, 100)}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Cointribution successful! Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                  </p>
                </div>
              )}

              {/* Cointribute Button */}
              <button
                onClick={handleDonate}
                disabled={!selectedCharityId || !donationAmount || isPending || isConfirming}
                className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Confirm in wallet...' :
                 isConfirming ? 'Processing...' :
                 'Cointribute Now'}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                Make sure you're connected to Base Sepolia network
              </p>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function CharityOption({ charityId }: { charityId: number }) {
  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: [BigInt(charityId)],
  });

  if (!charity) return null;

  const isVerified = charity.status === 1 && charity.isActive;
  if (!isVerified) return null;

  return (
    <option value={charityId}>
      {charity.name} (AI Score: {charity.aiScore.toString()}/100)
    </option>
  );
}
