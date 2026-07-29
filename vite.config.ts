import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/flloisee-task-tracker/',
  server: { host: true, allowedHosts: true, watch: { ignored: ['**/data/**'] } },
});
