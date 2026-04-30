/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#000000',
        card:   '#040804',
        border: 'rgba(0,255,65,0.12)',
        matrix: { DEFAULT: '#00ff41', dim: '#00a82a', dark: '#001f0a' },
        amber:  { DEFAULT: '#ff9500', dim: '#cc7700', glow: '#ffb700' },
        danger: { DEFAULT: '#ff2d2d', dim: '#aa1010' },
        muted:  '#1a2a1a',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn .3s ease both',
        'slide-up':  'slideUp .35s ease both',
        'typing':    'typing .8s ease-in-out infinite',
        'sonar':     'sonar 3s ease-out infinite',
        'breathe':   'breathe 4s ease-in-out infinite',
        'eye-pulse': 'eyePulse 2s ease-in-out infinite',
        'float-up':  'floatUp 3s ease-out infinite',
        'scanline':  'scanline 8s linear infinite',
        'glitch':    'glitch 6s ease-in-out infinite',
        'flicker':   'flicker 5s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        typing:   { '0%,100%': { opacity: .4, transform: 'translateY(0)' }, '50%': { opacity: 1, transform: 'translateY(-4px)' } },
        sonar:    { '0%': { transform: 'scale(1)', opacity: .7 }, '100%': { transform: 'scale(2.4)', opacity: 0 } },
        breathe:  { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.04)' } },
        eyePulse: { '0%,100%': { opacity: 1, filter: 'brightness(1)' }, '50%': { opacity: .3, filter: 'brightness(0.4)' } },
        floatUp:  { '0%': { transform: 'translateY(0) scale(1)', opacity: .6 }, '80%': { opacity: .2 }, '100%': { transform: 'translateY(-55px) scale(.3)', opacity: 0 } },
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        glitch:   {
          '0%,89%,100%': { transform: 'translate(0)', filter: 'none' },
          '90%': { transform: 'translate(-3px,0)', filter: 'hue-rotate(90deg)' },
          '92%': { transform: 'translate(3px,0)',  filter: 'hue-rotate(-90deg)' },
          '94%': { transform: 'translate(0,2px)',  filter: 'saturate(3)' },
          '96%': { transform: 'translate(-2px,0)', filter: 'none' },
        },
        flicker: {
          '0%,88%,90%,92%,100%': { opacity: 1 },
          '89%': { opacity: .7 },
          '91%': { opacity: .9 },
        },
        bar1: { '0%,100%': { transform: 'scaleY(.2)' }, '50%': { transform: 'scaleY(1)' } },
        bar2: { '0%,100%': { transform: 'scaleY(.7)' }, '50%': { transform: 'scaleY(.2)' } },
        bar3: { '0%,100%': { transform: 'scaleY(.4)' }, '50%': { transform: 'scaleY(.9)' } },
      }
    }
  },
  plugins: []
};
