import type { Metadata } from 'next';
// import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import Providers from '@/lib/providers.tsx';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// const geistSans = localFont({
//   src: './fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// });
// const geistMono = localFont({
//   src: './fonts/GeistMonoVF.woff',
//   variable: '--font-geist-mono',
//   weight: '100 900',
// });

export const metadata: Metadata = {
  title: 'Wallet',
  description: 'Ethscriptions and Facet wallet, based on Privy.io',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <Providers>
          <body className={`${inter.className} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </body>
        </Providers>
      </html>
    </>
  );
}
