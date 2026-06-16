import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Handle chunk load errors (often caused by out-of-date service workers or deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.info('Terjadi pembaruan sistem (Vite chunk load error), halaman akan dimuat ulang...');
  window.location.reload();
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
