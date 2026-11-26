/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#213448', navy: '#213448', panel: '#547792', line: '#94B4C1',
        electric: '#547792', ice: '#ECEFCA', muted: '#94B4C1'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      letterSpacing: { tighter2: '-.075em' },
      boxShadow: { glow: '0 0 80px rgba(77,159,255,.16)' }
    }
  },
  plugins: []
};
