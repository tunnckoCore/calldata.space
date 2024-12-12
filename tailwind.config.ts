import type { Config } from 'tailwindcss';


// const astroCalldata = {
//   backgroundSize: {
//     'size-2x': '200%',
//   },
//   extend: {
//     animation: {
//       rotate: 'rotate 10s linear infinite',
//       rainbow: 'rainbow 3s ease-in infinite',
//       'ping-2xs': 'ping 800s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
//       'rotate-cubic-10s': 'rotate 2500s linear infinite;',
//       'rotate-linear-slow': 'rotate 50s cubic-bezier(0, 0, 0.5, 0.8) infinite;',
//       pinger: 'pinger 2000s linear infinite;',
//       movingbg: 'movingbg 650s linear infinite',
//       space1: 'space 180s ease-in-out infinite;',
//       space3: 'space 240s ease-in-out infinite;',
//     },
//     keyframes: {
//       pinger: {
//         '40%': {
//           opacity: '0.55',
//         },
//         '50%': {
//           opacity: '0.25',
//         },
//         '70%': {
//           opacity: '0.75',
//         },
//         '75%, 100%': {
//           transform: 'scale(3)',
//           opacity: '0.15',
//         },
//       },
//       space: {
//         '40%': {
//           opacity: '0.55',
//         },
//         '50%': {
//           opacity: '0.25',
//         },
//         '60%': {
//           opacity: '0.75',
//         },
//         '100%': {
//           transform: 'rotate(260deg)',
//         },
//       },
//       movingbg: {
//         from: {
//           transform: 'translate3d(0px, 0px, 0px)',
//         },
//         to: {
//           transform: 'translate3d(1000px, 0px, 0px)',
//         },
//       },
//       rotate: {
//         '0%': { transform: 'rotate(0deg)' },
//         '100%': { transform: 'rotate(-360deg)' },
//       },
//       rainbow: {
//         '0%': { 'background-position': '0' },
//         '50%': { 'background-position': '100%' },
//         '100%': { 'background-position': '50%' },
//       },
//     },
//   },
// },
// }

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    backgroundSize: {
      'size-2x': '200%',
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        rainbow: {
          '0%': { 'background-position': '0' },
          '50%': { 'background-position': '100%' },
          '100%': { 'background-position': '50%' },
        },
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
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pinger: 'pinger 2000s linear infinite',
        rainbow: 'rainbow 3s ease-in infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
