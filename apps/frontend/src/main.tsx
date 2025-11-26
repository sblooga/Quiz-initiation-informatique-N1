import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Conserve uniquement les CSS réels
import './styles/index.css';
import './styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Service worker: prod uniquement (et nettoyage en dev)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  } else {
    navigator.serviceWorker.getRegistrations?.()
      .then(regs => regs.forEach(r => r.unregister()));
  }
}
