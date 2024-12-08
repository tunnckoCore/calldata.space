'use client';

import { useEffect, useState } from 'react';

import DynamicMethods from '@/components/DynamicXyz/Methods';
import { DynamicWidget } from '@/lib/dynamic';

import './page.css';

const checkIsDarkSchemePreferred = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia?.('(prefers-color-scheme:dark)')?.matches ?? false;
  }
  return false;
};

export default function Main() {
  const [isDarkMode, setIsDarkMode] = useState(checkIsDarkSchemePreferred);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDarkMode(checkIsDarkSchemePreferred());

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <img
          className="logo"
          src={isDarkMode ? '/logo-light.png' : '/logo-dark.png'}
          alt="dynamic"
        />
        <div className="header-buttons">
          <button
            className="docs-button"
            onClick={() => window.open('https://docs.dynamic.xyz', '_blank', 'noopener,noreferrer')}
          >
            Docs
          </button>
          <button
            className="get-started"
            onClick={() => window.open('https://app.dynamic.xyz', '_blank', 'noopener,noreferrer')}
          >
            Get started
          </button>
        </div>
      </div>
      <div className="modal">
        <DynamicWidget />
        <DynamicMethods isDarkMode={isDarkMode} />
      </div>
      <div className="footer">
        <div className="footer-text">Made with ❤️ by dynamic</div>
        <img
          className="footer-image"
          src={isDarkMode ? '/image-dark.png' : '/image-light.png'}
          alt="dynamic"
        />
      </div>
    </div>
  );
}
