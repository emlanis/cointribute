'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="text-xl font-bold text-gray-900">Cointribute</span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Transparent charity donations powered by blockchain technology.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/charities" className="text-gray-600 hover:text-gray-900 text-sm">
                  Browse Charities
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-600 hover:text-gray-900 text-sm">
                  Make a Donation
                </Link>
              </li>
              <li>
                <Link href="/stake" className="text-gray-600 hover:text-gray-900 text-sm">
                  Stake VIBE
                </Link>
              </li>
              <li>
                <Link href="/nfts" className="text-gray-600 hover:text-gray-900 text-sm">
                  Impact NFTs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Charities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              For Charities
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/register-charity" className="text-gray-600 hover:text-gray-900 text-sm">
                  Register Your Charity
                </Link>
              </li>
              <li>
                <a href="https://sepolia.basescan.org/address/0xD14000D3eeE85E9cD44Ae686fA7718aE9aA6019F"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-600 hover:text-gray-900 text-sm">
                  View Contracts
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="https://sepolia.basescan.org"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-600 hover:text-gray-900 text-sm">
                  Base Sepolia Explorer
                </a>
              </li>
              <li>
                <a href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-600 hover:text-gray-900 text-sm">
                  Get Testnet ETH
                </a>
              </li>
              <li>
                <a href="https://docs.seedify.fund/seedify-vibecoins"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-600 hover:text-gray-900 text-sm">
                  Seedify Vibecoins
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Built with Vibe Coding for the Seedify Vibecoins Hackathon • Network: Base Sepolia Testnet
          </p>
        </div>
      </div>
    </footer>
  );
}
