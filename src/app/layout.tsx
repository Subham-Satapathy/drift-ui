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
          <div className="min-h-screen bg-gradient-to-b from-[#0f0525] via-[#1b0949] to-[#38074f] relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="stars-bg"></div>
            </div>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
              {children}
            </main>
            <footer className="mt-16 py-6 border-t border-border relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-muted text-white">
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
