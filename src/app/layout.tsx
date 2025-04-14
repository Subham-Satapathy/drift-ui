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
          <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              {children}
            </main>
            <footer className="mt-16 py-6 border-t border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-muted">
                  Drift Protocol UI © {new Date().getFullYear()}
                </p>
              </div>
            </footer>
          </div>
        </WalletProviders>
      </body>
    </html>
  );
}
