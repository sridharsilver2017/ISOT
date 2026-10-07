import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';

function apiDevPlugin() {
  const dataDir = path.resolve(__dirname, 'server/data');
  const programmeFile = path.join(dataDir, 'programme.json');
  const speakerImagesFile = path.join(dataDir, 'speaker-images.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return {
    name: 'api-dev-mock-fallback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/speaker-images' || req.url === '/api/speakers') {
          if (req.method === 'GET') {
            let images = {};
            if (fs.existsSync(speakerImagesFile)) {
              try {
                images = JSON.parse(fs.readFileSync(speakerImagesFile, 'utf-8'));
              } catch {}
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ images, success: true }));
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                let images: Record<string, string> = {};
                if (fs.existsSync(speakerImagesFile)) {
                  try { images = JSON.parse(fs.readFileSync(speakerImagesFile, 'utf-8')); } catch {}
                }
                if (data.speakerId && data.imageUrl) {
                  images[data.speakerId] = data.imageUrl;
                  fs.writeFileSync(speakerImagesFile, JSON.stringify(images, null, 2), 'utf-8');
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, imageUrl: data.imageUrl }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to save photo' }));
              }
            });
            return;
          }
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
          let sessions: any[] = [];
          if (fs.existsSync(programmeFile)) {
            try {
              const raw = JSON.parse(fs.readFileSync(programmeFile, 'utf-8'));
              sessions = Array.isArray(raw.sessions) ? raw.sessions : Array.isArray(raw) ? raw : [];
            } catch {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            sessions,
            storage: 'Local Dev Server (server/data/programme.json)',
            lastUpdated: new Date().toISOString()
          }));
          return;
        }
        if (req.url === '/api/programme' && req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const sessions = data.sessions || (Array.isArray(data) ? data : []);
              if (Array.isArray(sessions) && sessions.length > 0) {
                fs.writeFileSync(programmeFile, JSON.stringify(sessions, null, 2), 'utf-8');
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: sessions.length, lastUpdated: new Date().toISOString() }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Failed to save programme' }));
            }
          });
          return;
        }
        if (req.url === '/api/programme/reset' && (req.method === 'POST' || req.method === 'GET')) {
          if (fs.existsSync(programmeFile)) {
            try { fs.unlinkSync(programmeFile); } catch {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Reset to default programme' }));
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
