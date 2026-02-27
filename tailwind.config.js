/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['var(--font-pixel)', 'Courier New', 'monospace'],
        'pixel-body': ['var(--font-pixel-body)', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pixel-bounce': 'pixelBounce 0.5s ease-in-out',
        'pixel-shake': 'pixelShake 0.4s ease-in-out',
        'pixel-glow': 'pixelGlow 1.5s ease-in-out infinite',
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
        'pixel-wiggle': 'pixelWiggle 0.3s ease-in-out',
        'score-pop': 'scorePop 1s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'flash-green': 'flashGreen 0.6s ease-out',
        'flash-red': 'flashRed 0.6s ease-out',
        'pulse-urgent': 'pulseUrgent 0.5s ease-in-out infinite',
        'confetti-fall': 'confettiFall 1.5s ease-in forwards',
        typewriter: 'typewriter 0.1s steps(1) forwards',
        'pixelate-in': 'pixelateIn 0.4s steps(5) forwards',
        'coin-spin': 'coinSpin 0.6s ease-in-out',
      },
      keyframes: {
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-8px)' },
          '50%': { transform: 'translateY(-4px)' },
          '75%': { transform: 'translateY(-2px)' },
        },
        pixelShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(-4px)' },
          '20%': { transform: 'translateX(4px)' },
          '30%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '50%': { transform: 'translateX(-2px)' },
          '60%': { transform: 'translateX(2px)' },
          '70%': { transform: 'translateX(-1px)' },
          '80%': { transform: 'translateX(1px)' },
        },
        pixelGlow: {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': {
            boxShadow: '0 0 15px currentColor, 0 0 30px currentColor, 0 0 45px currentColor',
          },
        },
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pixelWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        scorePop: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '1', transform: 'translateY(-30px) scale(1.3)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(0.8)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.4)' },
          '50%': { backgroundColor: 'rgba(34, 197, 94, 0.6)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.4)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.6)' },
          '100%': { backgroundColor: 'transparent' },
        },
        pulseUrgent: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        confettiFall: {
          '0%': { opacity: '1', transform: 'translateY(-20px) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(100vh) rotate(720deg)' },
        },
        typewriter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pixelateIn: {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '20%': { opacity: '0.3', filter: 'blur(6px)' },
          '40%': { opacity: '0.5', filter: 'blur(4px)' },
          '60%': { opacity: '0.7', filter: 'blur(2px)' },
          '80%': { opacity: '0.9', filter: 'blur(1px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        coinSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
