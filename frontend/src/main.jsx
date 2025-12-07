import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // remove .ts or .tsx
import './index.css';
import 'leaflet/dist/leaflet.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
}
