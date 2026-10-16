#!/usr/bin/env bash
# Colour grade + voice polish: public/raw.mp4 -> public/graded.mp4
# Grade: neutralise the yellow wall, cool lavender-tinted whites, gentle S-curve,
# +8% saturation, soft vignette. Audio: high-pass, denoise, compression, -14 LUFS.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -i public/raw.mp4 \
  -vf "colorbalance=rs=-0.02:gs=-0.02:bs=0.05:rm=0.0:gm=-0.02:bm=0.0:rh=-0.02:gh=-0.03:bh=0.03,curves=all='0/0.02 0.2/0.17 0.5/0.52 0.8/0.86 1/0.98',eq=contrast=1.06:saturation=1.08,vignette=angle=PI/7" \
  -c:v libx264 -crf 16 -preset slow -g 15 -pix_fmt yuv420p \
  -af "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=7" \
  -ar 48000 -c:a aac -b:a 192k public/graded.mp4
