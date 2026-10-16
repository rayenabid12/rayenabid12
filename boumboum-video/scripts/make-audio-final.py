"""Music + SFX for the final cut "BoumFinal" (rig v2, continuous camera).

Run: python3 scripts/make-audio-final.py -> public/final-music.mp3, public/final-sfx.mp3
Global frames at 30 fps; 120 BPM (one beat = 15 frames).
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

LENGTH = 600 / FPS
f = lambda frame: frame / FPS  # noqa: E731

# ---------------- music ----------------
music = np.zeros(int(LENGTH * SR) + SR)
C, Am, F, G = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71]
prog = [(C, 48), (Am, 45), (F, 41), (G, 43)]
melody = [
    (0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1),
    (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1),
    (8, 77, 0.5), (8.5, 81, 0.5), (9, 84, 1), (10, 81, 0.5), (10.5, 77, 0.5), (11, 74, 1),
    (12, 79, 0.5), (12.5, 77, 0.5), (13, 76, 0.5), (13.5, 74, 0.5), (14, 72, 2),
]


def section(start_frame, end_frame, full=True, melody_on=True):
    t0 = f(start_frame)
    beats = int((end_frame - start_frame) / 15)
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = prog[(b // 4) % 4]
        if b % 2 == 0:
            add(music, ks(root - 12 + (7 if b % 4 == 2 else 0), 0.6, 0.3, bright=0.3, decay=0.995), tb)
        strum(chord, tb + BEAT / 2, music, 0.1 if full else 0.06, down=b % 2 == 0)
        if full:
            if b % 2 == 0:
                add(music, kick(0.35), tb)
            else:
                add(music, snap(), tb)
            for h in range(2):
                add(music, shaker(), tb + h * BEAT / 2)
    if melody_on:
        for beat, m, ln in melody:
            for rep in range(0, beats, 16):
                if rep + beat < beats:
                    add(music, glock(m, 0.6 + ln * 0.3), t0 + (rep + beat) * BEAT)


section(0, 195, full=True)
section(195, 270, full=False, melody_on=False)
section(345, 570, full=True)
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(570) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(570))
add(music, glock(88, 1.2, 0.16), f(577))
add(music, glock(91, 1.4, 0.16), f(584))
add(music, kick(0.4), f(570))

# ---------------- sfx ----------------
sfx = np.zeros_like(music)
for k, m in enumerate([72, 76, 79, 84]):  # camera tilts down from the sky
    add(sfx, glock(m, 0.5, 0.07), f(2) + k * 0.08)
for at in (18, 34, 50):
    add(sfx, boing(0.16, 220, 480), f(at))
for at in (28, 44, 60):
    add(sfx, bloop(0.28), f(at))
sparkle(f(78), sfx, 0.08)  # hello
sparkle(f(121), sfx, 0.1)  # pack appears
add(sfx, crinkle(0.35, 0.22), f(128))
add(sfx, crinkle(0.2, 0.3), f(141))
add(sfx, whoosh(0.35, 0.2), f(142))
add(sfx, slide_whistle(500, 1300, 0.3), f(150))
add(sfx, slide_whistle(1300, 700, 0.27), f(158))
add(sfx, gulp(), f(166))
for k in range(5):
    add(sfx, chew(), f(172 + k * 6))
sparkle(f(176), sfx, 0.08)  # "Miam !"
add(sfx, chew(), f(190))
add(sfx, chew(), f(194))

# bubble
add(sfx, glock(96, 0.4, 0.12), f(199))  # the idea "ting"
add(sfx, whoosh(0.3, 0.12), f(205))  # deep breath
add(sfx, stretch(f(78), 0.2), f(212))  # blowing, stops before the pop
add(sfx, whoosh(0.9, 0.18), f(235))  # lift-off
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(sfx, glock(m, 0.5, 0.09), f(235) + k * 0.06)
add(sfx, glock(70, 0.4, 0.14), f(274))  # "uh..."
add(sfx, glock(65, 0.5, 0.14), f(280))  # "...oh"
add(sfx, gulp(0.3), f(281))

# BOUM + fall
add(sfx, pop(0.55, 1.0), f(300))
add(sfx, boum(1.0), f(300))
add(sfx, crash(0.25), f(300))
add(sfx, glock(96, 0.15, 0.1), f(309))  # comic blink
add(sfx, slide_whistle(1400, 300, 0.75, 0.16), f(318))

# landing, leap, close-up
add(sfx, splat(), f(345))
add(sfx, boing(0.18), f(346))
add(sfx, bloop(0.2), f(362))


def slurp(vol=0.25):
    t = t_arr(0.45)
    wet = lowpass(rng.uniform(-1, 1, len(t)), 0.15) * 3
    return vol * (0.6 * wet + 0.4 * sweep(300, 700, 0.45, 1.0)) * np.sin(np.pi * t / 0.45)


add(sfx, slurp(0.2), f(364))
add(sfx, boing(0.22, 200, 700), f(386))
add(sfx, splat(0.55), f(407))
for k in range(4):
    add(sfx, pop(1.2 + k * 0.1, 0.12), f(416 + k * 5))
add(sfx, whoosh(0.8, 0.15), f(436))  # dolly-in
add(sfx, glock(76, 0.3, 0.12), f(446))  # "oh!"
add(sfx, slurp(), f(452))
add(sfx, glock(79, 0.5, 0.12), f(474))  # "mmm"
add(sfx, glock(84, 0.6, 0.12), f(478))
sparkle(f(486), sfx, 0.1)  # "A toi !"
add(sfx, slide_whistle(400, 1100, 0.7, 0.13), f(496))
add(sfx, whoosh(0.6, 0.25), f(502))

# finale
add(sfx, whoosh(0.35, 0.18), f(510))
add(sfx, bloop(0.25), f(523))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.16), f(525 + k * 3))
sparkle(f(530), sfx, 0.08)
add(sfx, bloop(0.22), f(522))
add(sfx, stretch(0.7, 0.12), f(549))
add(sfx, pop(0.7, 0.9), f(570))
add(sfx, boum(0.6), f(570))
sparkle(f(574), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.14), f(576))  # wink "ding"

write_mp3(music, "final-music", LENGTH)
write_mp3(sfx, "final-sfx", LENGTH)
print("wrote final-music.mp3, final-sfx.mp3")
