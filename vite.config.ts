
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // base: './' ensures the app works whether deployed to a custom domain 
    // or a GitHub project page (myusername.github.io/repo-name/)
    base: '/smartvoting/',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  };
});
