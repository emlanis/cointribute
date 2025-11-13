'use client';

import { MainLayout } from '@/components/MainLayout';
import { charityRegistry, donationManager } from '@/lib/contracts';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useParams } from 'next/navigation';

export default function CauseDetailPage() {
  const params = useParams();
  const causeId = params.id as string;
  const [donationAmount, setDonationAmount] = useState('');

  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: [BigInt(causeId)],
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setDonationAmount('');
      alert('🎉 Cointribution successful! You earned VIBE tokens!');
    }
  }, [isSuccess]);

  const handleDonate = async () => {
    if (!donationAmount) {
      alert('Please enter an amount');
      return;
    }

    try {
      writeContract({
        ...donationManager,
        functionName: 'donateETH',
        args: [BigInt(causeId)],
        value: parseEther(donationAmount),
      });
    } catch (err) {
      console.error('Donation error:', err);
    }
  };

  if (!charity) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading cause details...</div>
        </div>
      </MainLayout>
    );
  }

  const isVerified = charity.status === 1 && charity.isActive;
  const totalRaised = formatEther(charity.totalDonationsReceived);
  const fundingGoal = formatEther(charity.fundingGoal);
  const percentRaised = (Number(totalRaised) / Number(fundingGoal)) * 100;
  const remainingAmount = Number(fundingGoal) - Number(totalRaised);

  // Calculate time remaining
  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(charity.deadline);
  const hasDeadline = deadline > 0;
  const daysRemaining = hasDeadline ? Math.ceil((deadline - now) / (24 * 60 * 60)) : null;
  const isExpired = hasDeadline && now >= deadline;

  // Share URLs
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Support ${charity.name} on Cointribute! ${charity.description.slice(0, 100)}...`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(charity.name)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    farcaster: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`,
    lens: `https://hey.xyz/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <a href="/charities" className="hover:text-gray-900">Causes</a>
            <span>›</span>
            <span className="text-gray-900">{charity.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cause Title & Status */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{charity.name}</h1>
                {isVerified && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{Number(totalRaised).toFixed(4)} ETH</span>
                    <span className="text-gray-600 ml-2">raised of {Number(fundingGoal).toFixed(2)} ETH goal</span>
                  </div>
                  <span className="text-lg font-semibold text-purple-600">{percentRaised.toFixed(1)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentRaised, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{charity.donorCount.toString()}</div>
                  <div className="text-sm text-gray-600">Cointributors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {remainingAmount > 0 ? remainingAmount.toFixed(2) : '0'} ETH
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {hasDeadline ? (isExpired ? 'Ended' : `${daysRemaining} days`) : 'No deadline'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {hasDeadline ? (isExpired ? 'Campaign ended' : 'left') : 'Open'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Cause</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{charity.description}</p>

              {charity.ipfsHash && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Supporting Documents:</p>
                  <a
                    href={`https://ipfs.io/ipfs/${charity.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    View on IPFS
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Share This Cause</h2>
              <p className="text-gray-600 mb-4">Help spread the word and make a bigger impact!</p>

              <div className="space-y-4">
                {/* Web2 Social Platforms */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Social Media</p>
                  <div className="flex flex-wrap gap-2">
                    <ShareButton
                      href={shareLinks.twitter}
                      icon="𝕏"
                      label="Twitter/X"
                      bgColor="bg-black hover:bg-gray-800"
                    />
                    <ShareButton
                      href={shareLinks.facebook}
                      icon="f"
                      label="Facebook"
                      bgColor="bg-blue-600 hover:bg-blue-700"
                    />
                    <ShareButton
                      href={shareLinks.reddit}
                      icon="R"
                      label="Reddit"
                      bgColor="bg-orange-600 hover:bg-orange-700"
                    />
                    <ShareButton
                      href={shareLinks.telegram}
                      icon="✈"
                      label="Telegram"
                      bgColor="bg-blue-500 hover:bg-blue-600"
                    />
                    <ShareButton
                      href={shareLinks.whatsapp}
                      icon="W"
                      label="WhatsApp"
                      bgColor="bg-green-600 hover:bg-green-700"
                    />
                    <ShareButton
                      href={shareLinks.linkedin}
                      icon="in"
                      label="LinkedIn"
                      bgColor="bg-blue-700 hover:bg-blue-800"
                    />
                  </div>
                </div>

                {/* Web3 Social Platforms */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Web3 Social</p>
                  <div className="flex flex-wrap gap-2">
                    <ShareButton
                      href={shareLinks.farcaster}
                      icon="🟣"
                      label="Farcaster"
                      bgColor="bg-purple-600 hover:bg-purple-700"
                    />
                    <ShareButton
                      href={shareLinks.lens}
                      icon="🌿"
                      label="Lens/Hey"
                      bgColor="bg-green-500 hover:bg-green-600"
                    />
                  </div>
                </div>

                {/* Copy Link */}
                <div className="pt-2 border-t">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Cause Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cause Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Trust Score:</span>
                  <span className="font-semibold text-gray-900">{charity.aiScore.toString()}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(Number(charity.registeredAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
                {charity.verifiedAt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(Number(charity.verifiedAt) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donation Card - Right Side (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-lg border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Make a Cointribution</h3>

              {!isVerified ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">This cause is pending verification</p>
                  <p className="text-sm text-gray-500">Check back soon!</p>
                </div>
              ) : isExpired ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">This campaign has ended</p>
                  <p className="text-sm text-gray-500">Thank you to all cointributors!</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      step="0.001"
                      min="0"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900"
                    />
                    <div className="mt-2 flex gap-2">
                      {['0.01', '0.05', '0.1', '0.5'].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount)}
                          className="flex-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {donationAmount && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Your cointribution:</span>
                        <span className="font-semibold text-gray-900">{donationAmount} ETH</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Platform fee (2.5%):</span>
                        <span className="text-gray-600">-{(parseFloat(donationAmount) * 0.025).toFixed(4)} ETH</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-purple-300">
                        <span className="font-semibold text-gray-900">Cause receives:</span>
                        <span className="font-semibold text-green-600">
                          {(parseFloat(donationAmount) * 0.975).toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-purple-300">
                        <div className="flex justify-between">
                          <span className="text-gray-700">You earn:</span>
                          <span className="font-semibold text-purple-600">
                            +{(parseFloat(donationAmount) * 10).toFixed(0)} VIBE
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        {error.message.includes('User rejected') ? 'Transaction cancelled' : 'Error occurred'}
                      </p>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">✅ Cointribution successful!</p>
                    </div>
                  )}

                  <button
                    onClick={handleDonate}
                    disabled={!donationAmount || isPending || isConfirming}
                    className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : 'Cointribute Now'}
                  </button>

                  <p className="mt-3 text-xs text-center text-gray-500">
                    Cointributions over 1 ETH earn an Impact NFT!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ShareButton({ href, icon, label, bgColor }: { href: string; icon: string; label: string; bgColor: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium ${bgColor} transition-colors`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </a>
  );
}
