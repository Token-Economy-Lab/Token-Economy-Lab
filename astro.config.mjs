import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://token-economy-lab.github.io',
  base: '/',
  output: 'static',
  outDir: './build/plain',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  vite: { build: { sourcemap: false } },
  devToolbar: { enabled: false },
});
