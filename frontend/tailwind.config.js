/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#050810',
        card:   '#0b0f1e',
        border: 'rgba(0,229,255,0.12)',
        cyan:   { DEFAULT: '#00e5ff', dark: '#0099bb' },
        purple: { DEFAULT: '#7c4dff', light: '#b388ff' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in':    'fadeIn .3s ease both',
        'slide-up':   'slideUp .35s ease both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'typing':     'typing .8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        pulseGlow: { from: { boxShadow: '0 0 20px rgba(0,229,255,.3)' }, to: { boxShadow: '0 0 40px rgba(124,77,255,.6)' } },
        typing:    { '0%,100%': { opacity: .4, transform: 'translateY(0)' }, '50%': { opacity: 1, transform: 'translateY(-4px)' } },
      }
    }
  },
  plugins: []
};
