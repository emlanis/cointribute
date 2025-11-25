'use client';

import { MainLayout } from '@/components/MainLayout';
import { charityRegistry } from '@/lib/contracts';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useUSDCEquivalent } from '@/hooks/usePriceConversion';
import { useState, useEffect } from 'react';

export default function CharitiesPage() {
  // Read total charities count
  const { data: charityCount } = useReadContract({
    ...charityRegistry,
    functionName: 'getTotalCharities',
  });

  const totalCharities = charityCount ? Number(charityCount) : 0;

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Verified Causes
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse AI-verified causes and make a transparent cointribution
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Total Verified: <span className="font-semibold text-blue-600">{totalCharities}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {totalCharities === 0 ? (
          <EmptyState />
        ) : (
          <CharitiesList count={totalCharities} />
        )}
      </div>
    </MainLayout>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No charities yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Be the first charity to register on the platform!
      </p>
      <div className="mt-6">
        <a
          href="/register-charity"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Register Your Charity
        </a>
      </div>
    </div>
  );
}

function CharitiesList({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CharityCard key={i} charityId={i} />
      ))}
    </div>
  );
}

function CharityCard({ charityId }: { charityId: number }) {
  const { data: charity, isLoading } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: [BigInt(charityId)],
  });

  // Fetch charity images
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`http://localhost:3001/api/charity-images/${charityId}`);
        const data = await response.json();
        if (data.success && data.images.length > 0) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Failed to fetch images:', error);
      } finally {
        setLoadingImages(false);
      }
    }
    fetchImages();
  }, [charityId]);

  // Get ETH and USDC amounts from contract (use defaults if not loaded)
  const ethDonations = charity?.totalETHDonations || BigInt(0);
  const usdcDonations = charity?.totalUSDCDonations || BigInt(0);

  // Convert to USDC equivalent - MUST be called before early returns
  const { totalUSDC, loading: priceLoading, ethPrice } = useUSDCEquivalent(ethDonations, usdcDonations);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!charity) return null;

  // Extract preferred token from description
  const preferredTokenMatch = charity.description.match(/\[Preferred Donation Token: (ETH|USDC)\]/);
  const preferredToken = preferredTokenMatch ? preferredTokenMatch[1] : 'ETH';

  const status = ['Pending', 'Approved', 'Rejected', 'Suspended'][charity.status];
  const isVerified = charity.status === 1 && charity.isActive;

  // Funding goal is stored in wei but represents USDC target (not ETH)
  const fundingGoalWei = charity.fundingGoal;
  const fundingGoalUSDC = Number(fundingGoalWei) / 1e18; // Stable USDC target
  const percentRaised = (totalUSDC / fundingGoalUSDC) * 100;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      {/* Charity Image */}
      {images.length > 0 ? (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
          <img
            src={images[0]}
            alt={charity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🤝</div>';
            }}
          />
          {isVerified && (
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 shadow-sm">
              ✓ Verified
            </span>
          )}
        </div>
      ) : (
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <span className="text-6xl">🤝</span>
          {isVerified && (
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 shadow-sm">
              ✓ Verified
            </span>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{charity.name}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 mb-4">{charity.description}</p>

      {/* Progress Bar */}
      {isVerified && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-gray-900">
              {priceLoading ? '...' : `$${totalUSDC.toFixed(2)}`}
            </span>
            <span className="text-gray-600">of ${fundingGoalUSDC.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentRaised, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {percentRaised.toFixed(1)}% raised
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">AI Score:</span>
          <span className="font-semibold text-gray-900">{charity.aiScore.toString()}/100</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`font-semibold ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
            {status}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Cointributions:</span>
          <span className="font-semibold text-gray-900">
            {priceLoading ? '...' : `$${totalUSDC.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cointributors:</span>
          <span className="font-semibold text-gray-900">{charity.donorCount.toString()}</span>
        </div>
      </div>

        {isVerified && (
          <div className="mt-6 space-y-2">
            <a
              href={`/causes/${charityId}`}
              className="block w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              View Campaign
            </a>
          </div>
        )}

        {!isVerified && (
          <div className="mt-6">
            <div className="block w-full rounded-md bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-500">
              Pending Verification
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
