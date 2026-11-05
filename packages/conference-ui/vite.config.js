import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'HubConferenceUi',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'conference-ui.js' : 'conference-ui.cjs',
    },
    rollupOptions: {
      external: ['@slicer-hub/client'],
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
