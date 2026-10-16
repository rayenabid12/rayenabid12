"""Synthesizes the original music bed and sound effects for the promo.

Run: python3 scripts/make-audio.py  -> writes public/music.mp3 and public/sfx.mp3
Timings are in video frames (30 fps) and match the scene animations.
"""
import numpy as np

from synth import *  # noqa: F401,F403

LENGTH = 405 / FPS  # matches BoumBoumPromo durationInFrames

# ---------------- music ----------------
music = np.zeros(int(LENGTH * SR) + SR)

# C - G - Am - F, one bar each, root notes and chord tones
chords = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
melody = [  # (beat offset inside 2-bar phrase, midi)
    (0, 76), (0.5, 79), (1, 76), (1.5, 74), (2, 72), (3, 74), (3.5, 76),
    (4, 74), (4.5, 71), (5, 74), (6, 79), (6.5, 77), (7, 76), (7.5, 74),
]

# intro: rising bubbly arpeggio before the beat drops
for i, m in enumerate([60, 64, 67, 72, 76, 79]):
    add(music, pluck(m, vol=0.14), i * BEAT / 4)

start = BEAT * 1.5
bars = int((LENGTH - start) / (4 * BEAT)) + 1
for bar in range(bars):
    t0 = start + bar * 4 * BEAT
    root, tones = chords[bar % 4]
    add(music, pad(tones, 4 * BEAT), t0)
    for b in range(4):
        tb = t0 + b * BEAT
        add(music, kick(), tb)
        if b in (1, 3):
            add(music, clap(), tb)
        add(music, bass(root), tb)
        add(music, bass(root + 12, vol=0.2), tb + BEAT / 2)
        for h in range(2):
            add(music, hat(), tb + h * BEAT / 2 + BEAT / 2 * 0.5)
    phrase_offset = 4 if bar % 2 else 0
    for beat, m in melody:
        if phrase_offset <= beat < phrase_offset + 4:
            add(music, pluck(m), t0 + (beat - phrase_offset) * BEAT)

# fade in/out
t = np.arange(len(music)) / SR
music *= np.clip(t / 0.05, 0, 1) * np.clip((LENGTH - t) / 1.2, 0, 1)

# ---------------- sfx ----------------
sfx = np.zeros_like(music)
f = lambda frame: frame / FPS  # noqa: E731

# Intro: "BOUM BOUM" letters pop (Logo delay 9 + 0.3s, then every 3 frames)
for i in range(8):
    add(sfx, pop(1 + i * 0.08), f(18 + i * 3))
add(sfx, boum(), f(52))  # heartbeat pulse 1
add(sfx, boum(), f(61))  # heartbeat pulse 2

for scene_start in (75, 180):  # Pasteque, Fraise
    add(sfx, whoosh(), f(scene_start - 6))
    add(sfx, pop(0.8, 0.4), f(scene_start + 14))  # title lands
    add(sfx, whoosh(0.35, 0.18), f(scene_start + 18))  # hero slides in
    add(sfx, pop(1.2, 0.3), f(scene_start + 45))  # pack bounces up

add(sfx, whoosh(), f(285 - 6))  # outro
add(sfx, pop(0.9), f(285 + 30))
add(sfx, pop(1.1), f(285 + 36))
add(sfx, pop(1.4, 0.3), f(285 + 48))  # badge
add(sfx, boum(), f(285 + 60))  # "Fais BOUM !"
add(sfx, boum(0.7), f(285 + 87))


write_mp3(music, "music", LENGTH)
write_mp3(sfx, "sfx", LENGTH)
print("wrote music.mp3, sfx.mp3")
