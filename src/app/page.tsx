'use client';
import { useState } from 'react';

export default function Home() {
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center relative">
      {/* Hero section */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
          <span className="text-white">Your All-in-One</span>
          <span className="bg-gradient-to-r from-[#ff7e5f] via-[#feb47b] to-[#9195f6] bg-clip-text text-transparent"> Drift Dashboard</span>
          <br />
          <span className="text-white">for Smart Trading</span>
        </h1>


        <p className="text-xl md:text-2xl text-white/80 mb-12">
          Trade, earn and build generational wealth
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-black font-medium px-8 py-3 rounded-lg transition-all">
            <a href="https://app.drift.trade/SOL-PERP" target="_blank" rel="noopener noreferrer">
              Trade Now
            </a>
          </button>
          <button 
            onClick={() => setShowWalletPopup(true)}
            className="bg-[#3A3D4A]/40 hover:bg-[#3A3D4A] text-white font-medium px-8 py-3 rounded-lg border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
          >
            Manage Accounts
          </button>
        </div>
      </div>

      {/* Wallet Connection Popup */}
      {showWalletPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={(e) => {
               if (e.target === e.currentTarget) setShowWalletPopup(false);
             }}
        >
          <div className="bg-[#1A1B23] border border-white/10 rounded-xl p-6 max-w-md w-full animate-fadeIn shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
              <button 
                onClick={() => setShowWalletPopup(false)} 
                className="text-white/60 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-[#2A2D3A]/50 p-4 rounded-lg mb-6 max-w-sm">
                <p className="text-white/80 text-center">Please connect your wallet using the wallet button in the top right corner of the page to manage your accounts.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative element (spaceship) */}
      <div className="absolute bottom-0 right-[10%] transform translate-y-1/2 opacity-70 w-32 h-32">
        <div className="animate-float">
          <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 4L58 40H6L32 4Z" fill="url(#paint0_linear)" />
            <path d="M32 60C25.373 60 20 54.627 20 48H44C44 54.627 38.627 60 32 60Z" fill="url(#paint1_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="32" y1="4" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9195f6" />
                <stop offset="1" stopColor="#ff7e5f" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="32" y1="48" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff7e5f" />
                <stop offset="1" stopColor="#feb47b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
