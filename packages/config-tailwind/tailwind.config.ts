import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        dophy: {
          50: '#fff8f0',
          100: '#ffeedb',
          200: '#ffd9b3',
          300: '#ffbc80',
          400: '#ff984d',
          500: '#ff7726',
          600: '#f05713',
          700: '#c7400d',
          800: '#9e3412',
          900: '#7f2d12',
          950: '#451407',
        },
        brand: {
          amber: '#f59e0b',
          dark: '#0f172a',
          surface: '#1e293b',
          accent: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
