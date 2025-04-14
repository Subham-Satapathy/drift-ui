import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletProviders } from '@/providers/WalletProvider';
import { Header } from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>
          <div className="min-h-screen bg-gradient-to-b from-[#0f0525] via-[#1b0949] to-[#38074f] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 overflow-hidden">
              <div className="stars-bg"></div>
            </div>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10 flex-1 w-full">
              {children}
            </main>
            <footer className="py-6 relative z-10 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-white/70">
                  Made by subhs with ❤️ © {new Date().getFullYear()}
                </p>
              </div>
            </footer>
          </div>
        </WalletProviders>
      </body>
    </html>
  );
}
