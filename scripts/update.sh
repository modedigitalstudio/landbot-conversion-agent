#!/usr/bin/env bash
# Put a package from the client on the STAGING branch.
#   scripts/update.sh ~/Downloads/agente-home-v4-2026-10-10 [more folders...]
# Copies every lb-awe-*.txt in the folder(s) to bundles/<name>.js, commits and pushes to staging.
# Then test on the webflow.io site and run scripts/release.sh to put it live.
set -euo pipefail
cd "$(dirname "$0")/.."
[ $# -ge 1 ] || { echo "usage: scripts/update.sh <client package folder> [...]"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Working tree has uncommitted changes. Commit or stash them first."; exit 1; }

git fetch -q origin
git checkout -q staging
git pull -q --ff-only origin staging

changed=()
for dir in "$@"; do
  shopt -s nullglob
  files=("$dir"/lb-awe-*.txt "$dir"/lb-awe-*.js)
  [ ${#files[@]} -gt 0 ] || { echo "No lb-awe-*.txt in $dir"; exit 1; }
  for f in "${files[@]}"; do
    name="$(basename "${f%.*}").js"
    cp "$f" "bundles/$name"
    changed+=("$name: $(head -1 "$f" | sed -E 's#^/\* *##; s# *\*/$##')")
  done
  # lb-journey is pasted by hand in Site settings > Footer code, so only warn when it changed.
  if [ -f "$dir/lb-journey.js" ] && ! cmp -s "$dir/lb-journey.js" webflow/site-footer-lb-journey.html; then
    cp "$dir/lb-journey.js" webflow/site-footer-lb-journey.html
    echo "⚠️  lb-journey.js changed: re-paste webflow/site-footer-lb-journey.html into Webflow Site settings > Footer code."
  fi
  if [ -f "$dir/loader.js" ]; then
    echo "ℹ️  $dir has a loader.js. Loaders now live in webflow/ and point at the CDN; compare it by hand if the client changed more than the asset link."
  fi
done

git add -A bundles webflow
if git diff --cached --quiet; then echo "Nothing changed: these files are already on staging."; exit 0; fi
msg="Update $(printf '%s\n' "${changed[@]}" | cut -d: -f1 | sed 's/\.js$//' | paste -sd ', ' -)"
git commit -q -m "$msg" -m "$(printf '%s\n' "${changed[@]}")"
git push -q origin staging
echo "✅ Pushed to staging: $msg"
echo "   The cache purge runs on GitHub (about 1 minute): https://github.com/modedigitalstudio/landbot-conversion-agent/actions"
echo "   Then test on the webflow.io site. When it is approved: scripts/release.sh"
