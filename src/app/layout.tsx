
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Footer } from '@/components/footer';
import { LanguageProvider } from '@/hooks/use-language';
import { TelegramUserProvider } from '@/hooks/use-telegram-user';
import Script from 'next/script';

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <LanguageProvider>
            <TelegramUserProvider>
              <Navbar />
              <main className="flex-grow pt-24 pb-24 lg:pb-0">
                {children}
              </main>
              <BottomNav />
              <Toaster />
              <Footer className="hidden lg:block" />
              <Script id="tg-init" strategy="afterInteractive">
                {`
                  if (window.Telegram && window.Telegram.WebApp) {
                    const tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand();
                  }
                `}
              </Script>
            </TelegramUserProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
