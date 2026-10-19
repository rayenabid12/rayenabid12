#!/usr/bin/env bash
# Renders every family sheet as a still (out/sheets/<name>.png, then a JPG copy in sheets/), N at a time.
#   ./render_sheets.sh                 all sheets
#   ./render_sheets.sh mom_turn lineup just these
set -u
cd "$(dirname "$0")"
export CHROME_PATH="${CHROME_PATH:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | tail -1)}"
N="${N:-3}"
if [ $# -gt 0 ]; then names=("$@"); else
  names=(lineup)
  for w in girl boy mom dad grandma grandpa; do names+=("${w}_turn" "${w}_faces_a" "${w}_faces_b" "${w}_poses_a" "${w}_poses_b"); done
fi
mkdir -p out/sheets sheets
one() {
  local s=$1
  node render.mjs ${GL_FLAGS:---soft-gl} --loop="$s" --stills=0 --out="out/sheets/$s" > "out/sheets/$s.log" 2>&1 \
    && ffmpeg -y -loglevel error -i "out/sheets/$s/t0_00.png" -q:v 2 "sheets/$s.jpg" && echo "done $s" || echo "FAILED $s (see out/sheets/$s.log)"
}
export -f one
printf '%s\n' "${names[@]}" | xargs -P "$N" -I{} bash -c 'one {}'
