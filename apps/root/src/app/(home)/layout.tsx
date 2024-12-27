// this Layout overrides the `src/app/layout.tsx`

import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@repo/design-system/providers/theme';

import '@repo/design-system/styles/globals.css';
import './home.css';

const font = Roboto({ subsets: ['latin'], weight: '400', display: 'swap' });

export const metadata: Metadata = {
  title: 'Calldata.Space',
  description: 'The Open Source platform to learn, explore, create, and trade EVM calldata.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Calldata.Space',
    description: 'The Open Source platform to learn, explore, create, and trade EVM calldata.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Calldata.Space',
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${font.className} relative z-10 overflow-auto overflow-x-hidden font-sans text-base antialiased`}
        >
          <div className="starsog animate-pinger"></div>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
