/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf6',
          500: '#0c8fe4',
          600: '#0271c3',
          700: '#035a9f',
          800: '#074c83',
          900: '#0c406e',
          950: '#082848',
        },
        navy: {
          800: '#111827',
          900: '#0b0f19',
          950: '#05070d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Malayalam"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -8px rgba(15,23,42,.08)',
        lift: '0 2px 4px rgba(15,23,42,.05), 0 16px 40px -12px rgba(2,113,195,.22)',
        glow: '0 0 0 1px rgba(12,143,228,.25), 0 8px 30px -6px rgba(12,143,228,.45)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop-in': { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .35s ease-out both',
        'pop-in': 'pop-in .18s ease-out both',
        'scale-in': 'pop-in .18s ease-out both',
        'fade-in': 'fade-up .35s ease-out both',
      },
    },
  },
  plugins: [],
}
