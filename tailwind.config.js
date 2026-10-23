/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#b8d2ff',
          300: '#8fb3ff',
          400: '#5f86f5',
          500: '#2f58d8',
          600: '#1838ad',
          700: '#0d258f',
          800: '#06196f',
          900: '#01257D',
        },
        mint: {
          50:  '#ecffff',
          100: '#cffeff',
          200: '#a5ffff',
          300: '#67ffff',
          400: '#00FFFF',
          500: '#00d8df',
          600: '#00a9b3',
          700: '#05838c',
          800: '#0a6670',
          900: '#0d535d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                    '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceDot: { '0%, 80%, 100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
