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
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
        },
        foreground: {
          DEFAULT: '#000000',
          secondary: '#1A1A1A',
          muted: '#666666',
          subtle: '#999999',
        },
        border: {
          DEFAULT: '#E5E5E5',
          strong: '#D4D4D4',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          active: '#F5F5F5',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'PingFang SC', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'calc(env(safe-area-inset-bottom) + 64px)',
        'nav': '64px',
        'bottom-action': 'calc(env(safe-area-inset-bottom) + 88px)',
      },
    },
  },
  plugins: [],
}

export default config
