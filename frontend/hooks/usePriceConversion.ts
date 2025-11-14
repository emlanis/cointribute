import { useState, useEffect } from 'react';
import { fetchPrices, getTotalInUSDC, ethToUSDC, usdcToDisplay } from '@/lib/priceConversion';

export function usePrices() {
  const [ethPrice, setEthPrice] = useState<number>(2500); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      try {
        const prices = await fetchPrices();
        setEthPrice(prices.ETH);
      } catch (error) {
        console.error('Failed to load prices:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPrices();

    // Refresh prices every minute
    const interval = setInterval(loadPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  return { ethPrice, loading };
}

export function useUSDCEquivalent(ethWei: bigint, usdcBaseUnits: bigint) {
  const { ethPrice, loading } = usePrices();

  const totalUSDC = getTotalInUSDC(ethWei, usdcBaseUnits, ethPrice);

  return {
    totalUSDC,
    ethInUSDC: ethToUSDC(ethWei, ethPrice),
    usdcAmount: usdcToDisplay(usdcBaseUnits),
    ethPrice,
    loading,
  };
}
