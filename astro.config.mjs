import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Update this if the creative build is deployed to a different domain.
  site: 'https://portofoliov2.vercel.app',
});
