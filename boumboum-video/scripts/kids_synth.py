"""Kid-friendly instruments and cartoon SFX shared by the story audio scripts."""
import numpy as np

from synth import *  # noqa: F401,F403


def lowpass(sig, a):
    out = np.zeros_like(sig)
    for i in range(1, len(sig)):
        out[i] = out[i - 1] + a * (sig[i] - out[i - 1])
    return out


def ks(midi, dur=0.9, vol=0.25, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string, computed block by block."""
    freq = note_hz(midi)
    n = max(2, int(SR / freq))
    total = int(dur * SR)
    out = np.zeros(total + n + 1)
    noise = rng.uniform(-1, 1, n)
    out[:n] = lowpass(noise, bright)
    i = n
    while i < total + n:
        end = min(i + n, total + n)
        prev = out[i - n : end - n]
        prev2 = out[i - n + 1 : end - n + 1]
        out[i:end] = decay * 0.5 * (prev + prev2)
        i = end
    sig = out[:total]
    fade = np.minimum(1, (total - np.arange(total)) / (0.05 * SR))
    return vol * sig / (np.abs(sig).max() + 1e-9) * fade


def glock(midi, dur=0.9, vol=0.16):
    t = t_arr(dur)
    fr = note_hz(midi)
    sig = (np.sin(2 * np.pi * fr * t) * np.exp(-t / 0.5)
           + 0.35 * np.sin(2 * np.pi * fr * 2.76 * t) * np.exp(-t / 0.12)
           + 0.15 * np.sin(2 * np.pi * fr * 5.4 * t) * np.exp(-t / 0.05))
    return vol * sig * np.minimum(t / 0.002, 1)


def strum(midis, at, buf, vol=0.12, down=True):
    order = midis if down else midis[::-1]
    for k, m in enumerate(order):
        add(buf, ks(m, 0.7, vol, bright=0.6, decay=0.993), at + k * 0.012)


def shaker(vol=0.05):
    t = t_arr(0.07)
    return vol * np.diff(rng.uniform(-1, 1, len(t) + 1)) * np.sin(np.pi * t / 0.07)


def snap(vol=0.18):
    t = t_arr(0.08)
    return vol * np.diff(rng.uniform(-1, 1, len(t) + 1)) * np.exp(-t / 0.012)


def sweep(f0, f1, dur, vol=0.3, vibrato=0.0, rate=7):
    t = t_arr(dur)
    fr = np.geomspace(f0, f1, len(t)) * (1 + vibrato * np.sin(2 * np.pi * rate * t))
    return vol * np.sin(2 * np.pi * np.cumsum(fr) / SR)


def slide_whistle(f0, f1, dur, vol=0.18):
    sig = sweep(f0, f1, dur, vol, vibrato=0.012, rate=6)
    t = t_arr(dur)
    return sig * np.minimum(t / 0.03, 1) * np.minimum((dur - t) / 0.05, 1)


def bloop(vol=0.3):
    return sweep(520, 180, 0.14, vol) * env(0.14, 0.004, 0.08)


def boing(vol=0.25, lo=160, hi=520):
    return sweep(lo, hi, 0.4, vol, vibrato=0.08, rate=20) * env(0.4, 0.005, 0.22)


def crinkle(dur=0.4, vol=0.25):
    out = np.zeros(int(dur * SR))
    for _ in range(int(160 * dur)):
        at = int(rng.uniform(0, dur * 0.9) * SR)
        n = int(rng.uniform(0.002, 0.008) * SR)
        c = np.diff(rng.uniform(-1, 1, n + 1)) * np.exp(-np.arange(n) / (n / 3))
        out[at : at + n] += c[: len(out) - at] * rng.uniform(0.3, 1)
    return vol * out


def gulp(vol=0.5):
    t = t_arr(0.22)
    return vol * np.sin(2 * np.pi * np.cumsum(260 * np.exp(-t / 0.08) + 70) / SR) * env(0.22, 0.01, 0.1)


def chew(vol=0.18):
    t = t_arr(0.09)
    wet = lowpass(rng.uniform(-1, 1, len(t)), 0.12) * 3
    return vol * (wet + 0.5 * np.sin(2 * np.pi * 140 * t)) * np.exp(-t / 0.03)


def splat(vol=0.6):
    t = t_arr(0.6)
    wet = lowpass(rng.uniform(-1, 1, len(t)), 0.1) * 3
    body = np.sin(2 * np.pi * np.cumsum(300 * np.exp(-t / 0.1) + 55) / SR)
    return vol * (0.7 * wet + body) * np.exp(-t / 0.16) * np.minimum(t / 0.004, 1)


def stretch(dur, vol=0.22):
    t = t_arr(dur)
    sig = sweep(140, 420, dur, 1.0, vibrato=0.03, rate=9) * (1 + 0.4 * np.sin(2 * np.pi * 13 * t))
    return vol * sig * np.minimum(t / 0.2, 1) * (0.4 + 0.6 * t / dur)


def crash(vol=0.25):
    t = t_arr(1.4)
    return vol * np.diff(rng.uniform(-1, 1, len(t) + 1)) * np.exp(-t / 0.4)


def sparkle(at, buf, vol=0.1):
    for k, m in enumerate([84, 88, 91, 96]):
        add(buf, glock(m, 0.5, vol), at + k * 0.045)
