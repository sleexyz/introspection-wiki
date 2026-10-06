// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://introspection.infinite.fun',
  output: 'static',

  // Emit /papers/foo.html rather than /papers/foo/index.html. The page's URL is
  // then /papers/foo and its markdown twin is that URL plus ".md" — the
  // convention llms.txt proposes, with no index.html.md special case.
  build: { format: 'file' },
  trailingSlash: 'never',

  devToolbar: { enabled: false },
});
