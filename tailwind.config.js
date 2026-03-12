/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        base: '#0f1019',
        surface: '#161825',
        elevated: '#1c1f30',
        hover: '#232640',
        accent: {
          primary: '#6c5ce7',
          secondary: '#00cec9',
        },
        success: '#00b894',
        warning: '#fdcb6e',
        danger: '#e17055',
        info: '#74b9ff',
        muted: '#5c5a6e',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        serif: ['Noto Serif SC', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeSlideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(108,92,231,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(108,92,231,0.6)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}