/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    backgroundSize: {
      'size-2x': '200%',
    },
    extend: {
      animation: {
        rotate: 'rotate 10s linear infinite',
        rainbow: 'rainbow 3s ease-in infinite',
        'ping-2xs': 'ping 800s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        'rotate-cubic-10s': 'rotate 2500s linear infinite;',
        'rotate-linear-slow': 'rotate 50s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        pinger: 'pinger 2000s linear infinite;',
        movingbg: 'movingbg 650s linear infinite',
        space1: 'space 180s ease-in-out infinite;',
        space3: 'space 240s ease-in-out infinite;',
      },
      keyframes: {
        pinger: {
          '40%': {
            opacity: '0.55',
          },
          '50%': {
            opacity: '0.25',
          },
          '70%': {
            opacity: '0.75',
          },
          '75%, 100%': {
            transform: 'scale(3)',
            opacity: '0.15',
          },
        },
        space: {
          '40%': {
            opacity: '0.55',
          },
          '50%': {
            opacity: '0.25',
          },
          '60%': {
            opacity: '0.75',
          },
          '100%': {
            transform: 'rotate(260deg)',
          },
        },
        movingbg: {
          from: {
            transform: 'translate3d(0px, 0px, 0px)',
          },
          to: {
            transform: 'translate3d(1000px, 0px, 0px)',
          },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        rainbow: {
          '0%': { 'background-position': '0' },
          '50%': { 'background-position': '100%' },
          '100%': { 'background-position': '50%' },
        },
      },
    },
  },
  plugins: [],
};

// @keyframes spin {
//   to {
//     transform: rotate(360deg);
//   }
// }
// .animate-spin {
//   animation: spin 1s linear infinite;
// }
