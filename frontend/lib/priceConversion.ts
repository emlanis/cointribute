/**
 * Price conversion utilities for displaying all donations in USDC equivalent
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface PriceData {
  ETH: number;
  USDC: number;
}

let priceCache: { prices: PriceData | null; timestamp: number } = {
  prices: null,
  timestamp: 0,
};

const CACHE_DURATION = 60000; // 1 minute

/**
 * Fetch current ETH and USDC prices from backend
 */
export async function fetchPrices(): Promise<PriceData> {
  // Check cache
  if (priceCache.prices && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.prices;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/prices?symbols=ETH,USDC`);
    if (!response.ok) throw new Error('Failed to fetch prices');

    const prices = await response.json();

    const priceData: PriceData = {
      ETH: prices.ETH || 2500, // Fallback to ~$2500 if API fails
      USDC: prices.USDC || 1,
    };

    // Update cache
    priceCache = { prices: priceData, timestamp: Date.now() };

    return priceData;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Return fallback prices
    return {
      ETH: 2500,
      USDC: 1,
    };
  }
}

/**
 * Convert ETH amount (in wei) to USDC equivalent
 * @param ethWei ETH amount in wei
 * @param ethPrice Current ETH price in USD
 * @returns USDC equivalent
 */
export function ethToUSDC(ethWei: bigint, ethPrice: number): number {
  // Convert wei to ETH
  const ethAmount = Number(ethWei) / 1e18;

  // Convert to USD
  const usdValue = ethAmount * ethPrice;

  // Return as USDC (1:1 with USD)
  return usdValue;
}

/**
 * Convert USDC amount (in base units, 6 decimals) to display value
 * @param usdcBaseUnits USDC amount in base units
 * @returns USDC display value
 */
export function usdcToDisplay(usdcBaseUnits: bigint): number {
  return Number(usdcBaseUnits) / 1e6;
}

/**
 * Get total donation amount in USDC equivalent
 * @param ethWei Total ETH donations in wei
 * @param usdcBaseUnits Total USDC donations in base units
 * @param ethPrice Current ETH price in USD
 * @returns Total in USDC equivalent
 */
export function getTotalInUSDC(
  ethWei: bigint,
  usdcBaseUnits: bigint,
  ethPrice: number
): number {
  const ethInUSDC = ethToUSDC(ethWei, ethPrice);
  const usdcAmount = usdcToDisplay(usdcBaseUnits);

  return ethInUSDC + usdcAmount;
}
