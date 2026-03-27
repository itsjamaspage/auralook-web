import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Footer } from '@/components/footer';
import { LanguageProvider } from '@/hooks/use-language';

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
          <LanguageProvider>
            <Navbar />
            <main className="flex-grow pt-24">
              {children}
            </main>
            <Toaster />
            <Footer />
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
