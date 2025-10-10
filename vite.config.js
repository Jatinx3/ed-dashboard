import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// YOUR LIVE AWS API GATEWAY BASE URL
const AWS_BASE_URL = 'https://twtti9ff9f.execute-api.us-east-1.amazonaws.com/dev'; 

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When the frontend requests anything starting with /api, 
      // Vite redirects it to the AWS_BASE_URL (excluding the /api part).
      '/api': {
        target: AWS_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
