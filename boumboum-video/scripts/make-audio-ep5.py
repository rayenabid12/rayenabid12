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
# 4. curious exploration: light pizzicato in C
for b in range(int((504 - 452) / 15)):
    tb = f(452) + b * BEAT
    add(music, ks([48, 55, 52, 55][b % 4], 0.2, 0.18, bright=0.6, decay=0.98), tb)
    add(music, glock([79, 84, 81, 79][b % 4], 0.3, 0.08), tb + BEAT / 2)
# 5. the chase: industrial rhythm (D minor), builds to the fall
prog = [([50, 53, 57], 38), ([46, 50, 53], 34), ([48, 52, 55], 36), ([45, 49, 52], 33)]
t0 = f(506)
beats = int((884 - 506) / 15)
for b in range(beats):
    tb = t0 + b * BEAT
    chord, root = prog[(b // 4) % 4]
    add(music, ks(root, 0.25, 0.3, bright=0.5, decay=0.98), tb)
    add(music, ks(root + 12, 0.15, 0.14, bright=0.6, decay=0.97), tb + BEAT / 2)
    add(music, kick(0.35), tb)
    if b % 2:
        add(music, clap(0.12), tb)
    add(music, hat(0.05), tb + BEAT / 2)
    add(music, hat(0.03), tb + BEAT / 4)
    if b % 4 == 0:
        for k, m in enumerate(chord):
            add(music, ks(m + 12, 0.4, 0.05, bright=0.7, decay=0.99), tb + k * 0.02)
# chase melody (staccato glock)
chase = [(0, 74), (0.5, 77), (1, 81), (1.5, 77), (2, 74), (3, 72), (4, 74), (4.5, 77), (5, 81), (5.5, 84), (6, 81), (7, 77)]
for rep in range(0, beats, 8):
    for beat, m in chase:
        if rep + beat < beats:
            add(music, glock(m, 0.25, 0.07), t0 + (rep + beat) * BEAT)
# 6. the fall: everything stops, a falling whistle (sfx), silence...
# 7. the flight: soaring theme in C (slow, wide)
fly = [(0, 72, 2), (2, 76, 1), (3, 79, 1), (4, 84, 3), (7, 83, 1), (8, 81, 2), (10, 79, 2), (12, 77, 1), (13, 79, 1), (14, 84, 2), (16, 88, 4)]
t1 = f(918)
for beat, m, ln in fly:
    add(music, glock(m, 0.8 + ln * 0.4, 0.13), t1 + beat * 0.36)
    add(music, ks(m - 12, 0.6 + ln * 0.3, 0.08, bright=0.5, decay=0.996), t1 + beat * 0.36)
for k, (chord, root) in enumerate([(C, 48), (Am, 45), (F, 41), (G, 43), (C, 48), (F, 41), (G, 43), (C, 48)]):
    tb = t1 + k * 1.44
    strings(chord, tb, 1.6, 0.06)
    add(music, ks(root - 12, 1.4, 0.2, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum(chord, tb + h * 0.36, music, 0.05, down=h % 2 == 0)
# 8. the print: suspense roll, then triumph
for k in range(20):
    add(music, snap(0.04 + k * 0.005), f(1145) + k * 0.066)
for k, m in enumerate([60, 64, 67, 72, 76, 79, 84]):
    add(music, glock(m + 12, 1.0, 0.14), f(1188) + k * 0.05)
add(music, crash(0.18), f(1188))
# the happy series theme to the end
melody = [(0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1), (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1)]
t2 = f(1200)
for b in range(int((TOTAL - 30 - 1200) / 15)):
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
for at in (458, 477):
    add(sfx, boing(0.1, 260, 420), f(at + 5))
    add(sfx, bloop(0.15), f(at + 15))
add(sfx, bloop(0.25), f(499))  # poke the gum
giggle(f(502), 0.08)
clank(f(506), 0.5)
add(sfx, crash(0.15), f(506))
add(sfx, slide_whistle(500, 1500, 0.25, 0.12), f(507))
for k in range(10):  # running on the belt
    add(sfx, pop(1.6 + (k % 2) * 0.3, 0.08), f(520 + k * 4))
for sl in (610, 650, 690, 730):
    hiss(f(sl - 6), 0.2, 0.05)
    slam(f(sl))
add(sfx, splat(0.5), f(611))  # the gum gets flattened
add(sfx, gulp(0.35), f(628))
add(sfx, boing(0.14, 250, 520), f(657))
add(sfx, whoosh(0.4, 0.14), f(736))  # wrapper sheet
add(sfx, crinkle(0.9, 0.25), f(748))
add(sfx, crinkle(0.4, 0.3), f(778))
add(sfx, pop(1.0, 0.5), f(778))
add(sfx, slide_whistle(500, 1500, 0.25, 0.12), f(828))
for k in range(8):
    add(sfx, pop(1.6 + (k % 2) * 0.3, 0.08), f(838 + k * 4))
add(sfx, boing(0.14, 400, 150), f(870))
add(sfx, slide_whistle(1500, 250, 0.75, 0.16), f(884))  # falling
add(sfx, glock(96, 0.4, 0.14), f(905))  # the idea
add(sfx, stretch(0.8, 0.22), f(906))
add(sfx, whoosh(2.0, 0.06), f(930))
add(sfx, whoosh(2.0, 0.05), f(1000))
add(sfx, boing(0.12, 300, 180), f(1120))
add(sfx, pop(1.0, 0.4), f(1124))
clank(f(1130), 0.2)
for k in range(12):  # printer
    add(sfx, pop(2.2 + (k % 2) * 0.4, 0.07), f(1145) + k * 0.11)
sparkle(f(1188), sfx, 0.12)
add(sfx, slide_whistle(500, 1300, 0.25, 0.12), f(1188))
add(sfx, boing(0.14, 220, 520), f(1228))
add(sfx, bloop(0.25), f(1240))
add(sfx, glock(96, 0.3, 0.12), f(1248))  # wink "ting"
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
