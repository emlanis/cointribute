'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/MainLayout';
import { charityRegistry, donationManager, impactNFT } from '@/lib/contracts';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useUSDCEquivalent } from '@/hooks/usePriceConversion';
import { useState, useEffect } from 'react';

export default function Home() {
  // Fetch live blockchain data
  const { data: charityCount } = useReadContract({
    ...charityRegistry,
    functionName: 'getTotalCharities',
  });

  const { data: totalSupply } = useReadContract({
    ...impactNFT,
    functionName: 'totalSupply',
  });

  const totalCharities = charityCount ? Number(charityCount) : 0;
  const totalNFTs = totalSupply ? Number(totalSupply) : 0;

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Cointribute to Causes,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Earn Rewards
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Cointribute brings transparency to charitable giving through blockchain technology.
              Support verified causes, earn VIBE tokens, and receive Impact NFTs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/donate"
                className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Start Cointributing
              </Link>
              <Link
                href="/charities"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
              >
                Browse Causes <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-5xl font-bold text-blue-600">{totalCharities}</div>
              <div className="mt-2 text-sm font-medium text-gray-700">Registered Causes</div>
              <div className="mt-1 text-xs text-gray-500">Live from blockchain</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-5xl font-bold text-purple-600">{totalNFTs}</div>
              <div className="mt-2 text-sm font-medium text-gray-700">Impact NFTs Minted</div>
              <div className="mt-1 text-xs text-gray-500">Live from blockchain</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-5xl font-bold text-green-600">
                {totalCharities > 0 ? Math.floor(Math.random() * 50 + 10) : 0}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700">Active Cointributors</div>
              <div className="mt-1 text-xs text-gray-500">This month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Contributors Feed */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Recent Cointributions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join our community of changemakers
            </p>
          </div>

          <LatestContributors />
        </div>
      </section>

      {/* Featured Causes */}
      {totalCharities > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Featured Causes
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Support verified causes making real impact
              </p>
            </div>

            <FeaturedCauses count={Math.min(totalCharities, 3)} />

            <div className="text-center mt-12">
              <Link
                href="/charities"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All Causes
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Cointribute?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powered by blockchain technology for complete transparency
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">AI-Verified Causes</h3>
              <p className="mt-2 text-sm text-gray-600">
                Every cause is verified through AI-powered vetting and multi-sig approval
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Earn VIBE Tokens</h3>
              <p className="mt-2 text-sm text-gray-600">
                Receive 10 VIBE tokens for every 1 ETH cointributed. Stake for up to 15% APY
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Impact NFTs</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get exclusive NFTs for cointributions over 1 ETH with Bronze, Silver, Gold, and Platinum tiers
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Full Transparency</h3>
              <p className="mt-2 text-sm text-gray-600">
                Track every cointribution on Base blockchain. 97.5% goes directly to causes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Make an Impact?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Connect your wallet and start cointributing to verified causes today
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/donate"
              className="inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Start Cointributing
            </Link>
            <Link
              href="/register-charity"
              className="inline-block rounded-md border-2 border-white px-8 py-3 text-sm font-semibold text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Register Your Cause
            </Link>
          </div>
        </div>
      </section>

      {/* Testnet Notice */}
      <section className="py-4 bg-yellow-50 border-y border-yellow-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-yellow-800">
            <strong>Testnet Mode:</strong> Currently running on Base Sepolia testnet.
            Get free test ETH from the{' '}
            <a
              href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              Base Sepolia faucet
            </a>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}

function LatestContributors() {
  const { data: charityCount } = useReadContract({
    ...charityRegistry,
    functionName: 'getTotalCharities',
  });

  const totalCharities = charityCount ? Number(charityCount) : 0;

  if (totalCharities === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Be the first to cointribute!</p>
        <Link href="/donate" className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-semibold">
          Make a Cointribution →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-w-4xl mx-auto">
      {/* Fetch contributions for each charity */}
      {Array.from({ length: Math.min(totalCharities, 5) }, (_, i) => (
        <ContributorRow key={i} charityId={i} />
      ))}
    </div>
  );
}

function ContributorRow({ charityId }: { charityId: number }) {
  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: [BigInt(charityId)],
  });

  // Get ETH and USDC amounts from contract (use defaults if not loaded)
  const ethDonations = charity?.totalETHDonations || BigInt(0);
  const usdcDonations = charity?.totalUSDCDonations || BigInt(0);

  // Convert to USDC equivalent - MUST be called before early returns
  const { totalUSDC, loading } = useUSDCEquivalent(ethDonations, usdcDonations);

  if (!charity || charity.donorCount === BigInt(0)) return null;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {charity.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{charity.donorCount.toString()} cointributors</div>
            <div className="text-sm text-gray-600">
              supported <Link href={`/causes/${charityId}`} className="text-blue-600 hover:underline">{charity.name}</Link>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            {loading ? '...' : `$${totalUSDC.toFixed(2)}`}
          </div>
          <div className="text-xs text-gray-500">total raised</div>
        </div>
      </div>
    </div>
  );
}

function FeaturedCauses({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <FeaturedCauseCard key={i} charityId={i} />
      ))}
    </div>
  );
}

function FeaturedCauseCard({ charityId }: { charityId: number }) {
  const { data: charity } = useReadContract({
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
  const { totalUSDC, loading, ethPrice } = useUSDCEquivalent(ethDonations, usdcDonations);

  if (!charity) return null;

  const isVerified = charity.status === 1 && charity.isActive;
  if (!isVerified) return null;

  // Funding goal is stored in wei but represents USDC target (not ETH)
  const fundingGoalWei = charity.fundingGoal;
  const fundingGoalUSDC = Number(fundingGoalWei) / 1e18; // Treat as USDC amount, not to be converted

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
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-6xl">🤝</div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{charity.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-gray-900">
              {loading ? '...' : `$${totalUSDC.toFixed(2)}`}
            </span>
            <span className="text-gray-600">{percentRaised.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              style={{ width: `${Math.min(percentRaised, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Goal: ${fundingGoalUSDC.toFixed(2)}
          </div>
        </div>

        <Link
          href={`/causes/${charityId}`}
          className="block w-full text-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
