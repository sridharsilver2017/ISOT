import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function apiDevPlugin() {
  return {
    name: 'api-dev-mock-fallback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/speaker-images' || req.url === '/api/speakers') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ images: {}, success: true }));
          return;
        }
        if (req.url === '/api/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const pwd = data.password || '';
              if (pwd === 'srd4usSR@78' || pwd === 'admin123' || pwd === 'isot2026') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  token: 'dev-token',
                  success: true,
                  user: { id: 'admin-1', username: 'admin', name: 'ISOT Admin', role: 'super_admin' }
                }));
                return;
              }
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid password. Access denied.' }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Bad request' }));
            }
          });
          return;
        }
        if (req.url === '/api/auth/me') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ user: { id: 'admin-1', username: 'admin', name: 'ISOT Admin', role: 'super_admin' } }));
          return;
        }
        if (req.url === '/api/programme' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ sessions: [] }));
          return;
        }
        if (req.url === '/api/programme' && req.method === 'PUT') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, lastUpdated: new Date().toISOString() }));
          return;
        }
        if (req.url === '/api/upload-speaker-image' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [
    apiDevPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'isot-logo.svg', 'icons/*.png'],
      manifest: {
        name: 'ISOT 2026 - 36th Annual Conference',
        short_name: 'ISOT 2026',
        description: '36th Annual Conference of the Indian Society of Organ Transplantation, 9-11 October 2026, HITEX Hyderabad',
        theme_color: '#B5123A',
        background_color: '#FAFAF8',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
