"""Music + SFX for Episode 5 "La Naissance de Boum Boum" (45 s).

Run: python3 scripts/make-audio-ep5.py -> public/ep5-music.mp3, public/ep5-sfx.mp3
Night + rain (music box) -> storm -> machines wake -> heartbeat -> birth chime ->
curious theme -> industrial chase -> the fall -> soaring flight -> the print -> finale.
30 fps, 120 BPM.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1350
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)


def rain(dur, vol=0.05):
    n = rng.uniform(-1, 1, int(dur * SR))
    return vol * (lowpass(n, 0.35) - lowpass(n, 0.04))


def thunder(dur=2.2, vol=0.6):
    t = t_arr(dur)
    n = lowpass(rng.uniform(-1, 1, len(t)), 0.02) * 12
    crack = rng.uniform(-1, 1, len(t)) * np.exp(-t / 0.06)
    return vol * (n * np.exp(-t / 0.9) * (1 + 0.5 * np.sin(2 * np.pi * 3 * t)) + 0.4 * crack)


def hum(dur, vol=0.06):
    t = t_arr(dur)
    return vol * (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 110 * t)) * np.minimum(t / 0.6, 1)


def heartbeat(at, vol=0.5):
    for k, off in enumerate([0, 0.18]):
        t = t_arr(0.2)
        add(sfx, vol * (0.7 if k else 1) * np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.05), at + off)


def clank(at, vol=0.35):
    t = t_arr(0.4)
    sig = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t / d) for fr, d in [(180, 0.15), (443, 0.08), (911, 0.05), (1530, 0.03)])
    add(sfx, vol * sig, at)


def slam(at, vol=0.8):
    t = t_arr(0.5)
    add(sfx, vol * np.sin(2 * np.pi * np.geomspace(90, 35, len(t)) * t) * np.exp(-t / 0.12), at)
    clank(at, 0.25)
    add(sfx, crash(0.12), at)


def hiss(at, dur=0.4, vol=0.06):
    add(sfx, vol * lowpass(rng.uniform(-1, 1, int(dur * SR)), 0.5) * np.linspace(1, 0, int(dur * SR)), at)


def musicbox(notes, at, sb=0.42, vol=0.12):
    for beat, m in notes:
        add(music, glock(m + 12, 1.4, vol), at + beat * sb)


def strings(chord, at, dur, vol=0.05):
    add(music, pad(chord, dur, vol), at)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


C, Am, F, G, Em = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71], [55, 64, 67, 71]

# ---------------------------------------------------------------- music
# 1. the night: a music box over the rain (A minor, slow)
mb = [(0, 69), (1, 72), (2, 76), (3, 74), (4, 72), (5, 71), (6, 69), (8, 64), (9, 69), (10, 72), (11, 71), (12, 69)]
musicbox(mb, f(6))
strings([57, 64, 69], f(6), 3.0, 0.04)
strings([53, 60, 65], f(100), 3.0, 0.04)
# 2. the machines wake up: low pulse
for k in range(int((380 - 230) / 15)):
    add(music, ks(33, 0.4, 0.2, bright=0.4, decay=0.99), f(230) + k * BEAT)
strings([45, 52, 57], f(240), 4.5, 0.05)
# 3. birth: a magical chime + gentle wonder theme
for k, m in enumerate([72, 76, 79, 84, 88, 91]):
    add(music, glock(m, 1.6, 0.12), f(382) + k * 0.06)
strings([60, 64, 67, 72], f(384), 2.4, 0.06)
musicbox([(0, 76), (1, 79), (2, 84), (3, 83), (4, 79), (6, 76), (7, 77), (8, 79)], f(400), 0.3, 0.1)
# ---- the line (v2 timings, must match OriginScene.tsx)
CLANK, STOP, WOW, FILL = 475, 962, 1002, 1014
ALARMS, TRAPS = (606, 710), (612, 716)
SLOT = lambda k: 640 + 260 * k  # noqa: E731
GUMS = [k for k in range(-20, 11) if k not in (0, -4, -10)]
cross = lambda k, x: CLANK + 5 + (x - SLOT(k)) / 10  # noqa: E731
SCANNED = [t for t in (cross(k, 1900) for k in GUMS) if CLANK + 10 < t < STOP]
TASTED = [t for t in (cross(k, 2900) for k in GUMS) if CLANK + 10 < t < STOP - 4]
FILLS = sorted(FILL + ((SLOT(k) + 4860 - 220) / 3180) * 50 for k in GUMS if 230 < SLOT(k) + 4860 < 3360)

# 4. he wants to fit in: a happy little march (C major) while the line runs
for b in range(int((600 - 480) / 15)):
    tb = f(480) + b * BEAT
    chord, root = [(C, 48), (G, 43), (Am, 45), (F, 41)][(b // 2) % 4]
    add(music, ks(root - 12, 0.25, 0.24, bright=0.5, decay=0.98), tb)
    add(music, snap(0.1), tb + BEAT / 2)
    strum(chord, tb + BEAT / 2, music, 0.06, down=b % 2 == 0)
for k, m in enumerate([72, 74, 76, 79, 76, 74, 72, 74, 76, 79, 81, 79, 76, 74, 72, 67]):
    add(music, glock(m, 0.3, 0.08), f(480) + k * BEAT / 2)
# 5. rejected: alarm, then a sad, slow music box in A minor (the low point)
for a in ALARMS:
    for k in range(6):
        add(sfx, sweep(900 if k % 2 == 0 else 650, 900 if k % 2 == 0 else 650, 0.14, 0.16), f(a) + k * 0.14)
musicbox([(0, 69), (1, 72), (2, 71), (3, 69), (4, 64), (6, 65), (7, 64), (8, 62), (9, 64)], f(740), 0.5, 0.11)
strings([57, 60, 64], f(740), 3.5, 0.045)
strings([53, 57, 60], f(800), 3.0, 0.045)
# nervous tick-tock during his second try
for k in range(int((710 - 692) / 4)):
    add(music, snap(0.08), f(692) + k * 4 / FPS)
# 6. the decision: his heart beats stronger, the music turns to major
for k, at in enumerate((862, 874, 884)):
    heartbeat(f(at), 0.35 + k * 0.15)
strings([60, 64, 67, 72], f(888), 2.0, 0.06)
for k, m in enumerate([60, 64, 67, 72]):
    add(music, glock(m + 12, 0.8, 0.1), f(888) + k * 0.08)
# brave climb: rising strums
for b in range(int((962 - 900) / 15)):
    tb = f(900) + b * BEAT
    strum([C, F, G, C][b % 4], tb, music, 0.06 + b * 0.008, down=True)
    add(music, kick(0.2 + b * 0.02), tb)
# 7. the heart bubble: glock roll, then WAOUH fanfare and the soaring theme
for k in range(16):
    add(music, glock(72 + [0, 4, 7, 12][k % 4] + 12 * (k // 8), 0.4, 0.05 + k * 0.004), f(972) + k * 0.06)
for m in [48, 60, 64, 67, 72, 76]:
    add(music, ks(m, 2.0, 0.14, bright=0.6, decay=0.998), f(WOW) + (m - 48) * 0.003)
add(music, crash(0.2), f(WOW))
fly = [(0, 72, 2), (2, 76, 1), (3, 79, 1), (4, 84, 3), (7, 83, 1), (8, 81, 2), (10, 79, 2), (12, 77, 1), (13, 79, 1), (14, 84, 2)]
t1 = f(1010)
for beat, m, ln in fly:
    add(music, glock(m, 0.8 + ln * 0.4, 0.13), t1 + beat * 0.34)
for k, (chord, root) in enumerate([(C, 48), (Am, 45), (F, 41), (G, 43), (C, 48), (F, 41)]):
    tb = t1 + k * 1.36
    strings(chord, tb, 1.5, 0.06)
    add(music, ks(root - 12, 1.3, 0.2, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum(chord, tb + h * 0.34, music, 0.05, down=h % 2 == 0)
# 8. the print: suspense roll, then triumph
for k in range(20):
    add(music, snap(0.04 + k * 0.005), f(1165) + k * 0.066)
for k, m in enumerate([60, 64, 67, 72, 76, 79, 84]):
    add(music, glock(m + 12, 1.0, 0.14), f(1198) + k * 0.05)
add(music, crash(0.18), f(1198))
# the happy series theme to the end
melody = [(0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1), (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1)]
t2 = f(1204)
for b in range(int((TOTAL - 30 - 1204) / 15)):
    tb = t2 + b * BEAT
    chord, root = [(C, 48), (Am, 45), (F, 41), (G, 43)][(b // 4) % 4]
    if b % 2 == 0:
        add(music, ks(root - 12, 0.6, 0.28, bright=0.3, decay=0.995), tb)
        add(music, kick(0.3), tb)
    else:
        add(music, snap(0.15), tb)
    strum(chord, tb + BEAT / 2, music, 0.09, down=b % 2 == 0)
    add(music, shaker(0.04), tb + BEAT / 2)
for beat, m, ln in melody:
    add(music, glock(m, 0.6 + ln * 0.3, 0.13), t2 + beat * BEAT)
END_POP = TOTAL - 30
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.4), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, rain(7.6, 0.05), 0)  # rain outside, then on the glass roof
add(sfx, rain(6.0, 0.03), f(228))
add(sfx, thunder(2.0, 0.35), f(52))
add(sfx, glock(96, 0.6, 0.05), f(10))
add(sfx, thunder(2.4, 0.6), f(170))
add(sfx, thunder(2.6, 0.8), f(198))
for k in range(8):  # sparks crackle down the pipe
    add(sfx, pop(2.5 + (k % 3) * 0.4, 0.08), f(202 + k * 3))
add(sfx, hum(14.0, 0.05), f(226))
for k in range(4):
    clank(f(226) + k * 0.12, 0.12)
add(sfx, stretch(1.0, 0.16), f(236))  # the bubble grows
add(sfx, glock(98, 0.5, 0.1), f(268))  # drip forms
add(sfx, bloop(0.3), f(288))  # the drop falls in
add(sfx, slide_whistle(900, 400, 0.4, 0.08), f(300))
add(sfx, boing(0.18, 300, 160), f(312))
for at in (334, 350, 366):
    heartbeat(f(at))
add(sfx, glock(100, 0.5, 0.08), f(350))  # eyes open
add(sfx, pop(0.9, 0.6), f(382))  # BIRTH
sparkle(f(384), sfx, 0.1)
giggle(f(404), 0.06, 91)
add(sfx, glock(98, 0.6, 0.08), f(414))  # he finds his heart
heartbeat(f(416), 0.25)
clank(f(CLANK), 0.5)
add(sfx, crash(0.12), f(CLANK))
for k in range(18):  # happy marching steps
    add(sfx, pop(1.5 + (k % 2) * 0.3, 0.06), f(486 + k * 6))
for t in SCANNED:  # ✓ beeps
    add(sfx, glock(96, 0.25, 0.09), f(t))
for tr in TRAPS:
    clank(f(tr), 0.3)
    add(sfx, slide_whistle(1300, 300, 0.45, 0.14), f(tr + 2))
    add(sfx, pop(0.5, 0.5), f(tr + 15))
    add(sfx, boing(0.12, 300, 150), f(tr + 16))
add(sfx, stretch(0.4, 0.2), f(658))  # squeezes himself square
add(sfx, boing(0.14, 220, 480), f(678))
add(sfx, bloop(0.2), f(692))
for t in TASTED:  # « Bof... »
    add(sfx, sweep(220, 150, 0.35, 0.12) * env(0.35, 0.02, 0.3), f(t + 2))
for at in (907, 927):
    add(sfx, boing(0.12, 240, 500), f(at))
    add(sfx, bloop(0.18), f(at + 13))
clank(f(STOP), 0.25)
add(sfx, stretch(1.0, 0.2), f(970))
for k in range(5):  # meter swings to the max
    add(sfx, glock(88 + k * 3, 0.3, 0.12), f(WOW) + k * 0.05)
sparkle(f(WOW + 2), sfx, 0.12)
for i, t in enumerate(FILLS):  # each gum gets its liquid heart
    add(sfx, bloop(0.12), f(t + 8))
    add(sfx, glock(84 + (i % 8) * 2, 0.3, 0.06), f(t + 10))
add(sfx, whoosh(2.0, 0.05), f(1060))
add(sfx, boing(0.12, 300, 180), f(1150))
add(sfx, pop(1.0, 0.4), f(1154))
clank(f(1158), 0.2)
for k in range(12):  # printer
    add(sfx, pop(2.2 + (k % 2) * 0.4, 0.07), f(1165) + k * 0.11)
sparkle(f(1198), sfx, 0.12)
add(sfx, slide_whistle(500, 1300, 0.25, 0.12), f(1198))
add(sfx, boing(0.14, 220, 520), f(1232))
add(sfx, bloop(0.25), f(1243))
add(sfx, glock(96, 0.3, 0.12), f(1251))  # wink "ting"
# finale (shared beats, offset)
F0 = 1260
add(sfx, whoosh(0.35, 0.18), f(F0))
add(sfx, bloop(0.25), f(F0 + 13))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.16), f(F0 + 15 + k * 3))
sparkle(f(F0 + 20), sfx, 0.08)
add(sfx, stretch(0.7, 0.12), f(F0 + 38))
add(sfx, pop(0.7, 0.9), f(END_POP))
add(sfx, boum(0.6), f(END_POP))
sparkle(f(END_POP + 4), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.14), f(END_POP + 6))
giggle(f(END_POP + 10), 0.07)

write_mp3(music, "ep5-music", LENGTH)
write_mp3(sfx, "ep5-sfx", LENGTH)
print("wrote ep5-music.mp3, ep5-sfx.mp3")
