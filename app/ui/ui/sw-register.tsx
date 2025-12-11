'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('KVTS App Service Worker registered: ', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed: ', error);
        });
    }
  }, []);

  return null; // This component renders nothing
}