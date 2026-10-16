"""Soundtrack + SFX for the "BubblePop" video (The Bubble Gets Too Big).

Run: python3 scripts/make-audio-bubblepop.py
  -> public/bubblepop-music.mp3, public/bubblepop-sfx.mp3
All timings are global video frames (30 fps); key hits sit on the 120 BPM grid.
"""
import numpy as np

from synth import *  # noqa: F401,F403

LENGTH = 450 / FPS
POP = 120  # bubble bursts, beat drops
END = 435  # final pop, music stops
f = lambda frame: frame / FPS  # noqa: E731


def lowpass(sig, a):
    out = np.zeros_like(sig)
    for i in range(1, len(sig)):
        out[i] = out[i - 1] + a * (sig[i] - out[i - 1])
    return out


def sweep(f0, f1, dur, vol=0.3, vibrato=0.0, vib_rate=7):
    t = t_arr(dur)
    freq = np.geomspace(f0, f1, len(t)) * (1 + vibrato * np.sin(2 * np.pi * vib_rate * t))
    return vol * np.sin(2 * np.pi * np.cumsum(freq) / SR)


def stretch(dur):
    # rubbery gum stretching: wobbly rising tone with growing tension
    t = t_arr(dur)
    vib = 0.02 + 0.08 * (t / dur)
    sig = sweep(80, 230, dur, 1.0, 0, 1)
    sig = sig * (1 + vib * np.sin(2 * np.pi * (5 + 9 * t / dur) * t))
    sig += 0.35 * sweep(160, 460, dur, 1.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t))
    shape = np.minimum(t / 0.3, 1) * (0.25 + 0.75 * t / dur)
    return 0.35 * sig * shape


def crash(vol=0.3):
    t = t_arr(1.2)
    n = np.diff(rng.uniform(-1, 1, len(t)), prepend=0)
    return vol * n * np.exp(-t / 0.35)


def chomp(vol=0.9):
    t = t_arr(0.25)
    thud = np.sin(2 * np.pi * np.cumsum(70 + 160 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.07)
    crunch = lowpass(rng.uniform(-1, 1, len(t)), 0.35) * np.exp(-t / 0.04)
    return vol * (thud + 0.8 * crunch)


def squelch(vol=0.5):
    t = t_arr(0.5)
    wet = lowpass(rng.uniform(-1, 1, len(t)), 0.08) * 3
    gloop = np.sin(2 * np.pi * np.cumsum(320 * np.exp(-t / 0.12) + 60) / SR)
    return vol * (0.6 * wet + gloop) * np.exp(-t / 0.15) * np.minimum(t / 0.01, 1)


def splash(vol=0.35):
    t = t_arr(0.9)
    n = lowpass(rng.uniform(-1, 1, len(t)), 0.25)
    return vol * n * np.exp(-t / 0.25) * np.minimum(t / 0.02, 1)


def boing(vol=0.3):
    return sweep(180, 520, 0.35, vol, vibrato=0.06, vib_rate=18) * env(0.35, 0.01, 0.2)


# ---------------- music (starts on the pop) ----------------
music = np.zeros(int(LENGTH * SR) + SR)
chords = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
melody = [
    (0, 76), (0.5, 79), (1, 81), (1.5, 79), (2, 76), (3, 74), (3.5, 76),
    (4, 74), (4.5, 71), (5, 74), (5.5, 76), (6, 79), (6.5, 77), (7, 76), (7.5, 74),
]
start, stop = f(POP), f(END)
add(music, crash(0.35), start)
bar = 0
while start + bar * 4 * BEAT < stop:
    t0 = start + bar * 4 * BEAT
    root, tones = chords[bar % 4]
    add(music, pad(tones, 4 * BEAT, 0.06), t0)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb >= stop:
            break
        add(music, kick(0.8), tb)
        if b in (1, 3):
            add(music, clap(0.3), tb)
        add(music, bass(root), tb)
        add(music, bass(root + 12, vol=0.2), tb + BEAT / 2)
        for h in range(4):
            add(music, hat(0.05 if h % 2 else 0.08), tb + h * BEAT / 4)
    off = 4 if bar % 2 else 0
    for beat, m in melody:
        if off <= beat < off + 4 and t0 + (beat - off) * BEAT < stop:
            add(music, pluck(m, vol=0.17), t0 + (beat - off) * BEAT)
    bar += 1
music[int(stop * SR):] = 0  # hard stop on the final pop

# ---------------- sfx ----------------
sfx = np.zeros_like(music)
add(sfx, stretch(f(106)), 0)  # bubble inflating, then silence before the pop
add(sfx, pluck(84, 0.12, 0.25), f(55))  # eyes open
add(sfx, pluck(91, 0.08, 0.15), f(79))  # blink
add(sfx, sweep(500, 900, 0.18, 0.15) * env(0.18, 0.01, 0.1), f(68))  # smile squeak
add(sfx, pluck(72, 0.25, 0.3), f(95))  # "uh..."
add(sfx, pluck(67, 0.35, 0.3), f(101))  # "...oh"

add(sfx, pop(0.55, 1.0), f(POP))
add(sfx, boum(1.0), f(POP))
add(sfx, whoosh(0.4, 0.3), f(POP))
add(sfx, boing(), f(138))  # mascot pops up
add(sfx, whoosh(0.4, 0.25), f(156))  # iris flood

for scene_start, b in ((160, 50), (277, 38)):  # Pasteque, Fraise
    bite = scene_start + b
    add(sfx, sweep(300, 900, 0.4, 0.12) * env(0.4, 0.3, 0.2), f(bite - 14))  # wind-up
    add(sfx, chomp(), f(bite))
    add(sfx, squelch(), f(bite + 1))
    add(sfx, splash(), f(bite + 2))
    add(sfx, pop(0.8, 0.4), f(bite + 6))  # title slam
    add(sfx, boum(0.5), f(bite + 45))  # pack lands

add(sfx, whoosh(0.3, 0.3), f(274))  # whip-pan
add(sfx, whoosh(0.3, 0.25), f(365))
add(sfx, boum(0.5), f(390))  # packs land
add(sfx, boum(0.4), f(394))
add(sfx, boing(0.25), f(384))  # mascot pops in
add(sfx, pop(0.9, 0.4), f(400))  # CTA slam
add(sfx, pluck(96, 0.3, 0.25) + 0, f(402))  # wink "ding"
add(sfx, pluck(103, 0.3, 0.15), f(403.5))
add(sfx, stretch(f(18)) * 0.6, f(416))  # last bubble
add(sfx, pop(0.7, 1.0), f(END))
add(sfx, boum(1.0), f(END))
add(sfx, crash(0.3), f(END))

write_mp3(music, "bubblepop-music", LENGTH)
write_mp3(sfx, "bubblepop-sfx", LENGTH)
print("wrote bubblepop-music.mp3, bubblepop-sfx.mp3")
