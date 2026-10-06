# Local dev server.
dev:
    npx astro dev

# The rm: Astro caches each page's rendered HTML keyed by that page's own
# source. A paper page also depends on the thread it embeds and on the markdown
# plugin, and a change to either alone would not invalidate it.

# Production build into dist/.
build:
    rm -f .astro/data-store.json
    npx astro build

# Build, then serve through the real Worker — the only way to exercise the
# markdown negotiation locally (try: curl -H 'Accept: text/markdown' localhost:8787/).
preview: build
    npx wrangler dev

deploy: build
    npx wrangler deploy

# Import a thread from X: just thread <post-url> <thread-id> [paper-id ...]
thread *args:
    node scripts/thread.mjs {{args}}

# Cut a figure out of a paper's PDF: just figure page <paper-id> <page>, then
# just figure crop <paper-id> <page> <x> <y> <w> <h> <name>
figure *args:
    node scripts/figure.mjs {{args}}

# Recrawl citations one hop out from every paper page and rebuild the frontier.
crawl *args:
    node scripts/crawl.mjs {{args}}

# Check frontmatter and internal links without a build: just lint [file ...]
lint *args:
    node scripts/lint.mjs {{args}}

# Check the deployed site the way an agent would see it.
check url="https://introspection.infinite.fun":
    ./scripts/check.sh {{url}}
