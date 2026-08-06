'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      // Delay SW registration until after the window has fully loaded
      // This prevents the SW from competing for bandwidth during initial page load
      window.addEventListener('load', registerServiceWorker);

      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);

  return null;
}
