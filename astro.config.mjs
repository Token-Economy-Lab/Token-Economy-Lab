import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://token-economy-lab.github.io',
  base: '/',
  output: 'static',
  outDir: './build/plain',
  cacheDir: './.astro/cache',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  vite: { envDir: false, build: { sourcemap: false } },
  devToolbar: { enabled: false },
});
