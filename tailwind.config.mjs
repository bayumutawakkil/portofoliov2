/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f', navy: '#0a1728', panel: '#0e2035', line: '#1d3550',
        electric: '#4d9fff', ice: '#b8dcff', muted: '#8295aa'
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
