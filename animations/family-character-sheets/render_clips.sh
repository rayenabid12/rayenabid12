#!/usr/bin/env bash
# Renders the animated clips to clips/<name>.mp4, N at a time. Drawn on twos: 12 drawings a second, each held for two
# frames of the 24 fps video (hand-drawn timing, and half the render time without a GPU).
#   ./render_clips.sh                     all clips
#   ./render_clips.sh mom_walk dad_turn   just these
set -u
cd "$(dirname "$0")"
export CHROME_PATH="${CHROME_PATH:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | tail -1)}"
N="${N:-4}"
if [ $# -gt 0 ]; then names=("$@"); else
  names=(); for w in girl boy mom dad grandma grandpa; do names+=("${w}_turn" "${w}_walk" "${w}_run" "${w}_jump" "${w}_emotions"); done
fi
mkdir -p clips out/frames
one() {
  local s=$1 d="out/frames/$1"
  node render.mjs ${GL_FLAGS:---soft-gl} --loop="$s" --frames --fps=12 --workers=1 --framesdir="$d" > "$d.log" 2>&1 \
    && ffmpeg -y -loglevel error -framerate 12 -i "$d/f%05d.jpg" -vf fps=24 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "clips/$s.mp4" \
    && echo "done $s" || echo "FAILED $s (see $d.log)"
}
export -f one
printf '%s\n' "${names[@]}" | xargs -P "$N" -I{} bash -c 'one {}'
