import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline capability
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new update is available for ISOT 2026. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('ISOT 2026 is ready to work offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
