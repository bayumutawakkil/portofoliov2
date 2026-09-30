/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Core Background ──────────────────────────────────
        'bg-primary':   '#030712', // Deep space black
        'bg-secondary': '#0a0f1d', // Dark blue-black
        'bg-card':      'rgba(10, 15, 29, 0.6)', // Glassmorphism base

        // ── Neon Accent ───────────────────────────────────────
        'cyber-400': '#7dd3fc', // Light cyan
        'cyber-500': '#38bdf8', // Electric cyan (primary accent)
        'cyber-600': '#0ea5e9', // Deep neon blue
        'cyber-700': '#0284c7', // Bold blue

        // ── Text ──────────────────────────────────────────────
        'ice-white':    '#f8fafc', // Primary text
        'blue-muted':   '#94a3b8', // Secondary text
        'blue-faint':   '#334155', // Disabled / placeholder

        // ── Border & Glow ─────────────────────────────────────
        'border-glow':  'rgba(56, 189, 248, 0.25)',
        'border-dim':   'rgba(56, 189, 248, 0.08)',
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'Inter', 'sans-serif'],
      },

      backgroundImage: {
        'glow-conic':
          'conic-gradient(from 180deg at 50% 50%, #030712 0deg, #0a1628 180deg, #030712 360deg)',
        'cyber-gradient':
          'linear-gradient(135deg, #030712 0%, #0a0f1d 50%, #030f1f 100%)',
        'hero-radial':
          'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(56,189,248,0.15), transparent)',
        'card-gradient':
          'linear-gradient(135deg, rgba(56,189,248,0.05) 0%, rgba(14,165,233,0.02) 100%)',
      },

      boxShadow: {
        'glow-sm':  '0 0 12px rgba(56, 189, 248, 0.3)',
        'glow-md':  '0 0 30px rgba(56, 189, 248, 0.25), 0 0 60px rgba(56, 189, 248, 0.1)',
        'glow-lg':  '0 0 60px rgba(56, 189, 248, 0.35), 0 0 120px rgba(56, 189, 248, 0.15)',
        'card':     '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(56, 189, 248, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.3), inset 0 1px 0 rgba(56, 189, 248, 0.15)',
      },

      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'scan-line':   'scanLine 8s linear infinite',
        'fade-up':     'fadeUp 0.8s ease forwards',
        'spin-slow':   'spin 12s linear infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(56,189,248,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(56,189,248,0.2)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
