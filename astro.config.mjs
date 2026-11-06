import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  // Update this if the creative build is deployed to a different domain.
  site: 'https://portofoliov2.vercel.app',
});
