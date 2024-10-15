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
        'ping-2xs': 'ping 3s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        'rotate-cubic-10s': 'rainbow 10s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        'rotate-linear-slow': 'rotate 50s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        'spin-2xs': 'ping 1200s linear infinite;',
        movingbg: 'movingbg 650s linear infinite',
      },
      keyframes: {
        movingbg: {
          from: {
            transform: 'translate3d(0px, 0px, 0px)',
          },
          to: {
            transform: 'translate3d(1000px, 0px, 0px)',
          },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg) scale(10)' },
          '100%': { transform: 'rotate(-360deg) scale(10)' },
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
