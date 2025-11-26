'use client';

import { MainLayout } from '@/components/MainLayout';
import { charityRegistry, donationManager, usdc, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { useParams } from 'next/navigation';
import { useUSDCEquivalent } from '@/hooks/usePriceConversion';

type Currency = 'ETH' | 'USDC';

// Type definition for charity data from contract
interface CharityData {
  name: string;
  description: string;
  ipfsHash: string;
  walletAddress: string;
  aiScore: bigint;
  status: number;
  registeredAt: bigint;
  verifiedAt: bigint;
  verifiedBy: string;
  totalDonationsReceived: bigint;
  donorCount: bigint;
  fundingGoal: bigint;
  deadline: bigint;
  isActive: boolean;
  totalETHDonations: bigint;
  totalUSDCDonations: bigint;
  imageHashes: string[];
}

export default function CauseDetailPage() {
  const params = useParams();
  const causeId = params.id as string;
  const { address } = useAccount();
  const [donationAmount, setDonationAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('ETH');

  // Fetch charity images
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`http://localhost:3001/api/charity-images/${causeId}`);
        const data = await response.json();
        if (data.success && data.images.length > 0) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Failed to fetch images:', error);
      }
    }
    fetchImages();
  }, [causeId]);

  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: [BigInt(causeId)],
  }) as { data: CharityData | undefined };

  // Get ETH and USDC amounts from contract (use default values if charity not loaded yet)
  const ethDonations = charity?.totalETHDonations || BigInt(0);
  const usdcDonations = charity?.totalUSDCDonations || BigInt(0);

  // Convert to USDC equivalent - MUST be called before any early returns
  const { totalUSDC, loading: priceLoading, ethPrice } = useUSDCEquivalent(ethDonations, usdcDonations);

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    ...usdc,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && currency === 'USDC' },
  });

  // Read USDC allowance
  const { data: usdcAllowance } = useReadContract({
    ...usdc,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.DonationManager] : undefined,
    query: { enabled: !!address && currency === 'USDC' },
  });

  const { writeContract: approveWrite, data: approveHash } = useWriteContract();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [needsApproval, setNeedsApproval] = useState(false);

  // Check if approval is needed for USDC
  useEffect(() => {
    if (currency === 'USDC' && donationAmount && usdcAllowance !== undefined) {
      const amountInUnits = parseUnits(donationAmount, 6);
      setNeedsApproval(usdcAllowance < amountInUnits);
    } else {
      setNeedsApproval(false);
    }
  }, [currency, donationAmount, usdcAllowance]);

  useEffect(() => {
    if (approveSuccess) {
      setNeedsApproval(false);
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setDonationAmount('');
      alert('🎉 Cointribution successful! You earned VIBE tokens!');
    }
  }, [isSuccess]);

  const handleApprove = async () => {
    if (!donationAmount || currency !== 'USDC') return;

    try {
      const amountInUnits = parseUnits(donationAmount, 6);
      approveWrite({
        ...usdc,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.DonationManager, amountInUnits],
      });
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount) {
      alert('Please enter an amount');
      return;
    }

    if (currency === 'USDC' && needsApproval) {
      alert('Please approve USDC first');
      return;
    }

    try {
      if (currency === 'ETH') {
        writeContract({
          ...donationManager,
          functionName: 'donateETH',
          args: [BigInt(causeId)],
          value: parseEther(donationAmount),
        });
      } else {
        const amountInUnits = parseUnits(donationAmount, 6);
        writeContract({
          ...donationManager,
          functionName: 'donateERC20',
          args: [BigInt(causeId), CONTRACT_ADDRESSES.USDC, amountInUnits],
        });
      }
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

  // Extract preferred token from description
  const preferredTokenMatch = charity.description.match(/\[Preferred Donation Token: (ETH|USDC)\]/);
  const preferredToken = preferredTokenMatch ? preferredTokenMatch[1] : 'ETH';

  const isVerified = charity.status === 1 && charity.isActive;

  // Funding goal is stored in wei but represents USDC target (not ETH)
  // Convert from wei to USDC display value (treating it as USDC base units)
  const fundingGoalWei = charity.fundingGoal;
  const fundingGoalUSDC = Number(fundingGoalWei) / 1e18; // Treat as USDC amount, not to be converted

  const percentRaised = (totalUSDC / fundingGoalUSDC) * 100;
  const targetAmount = fundingGoalUSDC; // Use 'target' instead of 'remaining'

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

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Main Image */}
                <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${charity.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      {priceLoading ? '...' : `$${totalUSDC.toFixed(2)}`}
                    </span>
                    <span className="text-gray-600 ml-2">raised of ${fundingGoalUSDC.toFixed(2)} goal</span>
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
                    {priceLoading ? '...' : `$${targetAmount.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-600">Target</div>
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

            {/* Smart Fund Release System */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Smart Fund Release</h2>
                  <p className="text-sm text-gray-600 mt-1">Secure escrow system with automatic release</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-sm">How it works:</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Donations are <strong>held securely</strong> in the smart contract escrow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Funds are <strong>automatically released</strong> when EITHER condition is met:</span>
                    </li>
                    <li className="flex items-start gap-2 ml-6">
                      <span className="text-green-600">✓</span>
                      <span><strong>Goal Reached:</strong> Campaign target is hit (even before deadline)</span>
                    </li>
                    <li className="flex items-start gap-2 ml-6">
                      <span className="text-green-600">✓</span>
                      <span><strong>Deadline Passed:</strong> Campaign time period ends (funds released regardless of target)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Platform fee (2.5%) deducted, charity receives 97.5%</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">⏱️</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Campaign Status:</p>
                      <p className="text-xs text-amber-800">
                        {hasDeadline && !isExpired ? (
                          <>Deadline: {new Date(Number(charity.deadline) * 1000).toLocaleDateString()} ({daysRemaining} days remaining)</>
                        ) : isExpired ? (
                          <>Campaign ended. Funds are being released.</>
                        ) : (
                          <>No deadline set</>
                        )}
                      </p>
                      {percentRaised >= 100 && (
                        <p className="text-xs text-green-700 font-semibold mt-1">
                          🎉 Goal reached! Funds released to charity wallet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Charity Wallet Address</p>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono text-gray-800 break-all">
                      {charity.walletAddress}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(charity.walletAddress);
                        alert('Wallet address copied!');
                      }}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <a
                    href={`https://sepolia.basescan.org/address/${charity.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View wallet on Basescan
                  </a>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-800">
                    <strong>🔒 Donor Protection:</strong> Funds are held in audited smart contracts. No one (including platform admins) can access them until release conditions are met.
                  </p>
                </div>
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
                  {/* Currency Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Currency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrency('ETH')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currency === 'ETH'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-bold text-gray-900">ETH</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency('USDC')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currency === 'USDC'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-bold text-gray-900">USDC</div>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
                      Amount ({currency})
                    </label>
                    <input
                      type="number"
                      id="amount"
                      step={currency === 'ETH' ? '0.001' : '1'}
                      min="0"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder={currency === 'ETH' ? '0.1' : '100'}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="mt-2 flex gap-2">
                      {currency === 'ETH'
                        ? ['0.01', '0.05', '0.1', '0.5'].map((amount) => (
                            <button
                              type="button"
                              key={amount}
                              onClick={() => setDonationAmount(amount)}
                              className="flex-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                            >
                              {amount}
                            </button>
                          ))
                        : ['10', '50', '100', '500'].map((amount) => (
                            <button
                              type="button"
                              key={amount}
                              onClick={() => setDonationAmount(amount)}
                              className="flex-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                            >
                              {amount}
                            </button>
                          ))
                      }
                    </div>
                  </div>

                  {donationAmount && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Your cointribution:</span>
                        <span className="font-semibold text-gray-900">{donationAmount} {currency}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Platform fee (2.5%):</span>
                        <span className="text-gray-600">-{(parseFloat(donationAmount) * 0.025).toFixed(currency === 'ETH' ? 4 : 2)} {currency}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-purple-300">
                        <span className="font-semibold text-gray-900">Cause receives:</span>
                        <span className="font-semibold text-green-600">
                          {(parseFloat(donationAmount) * 0.975).toFixed(currency === 'ETH' ? 4 : 2)} {currency}
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

                  {/* Approve/Donate Buttons */}
                  <div className="space-y-2">
                    {currency === 'USDC' && needsApproval && (
                      <button
                        onClick={handleApprove}
                        disabled={!donationAmount || approveHash !== undefined}
                        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approveHash ? 'Approving...' : 'Approve USDC'}
                      </button>
                    )}
                    <button
                      onClick={handleDonate}
                      disabled={!donationAmount || isPending || isConfirming || (currency === 'USDC' && needsApproval)}
                      className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : `Cointribute ${currency}`}
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-center text-gray-500">
                    {currency === 'ETH' ? 'Cointributions over 1 ETH earn an Impact NFT!' : 'Cointributions over 3000 USDC earn an Impact NFT!'}
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
