import type { Metadata, Viewport } from 'next';
// import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';

import { ThemeProvider } from '@/components/theme.tsx';

import './dashboard.css';

// const font = Paytone_One({ weight: '400', display: 'swap' });
const font = Roboto({ subsets: ['latin'], weight: '400', display: 'swap' });
// const font = Inter({ subsets: ['latin'] });

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
  title: 'Dash - Calldata.Space',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // themeColor: [
  //   { media: "(prefers-color-scheme: dark)" }
  // ]
};

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
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
