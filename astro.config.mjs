import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://redfire29.github.io',
  base: '/pen-mirror-dance',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['gifenc'],
    },
    ssr: {
      noExternal: ['gifenc'],
    },
  },
});
