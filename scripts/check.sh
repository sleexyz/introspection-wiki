#!/usr/bin/env bash
# Check a running copy of the site the way an agent would see it.
#   scripts/check.sh https://introspection.infinite.fun
#   scripts/check.sh http://localhost:8787
set -uo pipefail
base="${1:-https://introspection.infinite.fun}"
fail=0

# expect <label> <want-substring> <curl args...>: the response, headers
# included, must contain the substring.
expect() {
  local label="$1" want="$2"; shift 2
  local got
  got="$(curl -sS -m 20 -D - "$@" | tr -d '\r')"
  if grep -qiF -- "$want" <<<"$got"; then echo "ok    $label"; else echo "FAIL  $label (wanted: $want)"; fail=1; fi
}

expect "home is HTML"                      "content-type: text/html"      "$base/"
expect "home advertises its twin"          'rel="alternate"'              "$base/"
expect "home varies on Accept"             "vary: accept"                 "$base/"
expect "Accept: text/markdown on /"        "content-type: text/markdown"  -H "Accept: text/markdown" "$base/"
expect "Accept: text/markdown on a paper"  "# Identifying Introspection"  -H "Accept: text/markdown" "$base/papers/atkinson2026-identifying-introspection"
expect "markdown wins when ranked equal"   "content-type: text/markdown"  -H "Accept: text/markdown, text/html;q=0.9" "$base/papers"
expect "browsers still get HTML"           "content-type: text/html"      -H "Accept: text/html,application/xhtml+xml,*/*;q=0.8" "$base/papers"
expect ".md twin"                          "content-type: text/markdown"  "$base/papers/atkinson2026-identifying-introspection.md"
expect "/index.html.md alias"              "content-type: text/markdown"  "$base/index.html.md"
expect "/papers/index.md alias"            "content-type: text/markdown"  "$base/papers/index.md"
expect "markdown carries content signals"  "content-signal: ai-train=yes" "$base/index.md"
expect "llms.txt"                          "# LLM Introspection Wiki"     "$base/llms.txt"
expect "llms-full.txt"                     "# LLM Introspection Wiki"     "$base/llms-full.txt"
expect "robots.txt content signals"        "Content-Signal: search=yes"   "$base/robots.txt"
expect "robots.txt names the sitemap"      "Sitemap: "                    "$base/robots.txt"
expect "sitemap.xml"                       "<urlset"                      "$base/sitemap.xml"
expect "feed.xml"                          "<feed"                        "$base/feed.xml"
expect "papers.json"                       '"papers"'                     "$base/data/papers.json"
expect "graph.json"                        '"edges"'                      "$base/data/graph.json"
expect "references.bib"                    "@"                            "$base/references.bib"
expect "unknown page is a 404"             " 404"                         "$base/no-such-page"

exit $fail
