import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFC9C9',
          300: '#FF9999',
          400: '#FF7777',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#FF3838',
          800: '#E63946',
          900: '#D62828',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#999999',
          500: '#666666',
          600: '#525252',
          700: '#1A1A1A',
          800: '#0F0F0F',
          900: '#0a0a0a',
        },
        success: { 50: '#F1F8F4', 500: '#4CAF50', 600: '#45A049' },
        warning: { 50: '#FFF8F1', 500: '#FF9800', 600: '#F57C00' },
        error: { 50: '#FFEBEE', 500: '#F44336', 600: '#E53935' },
        info: { 50: '#E3F2FD', 500: '#2196F3', 600: '#1976D2' },
        background: { DEFAULT: '#FFFFFF', secondary: '#FAFAFA', tertiary: '#F5F5F5' },
        foreground: { DEFAULT: '#0a0a0a', secondary: '#1A1A1A', muted: '#666666', subtle: '#999999' },
        border: { DEFAULT: '#E5E5E5', strong: '#D4D4D4' },
        surface: { DEFAULT: '#FAFAFA', active: '#F5F5F5' },
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '20px' }],
        'lg': ['17px', { lineHeight: '24px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
      },
      spacing: {
        'xs': '4px', 'sm': '8px', 'md': '12px', 'lg': '16px',
        'xl': '20px', '2xl': '24px', '3xl': '32px', '4xl': '40px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'calc(env(safe-area-inset-bottom) + 64px)',
        'nav': '64px',
      },
      borderRadius: {
        'sm': '4px', 'md': '6px', 'lg': '8px', 'xl': '12px', '2xl': '16px', '3xl': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
