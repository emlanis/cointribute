'use client';

import { MainLayout } from '@/components/MainLayout';
import { impactNFT, charityRegistry } from '@/lib/contracts';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';

// Type definitions
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

interface ImpactMetadata {
  donor: string;
  charityId: bigint;
  totalImpact: bigint;
  tier: number;
  mintedAt: bigint;
  lastUpdated: bigint;
  ipfsMetadataHash: string;
}

export default function NFTsPage() {
  const { address } = useAccount();

  const { data: nftIds } = useReadContract({
    ...impactNFT,
    functionName: 'getDonorNFTs',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint[] | undefined };

  const { data: totalImpact } = useReadContract({
    ...impactNFT,
    functionName: 'getDonorTotalImpact',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint | undefined };

  const nftCount = nftIds ? nftIds.length : 0;
  const totalImpactFormatted = totalImpact ? formatEther(totalImpact) : '0';

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              My Impact NFTs
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your collection of cointribution recognition NFTs
            </p>
            <div className="mt-6 flex justify-center gap-8">
              <div>
                <div className="text-3xl font-bold text-purple-600">{nftCount}</div>
                <div className="text-sm text-gray-500">NFTs Owned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{parseFloat(totalImpactFormatted).toFixed(4)}</div>
                <div className="text-sm text-gray-500">Total Impact (ETH)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!address ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Connect your wallet to view your NFTs</p>
          </div>
        ) : nftCount === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nftIds?.map((tokenId: bigint) => (
              <NFTCard key={tokenId.toString()} tokenId={tokenId} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No NFTs yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Make a cointribution of 1 ETH or more to receive your first Impact NFT!
      </p>
      <div className="mt-6">
        <a
          href="/donate"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Make a Cointribution
        </a>
      </div>
    </div>
  );
}

function NFTCard({ tokenId }: { tokenId: bigint }) {
  const { data: metadata } = useReadContract({
    ...impactNFT,
    functionName: 'getMetadata',
    args: [tokenId],
  }) as { data: ImpactMetadata | undefined };

  const { data: charity } = useReadContract({
    ...charityRegistry,
    functionName: 'getCharity',
    args: metadata ? [metadata.charityId] : undefined,
    query: { enabled: !!metadata },
  }) as { data: CharityData | undefined };

  if (!metadata) {
    return (
      <div className="animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
        <div className="bg-white p-4 rounded-b-lg border border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const tier = ['Bronze', 'Silver', 'Gold', 'Platinum'][metadata.tier];
  const tierColors = {
    Bronze: 'from-amber-700 to-amber-500',
    Silver: 'from-gray-400 to-gray-200',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-blue-400',
  };

  const impact = formatEther(metadata.totalImpact);
  const mintDate = new Date(Number(metadata.mintedAt) * 1000).toLocaleDateString();

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      {/* NFT Image/Visual */}
      <div className={`aspect-square bg-gradient-to-br ${tierColors[tier as keyof typeof tierColors]} p-8 flex flex-col items-center justify-center text-white`}>
        <div className="text-center">
          <div className="text-6xl font-bold mb-4">🏆</div>
          <div className="text-2xl font-bold mb-2">{tier}</div>
          <div className="text-sm opacity-90">Impact NFT</div>
          <div className="mt-4 text-lg font-semibold">#{tokenId.toString()}</div>
        </div>
      </div>

      {/* NFT Details */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Cointributed To</div>
          <div className="text-sm font-semibold text-gray-900">
            {charity ? charity.name : `Cause #${metadata.charityId.toString()}`}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Impact:</span>
            <span className="font-semibold">{parseFloat(impact).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tier:</span>
            <span className={`font-semibold bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors]} bg-clip-text text-transparent`}>
              {tier}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Minted:</span>
            <span className="font-semibold">{mintDate}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <a
            href={`https://sepolia.basescan.org/token/${impactNFT.address}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
          >
            View on Basescan
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
