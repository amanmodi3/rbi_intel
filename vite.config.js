import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/rss/pressreleases': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: () => '/pressreleases_rss.xml',
        secure: false,
      },
      '/api/rss/notifications': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: () => '/notifications_rss.xml',
        secure: false,
      },
      '/api/rss/publications': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: () => '/Publication_rss.xml',
        secure: false,
      },
      '/api/rss/speeches': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: () => '/speeches_rss.xml',
        secure: false,
      },
    },
  },
});
