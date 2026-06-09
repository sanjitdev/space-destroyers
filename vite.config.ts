import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/space-destroyers/' : '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/scenes/')) return 'game-scenes';
          if (id.includes('/src/entities/')) return 'game-entities';
          if (id.includes('/src/managers/')) return 'game-managers';
          return undefined;
        },
      },
    },
  },
}));
