#!/usr/bin/env bash
# Renders the full family reel and one reel per character into out/.
set -e
cd "$(dirname "$0")"
npx remotion render FamilyReel out/family_reel.mp4 --concurrency=4
for c in Girl Boy Mom Dad Grandma Grandpa; do npx remotion render ${c}Reel out/$(echo $c | tr A-Z a-z)_reel.mp4 --concurrency=4; done
echo ALL DONE
