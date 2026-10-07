# Local dev server.
dev:
    npx astro dev

# The --force: Astro caches each page's rendered HTML keyed by that page's own
# source. A page also depends on the threads it embeds, on whether the papers it
# links to are stubs, and on the markdown plugin, and a change to any of those
# alone would not invalidate it.

# Production build into dist/.
build:
    npx astro build --force

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

# Find an outline's locators and quotations in the paper's PDF: just anchor <paper-id>
anchor *args:
    node scripts/anchor.mjs {{args}}

# Recrawl citations one hop out from every paper page and rebuild the frontier.
crawl *args:
    node scripts/crawl.mjs {{args}}

# Check frontmatter and internal links without a build: just lint [file ...]
lint *args:
    node scripts/lint.mjs {{args}}

# Check the deployed site the way an agent would see it.
check url="https://introspection.infinite.fun":
    ./scripts/check.sh {{url}}
