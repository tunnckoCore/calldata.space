// import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { CustomCard } from '@/components/custom-card.tsx';
import { ThemeToggler } from '@/components/theme.tsx';
import { features } from './features.ts';

export default function Home() {
  return (
    <div className="relative isolate flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto flex flex-col items-center">
          <div className="flex w-11/12 flex-col gap-y-3">
            <div className="flex items-center justify-between align-middle">
              <h1
                id="brand"
                className="inline-flex animate-rainbow bg-gradient-to-br from-purple-400 to-orange-500 box-decoration-clone bg-size-2x bg-clip-text text-3xl font-extrabold tracking-wide text-transparent sm:tracking-wider md:text-5xl"
              >
                <Link href="/">calldata.space</Link>
              </h1>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href="https://github.com/tunnckocore/calldata.space"
                  target="_blank"
                  className="hidden sm:inline-flex"
                >
                  {/* Github  */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <ThemeToggler />
              </div>
            </div>
            <h2 className="text-lg text-gray-300">
              The Open Source platform to learn, explore, create, and trade EVM calldata.
            </h2>
            <div className="group flex max-w-full">
              <label htmlFor="searchquery" className="sr-only">
                Search Ethscriptions Ecosystem
              </label>
              <input
                id="searchquery"
                name="searchquery"
                type="text"
                autoComplete="text"
                autoFocus
                required
                className="peer min-w-0 flex-auto rounded-md rounded-r-none border border-r-0 border-[#673d94] bg-purple-400/10 px-3.5 py-2 text-sm text-gray-200 transition hover:border-purple-500 focus:border-purple-500 focus:outline-none group-hover:border-purple-500"
                placeholder="Search by Address / Ethscription / Profile / Text / ENS"
              />

              <button
                type="submit"
                className="flex-none rounded-md rounded-l-none border border-[#673d94] bg-purple-400/20 px-3.5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-purple-500 focus:outline-none peer-hover:border-purple-500 peer-focus:border-purple-500"
              >
                Search
              </button>
            </div>
          </div>
          <div className="my-5 flex w-full items-center justify-center">
            <dl className="grid w-11/12 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((x, idx) => (
                <CustomCard key={idx} {...x} />
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
