import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';

const root = createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./serviceWorker.js')
      .then(reg => console.log('ServiceWorker registered:', reg))
      .catch(err => console.error('ServiceWorker registration failed:', err));
  });
}
