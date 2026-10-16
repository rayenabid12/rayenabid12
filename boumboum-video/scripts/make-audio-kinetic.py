"""Minimal sound design for the "KineticType" video (no music).

Run: python3 scripts/make-audio-kinetic.py -> public/kinetic-sfx.mp3
Soft low pulse on every beat, clean thumps on cuts, wrapper crinkles on
product reveals and a deep "boum" on the BOUM moments. Global frames, 30 fps.
"""
import numpy as np

from synth import *  # noqa: F401,F403

LENGTH = 450 / FPS
f = lambda frame: frame / FPS  # noqa: E731


def lowpass(sig, a):
    out = np.zeros_like(sig)
    for i in range(1, len(sig)):
        out[i] = out[i - 1] + a * (sig[i] - out[i - 1])
    return out


def thump(vol=0.5, pitch=1.0):
    # soft, rounded low hit
    t = t_arr(0.35)
    freq = (55 + 70 * np.exp(-t / 0.03)) * pitch
    return vol * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.11)


def tick(vol=0.12, freq=2400):
    t = t_arr(0.04)
    return vol * np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.006)


def crinkle(dur=0.45, vol=0.22):
    # candy wrapper: a cluster of tiny bright clicks
    out = np.zeros(int(dur * SR))
    for _ in range(int(140 * dur)):
        at = int(rng.uniform(0, dur * 0.9) * SR)
        n = int(rng.uniform(0.002, 0.008) * SR)
        click = np.diff(rng.uniform(-1, 1, n + 1)) * np.exp(-np.arange(n) / (n / 3))
        out[at : at + n] += click[: len(out) - at] * rng.uniform(0.3, 1)
    shape = np.sin(np.pi * np.arange(len(out)) / len(out)) ** 0.5
    return vol * out * shape


def swish(dur=0.18, vol=0.12):
    t = t_arr(dur)
    n = lowpass(np.diff(rng.uniform(-1, 1, len(t) + 1)), 0.5)
    return vol * n * np.sin(np.pi * t / dur) ** 2


sfx = np.zeros(int(LENGTH * SR) + SR)

# quiet pulse that keeps time underneath everything
for beat in range(0, 450, 15):
    add(sfx, thump(0.12, 0.9), f(beat))

# words: one hit per beat, the third lands as BOUM
add(sfx, thump(0.45) + 0, f(0))
add(sfx, tick(), f(0))
add(sfx, thump(0.45, 1.1), f(15))
add(sfx, tick(), f(15))
add(sfx, boum(0.8), f(30))

# BOUM BOUM pull-back: rising air, lands on the beat
add(sfx, swish(0.9, 0.18), f(48))
add(sfx, thump(0.55), f(75))
add(sfx, crinkle(0.3, 0.15), f(75))

for start in (90, 210):  # flavor posters
    for i in range(3 if start == 90 else 2):
        add(sfx, swish(0.16, 0.14), f(start + i * 4))
    add(sfx, crinkle(), f(start + 15))
    add(sfx, thump(0.5), f(start + 75))  # cut to pack hold
    add(sfx, crinkle(0.35, 0.18), f(start + 75))
    add(sfx, tick(0.1, 1800), f(start + 80))  # title reveal

# montage: eighth-note cuts, rising
for i, at in enumerate((330, 338, 345, 353)):
    add(sfx, thump(0.4, 1 + i * 0.12), f(at))
    add(sfx, tick(0.09, 2000 + i * 300), f(at))
add(sfx, boum(0.7), f(360))
add(sfx, boum(0.7), f(368))

# end card
add(sfx, boum(0.9), f(375))
add(sfx, crinkle(0.5, 0.2), f(383))
add(sfx, tick(0.1), f(379))

write_mp3(sfx, "kinetic-sfx", LENGTH)
print("wrote kinetic-sfx.mp3")
