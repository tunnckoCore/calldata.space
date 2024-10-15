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
        'rotate-2xs': 'rainbow 10s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
        'spin-2xs': 'ping 500s linear infinite;',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg) scale(10)' },
          '100%': { transform: 'rotate(-360deg) scale(10)' },
        },
        rainbow: {
          '0%': { 'background-position': '0' },
          '50%': { 'background-position': '100%' },
          '100%': { 'background-position': '0' },
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
