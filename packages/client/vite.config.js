import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'HubClient',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'hub-client.js' : 'hub-client.cjs'),
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
