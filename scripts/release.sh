#!/usr/bin/env bash
# Put what is on staging live on landbot.io (fast-forwards main to staging).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -z "$(git status --porcelain)" ] || { echo "Working tree has uncommitted changes. Commit or stash them first."; exit 1; }
git fetch -q origin
pending="$(git log --oneline origin/main..origin/staging)"
[ -n "$pending" ] || { echo "main already has everything on staging."; exit 0; }
echo "Going live on landbot.io:"; echo "$pending"
read -r -p "Continue? [y/N] " yn; [ "$yn" = y ] || exit 1
git checkout -q main
git merge -q --ff-only origin/staging
git push -q origin main
git checkout -q staging
echo "✅ Live. Cache purge: https://github.com/modedigitalstudio/landbot-conversion-agent/actions"
