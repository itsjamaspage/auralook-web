
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Footer } from '@/components/footer';
import { LanguageProvider } from '@/hooks/use-language';
import { TelegramUserProvider } from '@/hooks/use-telegram-user';
import { BottomNav } from '@/components/bottom-nav';
import { SmoothScrollProvider } from '@/components/smooth-scroll';
import { DesktopEffects } from '@/components/desktop-effects';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Auralook | Techwear',
  description: 'Futuristic techwear looks for the new generation.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22black%22/><text y=%2262%22 x=%2250%22 font-size=%2222%22 font-weight=%22900%22 fill=%22%23ff0000%22 font-family=%22Arial, sans-serif%22 text-anchor=%22middle%22>AURALOOK</text></svg>',
    shortcut: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22black%22/><text y=%2262%22 x=%2250%22 font-size=%2222%22 font-weight=%22900%22 fill=%22%23ff0000%22 font-family=%22Arial, sans-serif%22 text-anchor=%22middle%22>AURALOOK</text></svg>',
    apple: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22black%22/><text y=%2262%22 x=%2250%22 font-size=%2222%22 font-weight=%22900%22 fill=%22%23ff0000%22 font-family=%22Arial, sans-serif%22 text-anchor=%22middle%22>AURALOOK</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col relative fine-cursor"
        suppressHydrationWarning
      >
        <DesktopEffects />

        <Script
          src="https://telegram.org/js/telegram-web-app.js?v=1"
          strategy="beforeInteractive"
        />
        <FirebaseClientProvider>
          <LanguageProvider>
            <TelegramUserProvider>
              <SmoothScrollProvider>
                <Navbar />
                <main className="flex-grow pt-20 sm:pt-28 pb-28 lg:pb-0">
                  {children}
                  <Footer className="lg:hidden" />
                </main>
                <BottomNav />
                <Toaster />
                <Footer className="hidden lg:block" />
              </SmoothScrollProvider>
            </TelegramUserProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
