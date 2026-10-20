import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// While developing, the ERP's API and files are passed on to the ERP (src/erp.js), so the site
// reads its cars without CORS. ERP_PROXY is the ERP's address; ERP_HOST picks one of its business
// environments when it has several (e.g. automodiran.localhost:8080).
const target = process.env.ERP_PROXY || 'http://localhost:8080';
const erp = {
  target,
  changeOrigin: true,
  ...(process.env.ERP_HOST ? { headers: { host: process.env.ERP_HOST } } : {}),
};
const proxy = { '/api': erp, '/files': erp };

export default defineConfig({ plugins: [react()], server: { proxy }, preview: { proxy } });
