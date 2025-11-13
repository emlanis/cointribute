'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="text-xl font-bold text-gray-900">Cointribute</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/charities"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Causes
            </Link>
            <Link
              href="/donate"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cointribute
            </Link>
            <Link
              href="/stake"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Stake VIBE
            </Link>
            <Link
              href="/nfts"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              My NFTs
            </Link>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
