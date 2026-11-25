// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bit-flamemouse.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
    },
  },
});
