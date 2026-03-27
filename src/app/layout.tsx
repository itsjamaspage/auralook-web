import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Auralook.uz | Future of Fashion',
  description: 'AI-powered clothing store with futuristic techwear looks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Toaster />
          <footer className="py-12 border-t border-white/5 text-center text-sm text-muted-foreground">
            <div className="container mx-auto">
              <p>© 2024 Auralook.uz AI. All rights reserved.</p>
              <div className="flex justify-center gap-6 mt-4">
                <span className="hover:text-primary cursor-pointer transition-colors">Telegram</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Instagram</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
              </div>
            </div>
          </footer>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
