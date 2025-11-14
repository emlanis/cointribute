// Load environment variables first
import '../env';

import axios from 'axios';

interface CryptoPrice {
  symbol: string;
  price_usd: number;
  last_updated: string;
}

interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
  };
}

export class CoinMarketCapService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  private priceCache: PriceCache = {};
  private readonly cacheExpiry = 60000; // 1 minute cache

  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  CoinMarketCap API key not set. Price conversions will not work.');
    } else {
      console.log('✅ CoinMarketCap API key loaded successfully');
    }
  }

  /**
   * Get current USD price for a cryptocurrency
   * @param symbol Token symbol (e.g., 'ETH', 'USDC')
   * @returns USD price or null if unavailable
   */
  async getPrice(symbol: string): Promise<number | null> {
    try {
      // Check cache first
      const cached = this.priceCache[symbol];
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.price;
      }

      // For USDC, return 1:1 with USD (stablecoin)
      if (symbol === 'USDC' || symbol === 'USDT' || symbol === 'DAI') {
        const price = 1.0;
        this.priceCache[symbol] = { price, timestamp: Date.now() };
        return price;
      }

      // Fetch from CoinMarketCap API
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json',
        },
        params: {
          symbol: symbol,
          convert: 'USD',
        },
      });

      if (response.data && response.data.data && response.data.data[symbol]) {
        const price = response.data.data[symbol].quote.USD.price;

        // Cache the result
        this.priceCache[symbol] = { price, timestamp: Date.now() };

        return price;
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching ${symbol} price from CoinMarketCap:`, error.response?.data || error.message);
      } else {
        console.error(`Error fetching ${symbol} price:`, error);
      }
      return null;
    }
  }

  /**
   * Get multiple crypto prices at once
   * @param symbols Array of token symbols
   * @returns Map of symbol to USD price
   */
  async getPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    // Check cache first and separate cached vs uncached
    const uncachedSymbols: string[] = [];
    for (const symbol of symbols) {
      const cached = this.priceCache[symbol];
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        prices.set(symbol, cached.price);
      } else if (symbol === 'USDC' || symbol === 'USDT' || symbol === 'DAI') {
        prices.set(symbol, 1.0);
        this.priceCache[symbol] = { price: 1.0, timestamp: Date.now() };
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    // Fetch uncached symbols
    if (uncachedSymbols.length > 0) {
      try {
        const response = await axios.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.apiKey,
            'Accept': 'application/json',
          },
          params: {
            symbol: uncachedSymbols.join(','),
            convert: 'USD',
          },
        });

        if (response.data && response.data.data) {
          for (const symbol of uncachedSymbols) {
            if (response.data.data[symbol]) {
              const price = response.data.data[symbol].quote.USD.price;
              prices.set(symbol, price);
              this.priceCache[symbol] = { price, timestamp: Date.now() };
            }
          }
        }
      } catch (error) {
        console.error('Error fetching multiple prices from CoinMarketCap:', error);
      }
    }

    return prices;
  }

  /**
   * Convert crypto amount to USD
   * @param amount Amount in crypto (in base units, e.g., wei for ETH)
   * @param symbol Token symbol
   * @param decimals Token decimals (18 for ETH, 6 for USDC)
   * @returns USD value or null
   */
  async convertToUSD(amount: bigint | string, symbol: string, decimals: number = 18): Promise<number | null> {
    try {
      const price = await this.getPrice(symbol);
      if (price === null) return null;

      // Convert from base units to token units
      const amountNum = typeof amount === 'bigint' ? Number(amount) : Number(amount);
      const tokenAmount = amountNum / Math.pow(10, decimals);

      return tokenAmount * price;
    } catch (error) {
      console.error(`Error converting ${symbol} to USD:`, error);
      return null;
    }
  }

  /**
   * Get ETH and USDC totals in USD
   * @param ethAmount Amount in wei
   * @param usdcAmount Amount in USDC base units (6 decimals)
   * @returns Object with individual and combined USD values
   */
  async getTotalUSD(ethAmount: bigint | string, usdcAmount: bigint | string): Promise<{
    ethUSD: number;
    usdcUSD: number;
    totalUSD: number;
  } | null> {
    try {
      const prices = await this.getPrices(['ETH', 'USDC']);
      const ethPrice = prices.get('ETH');
      const usdcPrice = prices.get('USDC') || 1.0;

      if (!ethPrice) {
        console.error('Could not fetch ETH price');
        return null;
      }

      // Convert amounts
      const ethNum = typeof ethAmount === 'bigint' ? Number(ethAmount) : Number(ethAmount);
      const usdcNum = typeof usdcAmount === 'bigint' ? Number(usdcAmount) : Number(usdcAmount);

      const ethTokenAmount = ethNum / 1e18; // ETH has 18 decimals
      const usdcTokenAmount = usdcNum / 1e6; // USDC has 6 decimals

      const ethUSD = ethTokenAmount * ethPrice;
      const usdcUSD = usdcTokenAmount * usdcPrice;

      return {
        ethUSD,
        usdcUSD,
        totalUSD: ethUSD + usdcUSD,
      };
    } catch (error) {
      console.error('Error calculating total USD:', error);
      return null;
    }
  }
}

// Singleton instance
export const coinMarketCapService = new CoinMarketCapService();
