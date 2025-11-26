'use client';

import { MainLayout } from '@/components/MainLayout';
import { vibeToken } from '@/lib/contracts';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';

const LOCK_PERIODS = {
  '30': { days: 30, apy: 5, seconds: 30 * 24 * 60 * 60 },
  '90': { days: 90, apy: 10, seconds: 90 * 24 * 60 * 60 },
  '180': { days: 180, apy: 15, seconds: 180 * 24 * 60 * 60 },
};

export default function StakePage() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '180'>('90');

  const { data: balance } = useReadContract({
    ...vibeToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint | undefined };

  const { data: stakingInfo } = useReadContract({
    ...vibeToken,
    functionName: 'getStakingInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: readonly [bigint, bigint, bigint] | undefined };

  const { data: userStakes } = useReadContract({
    ...vibeToken,
    functionName: 'getUserStakes',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: any[] | undefined };

  const { writeContract: approveWrite, data: approveHash } = useWriteContract();
  const { writeContract: stakeWrite, data: stakeHash, isPending: isStaking } = useWriteContract();
  const { writeContract: unstakeWrite } = useWriteContract();

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: stakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });

  const [needsApproval, setNeedsApproval] = useState(true);

  useEffect(() => {
    if (approveSuccess) {
      setNeedsApproval(false);
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (stakeSuccess) {
      setStakeAmount('');
      setNeedsApproval(true);
      alert('🎉 Staking successful!');
    }
  }, [stakeSuccess]);

  const handleApprove = () => {
    if (!stakeAmount) return;
    approveWrite({
      ...vibeToken,
      functionName: 'approve',
      args: [vibeToken.address, parseEther(stakeAmount)],
    });
  };

  const handleStake = () => {
    if (!stakeAmount || needsApproval) return;
    stakeWrite({
      ...vibeToken,
      functionName: 'stake',
      args: [parseEther(stakeAmount), BigInt(LOCK_PERIODS[selectedPeriod].seconds)],
    });
  };

  const handleUnstake = (stakeIndex: number) => {
    unstakeWrite({
      ...vibeToken,
      functionName: 'unstake',
      args: [BigInt(stakeIndex)],
    });
  };

  const balanceFormatted = balance ? formatEther(balance) : '0';
  const totalStaked = stakingInfo ? formatEther(stakingInfo[0]) : '0';
  const totalRewards = stakingInfo ? formatEther(stakingInfo[2]) : '0';

  const estimatedReward = stakeAmount
    ? (parseFloat(stakeAmount) * (LOCK_PERIODS[selectedPeriod].apy / 100) * (LOCK_PERIODS[selectedPeriod].days / 365)).toFixed(4)
    : '0';

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Stake VIBE Tokens
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Earn up to 15% APY by staking your VIBE tokens
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Your Balance</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{parseFloat(balanceFormatted).toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">VIBE</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Total Staked</div>
              <div className="mt-2 text-3xl font-bold text-purple-600">{parseFloat(totalStaked).toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">VIBE</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500">Total Rewards Earned</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{parseFloat(totalRewards).toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-1">VIBE</div>
            </div>
          </div>

          {/* Stake Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Stake</h2>

              {/* Lock Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Lock Period
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(LOCK_PERIODS).map(([key, period]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPeriod(key as '30' | '90' | '180')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPeriod === key
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-900">{period.days}</div>
                      <div className="text-xs text-gray-500">days</div>
                      <div className="mt-2 text-sm font-semibold text-purple-600">{period.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-900 mb-2">
                  Amount to Stake
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="stake-amount"
                    step="1"
                    min="100"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="100 (minimum)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 border text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      onClick={() => setStakeAmount(balanceFormatted)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Available: {parseFloat(balanceFormatted).toFixed(2)} VIBE | Minimum: 100 VIBE
                </p>
              </div>

              {/* Estimate */}
              {stakeAmount && parseFloat(stakeAmount) >= 100 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-900 font-semibold mb-2">Estimated Returns</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Staking Amount:</span>
                      <span className="font-semibold text-gray-900">{stakeAmount} VIBE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Lock Period:</span>
                      <span className="font-semibold text-gray-900">{LOCK_PERIODS[selectedPeriod].days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">APY:</span>
                      <span className="font-semibold text-purple-600">{LOCK_PERIODS[selectedPeriod].apy}%</span>
                    </div>
                    <div className="pt-2 border-t border-purple-200 flex justify-between">
                      <span className="font-semibold text-gray-900">Est. Rewards:</span>
                      <span className="font-bold text-green-600">+{estimatedReward} VIBE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {needsApproval ? (
                  <button
                    onClick={handleApprove}
                    disabled={!stakeAmount || parseFloat(stakeAmount) < 100}
                    className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve VIBE
                  </button>
                ) : (
                  <button
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) < 100}
                    className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStaking ? 'Staking...' : 'Stake Now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Stakes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Active Stakes</h3>
              {userStakes && userStakes.length > 0 ? (
                <div className="space-y-3">
                  {userStakes.map((stake: any, index: number) => (
                    <StakeCard
                      key={index}
                      stake={stake}
                      index={index}
                      onUnstake={handleUnstake}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No active stakes yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StakeCard({ stake, index, onUnstake }: { stake: any; index: number; onUnstake: (index: number) => void }) {
  const amount = formatEther(stake.amount);
  const unlockTime = Number(stake.timestamp) + Number(stake.lockPeriod);
  const now = Math.floor(Date.now() / 1000);
  const isUnlocked = now >= unlockTime;
  const daysLeft = Math.ceil((unlockTime - now) / (24 * 60 * 60));

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="text-lg font-bold text-gray-900">{parseFloat(amount).toFixed(2)} VIBE</div>
        {isUnlocked && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Unlocked</span>
        )}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div>APY: {(Number(stake.rewardRate) / 100)}%</div>
        <div>{isUnlocked ? 'Ready to unstake' : `${daysLeft} days left`}</div>
      </div>
      {isUnlocked && (
        <button
          onClick={() => onUnstake(index)}
          className="mt-3 w-full text-xs bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700"
        >
          Unstake
        </button>
      )}
    </div>
  );
}
