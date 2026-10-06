// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkWiki from './src/lib/remark-wiki.mjs';

export default defineConfig({
  site: 'https://introspection.infinite.fun',
  output: 'static',

  // Emit /papers/foo.html rather than /papers/foo/index.html. The page's URL is
  // then /papers/foo and its markdown twin is that URL plus ".md" — the
  // convention llms.txt proposes, with no index.html.md special case.
  build: { format: 'file' },
  trailingSlash: 'never',

  // Inline thread posts and figures in page bodies. Astro's default Markdown
  // processor does not run remark plugins, so this opts into the unified one.
  markdown: { processor: unified({ remarkPlugins: [remarkWiki] }) },

  devToolbar: { enabled: false },
});
