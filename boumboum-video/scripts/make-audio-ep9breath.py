"""Music + SFX for Episode 9 "Le Souffle de Boum Boum" (43 s).

Run: python3 scripts/make-audio-ep9breath.py -> public/ep9breath-music.mp3, public/ep9breath-sfx.mp3
The same growing tune as Episodes 7 and 8. Building: light and plucky, one
note per block. Anger: the tune breaks into hard, low staccato and a fast
heartbeat. Mélo's slow bubble: the tune, slow and soft. The breaths: a pad that
swells on each "in" and falls on each "out", and the heartbeat slows down each
time. BOUM: the whole tune, happy. The ritual: a two-note "in / out" motif and
the BOUM you can do with your hands.
Frame numbers must match BreathScene.tsx. 30 fps.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1200 + 90 - 8
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

CYCLES = [64, 98, 132, 166, 200]
TADA, WOBBLE, FALL, BONK, ANGRY, FAST, SPLAT, SULK = 236, 242, 262, 278, 290, 334, 352, 392
MELO_GO, TALK, DEMO_IN, DEMO_OUT, DEMO_END = 360, 430, 446, 476, 540
BREATHS = [(576, 600, 636), (640, 664, 700), (704, 728, 790)]
BOUM, REBUILD, SLIP = 800, 880, 1010
SELF = (1024, 1036, 1056)
RITUAL = (1100, 1118, 1146)
RITUAL_BOUM, END = 1150, 1200
END_POP = END - 8 + 60

TUNE = [(0, 72, 1), (1, 74, 1), (2, 76, 2), (4, 74, 1), (5, 76, 1), (6, 79, 2),
        (8, 81, 1), (9, 79, 1), (10, 76, 1), (11, 79, 1), (12, 84, 4)]
C, Am, F, G = [48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]


def tune(at, sb=0.25, vol=0.12, voice="pluck", upto=None, shift=0):
    for beat, m, ln in TUNE[:upto]:
        t = at + beat * sb
        if voice == "glock":
            add(music, glock(m + shift, 0.8 + ln * sb, vol), t)
        else:
            add(music, ks(m + shift, 0.5 + ln * sb, vol * 1.5, bright=0.5, decay=0.996), t)


def heartbeat(at, until, bpm, vol=0.3):
    t = at
    while t < until:
        add(sfx, kick(vol), t)
        add(sfx, kick(vol * 0.6), t + 0.16)
        t += 60 / bpm


# ---------------------------------------------------------------- music
# building: plucky, one rising note per block
tune(f(4), sb=0.22, vol=0.09, upto=6)
add(music, pad(C, 2.0, 0.03), f(4))
for k, s in enumerate(CYCLES):
    add(music, ks(48 + [0, 4, 7, 9, 12][k], 0.6, 0.14, bright=0.4, decay=0.995), f(s + 20 if k < 4 else 222))
    add(music, pad([C, Am, F, G, C][k], 1.1, 0.03), f(s))
add(music, glock(84, 0.8, 0.1), f(TADA))
# the wobble: suspense, then nothing
for k in range(5):
    add(music, glock(79 - k, 0.15, 0.06), f(WOBBLE + 2) + k * 0.12)
# anger: low staccato, out of key
for k in range(14):
    add(music, ks([36, 37, 36, 42][k % 4], 0.12, 0.2, bright=0.7, decay=0.97), f(ANGRY) + k * 0.15)
add(music, pad([36, 42, 48], 2.2, 0.04), f(ANGRY))
# sulking: a sad bit of the tune
tune(f(SULK + 6), sb=0.4, vol=0.06, upto=4, shift=-12)
# Mélo's slow bubble: the tune, slow and soft
tune(f(DEMO_OUT), sb=0.32, vol=0.08, voice="glock", upto=7)
add(music, pad(F, 2.2, 0.03), f(DEMO_OUT))
# the breaths: a pad that swells in, falls out, a little brighter each time
for k, (a, p, e) in enumerate(BREATHS):
    chord = [Am, F, C][k]
    add(music, pad(chord, f(p - a) + 0.3, 0.025 + 0.012 * k), f(a))
    add(music, pad([m + 12 for m in chord], f(e - p) + 0.3, 0.02 + 0.01 * k), f(p))
    for j, m in enumerate([67, 72, 76][: k + 1]):
        add(music, glock(m, 1.2, 0.06), f(e) - 0.2 + j * 0.12)
# BOUM: the whole tune, happy
for k, (ch, root) in enumerate([(C, 36), (Am, 33), (F, 29), (G, 31)]):
    tb = f(BOUM + 2) + k * 0.92
    add(music, pad(ch, 1.0, 0.045), tb)
    add(music, ks(root, 0.9, 0.18, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum([m + 12 for m in ch], tb + h * 0.23, music, 0.035, down=h % 2 == 0)
tune(f(BOUM + 2), sb=0.23, vol=0.12)
tune(f(BOUM + 2), sb=0.23, vol=0.06, voice="glock", shift=12)
# rebuilding: light walking bass, one note per block
for k in range(6):
    add(music, ks(60 + [0, 2, 4, 5, 7, 12][k], 0.5, 0.12, bright=0.5, decay=0.995), f(REBUILD + 4 + k * 18 + 14))
for b in range(int((f(SLIP) - f(REBUILD)) / 0.46)):
    add(music, ks([36, 43, 41, 43][b % 4], 0.4, 0.14, bright=0.3, decay=0.995), f(REBUILD) + b * 0.46)
# he breathes on his own
add(music, pad(F, 1.2, 0.03), f(SELF[0]))
add(music, pad(C, 1.2, 0.035), f(SELF[1]))
tune(f(1060), sb=0.2, vol=0.08, upto=7)
# the ritual: in (rising) / out (falling) / BOUM
add(music, sweep(330, 520, f(RITUAL[1] - RITUAL[0]), 0.04), f(RITUAL[0]))
add(music, sweep(520, 330, f(RITUAL[2] - RITUAL[1]), 0.04), f(RITUAL[1]))
add(music, pad(C, 1.6, 0.04), f(RITUAL[0]))
tune(f(RITUAL_BOUM + 2), sb=0.2, vol=0.11)
chord_hits = [(C, 36), (F, 29), (G, 31)]
for k, (ch, root) in enumerate(chord_hits):
    add(music, pad(ch, 0.8, 0.045), f(RITUAL_BOUM + 2) + k * 0.6)
    add(music, ks(root, 0.6, 0.18, bright=0.3, decay=0.997), f(RITUAL_BOUM + 2) + k * 0.6)
# finale
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.35), f(END_POP))

# ---------------------------------------------------------------- sfx
for k, s in enumerate(CYCLES):  # each block: pick up, then "clac" on top
    add(sfx, crinkle(0.08, 0.05), f(s + 8))
    add(sfx, pop(0.9 + k * 0.08, 0.12), f(s + 26 if k < 4 else 228))
add(sfx, boing(0.08, 260, 560), f(218))
for k in range(6):  # wobble creaks
    add(sfx, sweep(300 + k * 20, 260, 0.12, 0.03), f(WOBBLE + 2) + k * 0.12)
for k in range(6):  # the crash
    add(sfx, pop(0.6 + (k % 3) * 0.15, 0.2), f(FALL + 12 + k * 2.5))
add(sfx, crash(0.15), f(FALL + 14))
add(sfx, boing(0.12, 500, 180), f(BONK))  # bonk!
heartbeat(f(ANGRY), f(BREATHS[0][0]), 150, 0.22)  # angry heartbeat
for k in range(4):  # steam
    add(sfx, whoosh(0.4, 0.03), f(300) + k * 0.6)
add(sfx, stretch(0.6, 0.1), f(FAST + 2))
add(sfx, splat(0.5), f(SPLAT))
for k in range(3):
    add(sfx, crinkle(0.1, 0.04), f(384) + k * 0.1)  # wiping
for k, s in enumerate([MELO_GO + 6, MELO_GO + 20]):
    add(sfx, boing(0.05, 240, 420), f(s + 4))
add(sfx, stretch(2.0, 0.06), f(DEMO_OUT + 4))  # Mélo's slow bubble
add(sfx, pop(1.6, 0.05), f(DEMO_END + 6))
# the breaths: soft air in, soft air out; the heartbeat slows each time
for k, (a, p, e) in enumerate(BREATHS):
    add(sfx, whoosh(f(p - a), 0.025), f(a))
    add(sfx, whoosh(f(e - p), 0.03), f(p + 2))
    heartbeat(f(a), f(e), [120, 95, 75][k], [0.16, 0.11, 0.07][k])
add(sfx, stretch(2.0, 0.08), f(BREATHS[2][1] + 4))
add(sfx, pop(0.7, 0.6), f(BOUM))
add(sfx, boum(0.5), f(BOUM))
sparkle(f(BOUM + 2), sfx, 0.1)
for k in range(6):  # blocks go back on
    add(sfx, whoosh(0.3, 0.03), f(REBUILD + 4 + k * 18))
    add(sfx, pop(0.9 + k * 0.08, 0.1), f(REBUILD + 4 + k * 18 + 14))
add(sfx, pop(0.8, 0.12), f(SLIP + 12))  # the slip
heartbeat(f(SLIP + 4), f(SELF[0]), 130, 0.1)
add(sfx, whoosh(f(SELF[1] - SELF[0]), 0.025), f(SELF[0]))
add(sfx, whoosh(f(SELF[2] - SELF[1]), 0.03), f(SELF[1] + 2))
add(sfx, pop(1.1, 0.12), f(1074))
sparkle(f(1078), sfx, 0.06)
add(sfx, whoosh(f(RITUAL[1] - RITUAL[0]), 0.03), f(RITUAL[0]))
add(sfx, whoosh(f(RITUAL[2] - RITUAL[1]), 0.035), f(RITUAL[1] + 2))
add(sfx, pop(0.8, 0.5), f(RITUAL_BOUM))
add(sfx, clap(0.25), f(RITUAL_BOUM))
sparkle(f(RITUAL_BOUM + 2), sfx, 0.08)
# finale
F0 = END - 8
add(sfx, whoosh(0.35, 0.16), f(F0 + 4))
add(sfx, bloop(0.22), f(F0 + 17))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.14), f(F0 + 19 + k * 3))
sparkle(f(F0 + 24), sfx, 0.08)
add(sfx, stretch(0.7, 0.12), f(F0 + 42))
add(sfx, pop(0.7, 0.8), f(END_POP))
add(sfx, boum(0.5), f(END_POP))
sparkle(f(END_POP + 4), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.12), f(END_POP + 6))

write_mp3(music, "ep9breath-music", LENGTH)
write_mp3(sfx, "ep9breath-sfx", LENGTH)
print("wrote ep9breath-music.mp3, ep9breath-sfx.mp3")
