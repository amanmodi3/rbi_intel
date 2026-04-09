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
      '/rss/pressreleases': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: (path) => '/pressreleases_rss.xml',
        secure: false,
      },
      '/rss/notifications': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: (path) => '/notifications_rss.xml',
        secure: false,
      },
      '/rss/publications': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: (path) => '/Publication_rss.xml',
        secure: false,
      },
      '/rss/speeches': {
        target: 'https://www.rbi.org.in',
        changeOrigin: true,
        rewrite: (path) => '/speeches_rss.xml',
        secure: false,
      },
    },
  },
});
