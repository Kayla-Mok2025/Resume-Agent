/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFCF8',
        card: '#FFFFFF',
        surface: '#F4F8F2',
        'green-main': '#8BCF9B',
        'green-deep': '#5FAF74',
        'green-light': '#EAF7EC',
        'yellow-main': '#F3E7A0',
        'yellow-light': '#FBF6D8',
        'text-heading': '#24342A',
        'text-body': '#5F6F64',
        'text-muted': '#8A978D',
        'border-default': '#E7EFE4',
        'border-hover': '#CFE3D3',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
          '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)',
        'feature': '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
        'feature-hover': '0 4px 12px rgba(95,175,116,0.15), 0 2px 4px rgba(0,0,0,0.04)',
        'btn': '0 2px 8px rgba(95,175,116,0.30), 0 1px 2px rgba(0,0,0,0.08)',
        'btn-hover': '0 6px 20px rgba(95,175,116,0.38), 0 2px 4px rgba(0,0,0,0.08)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400% 0' },
          '100%': { backgroundPosition: '400% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-soft': 'pulse_soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
