"""Tiny synth toolkit shared by the audio scripts (instruments + helpers)."""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
FPS = 30
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)
PUBLIC = Path(__file__).resolve().parent.parent / "public"


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack=0.005, decay=0.25):
    t = t_arr(dur)
    return np.minimum(t / attack, 1) * np.exp(-t / decay)


def note_hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i : i + len(sig)] += sig


def pluck(midi, dur=0.22, vol=0.18):
    t = t_arr(dur)
    f = note_hz(midi)
    # bright square-ish pluck, softened with a few harmonics
    sig = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 3, 5))
    return vol * sig * env(dur, decay=0.09)


def bass(midi, dur=0.24, vol=0.32):
    t = t_arr(dur)
    f = note_hz(midi)
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return vol * sig * env(dur, decay=0.12)


def pad(midis, dur, vol=0.05):
    t = t_arr(dur)
    sig = sum(np.sin(2 * np.pi * note_hz(m) * t) for m in midis)
    fade = np.minimum(np.minimum(t / 0.05, 1), np.minimum((dur - t) / 0.1, 1))
    return vol * sig * fade


def kick(vol=0.7):
    t = t_arr(0.3)
    freq = 45 + 110 * np.exp(-t / 0.04)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return vol * np.sin(phase) * np.exp(-t / 0.12)


def clap(vol=0.25):
    t = t_arr(0.18)
    return vol * rng.uniform(-1, 1, len(t)) * np.exp(-t / 0.04)


def hat(vol=0.06):
    t = t_arr(0.05)
    n = rng.uniform(-1, 1, len(t))
    n = np.diff(n, prepend=0)  # crude high-pass
    return vol * n * np.exp(-t / 0.015)


def pop(pitch=1.0, vol=0.35):
    # bubble "pop": fast upward pitch blip
    t = t_arr(0.09)
    freq = (500 + 1800 * (t / 0.09)) * pitch
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return vol * np.sin(phase) * np.exp(-t / 0.025)


def boum(vol=0.9):
    t = t_arr(0.6)
    freq = 38 + 90 * np.exp(-t / 0.06)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return vol * np.sin(phase) * np.exp(-t / 0.25)


def whoosh(dur=0.5, vol=0.25):
    t = t_arr(dur)
    n = rng.uniform(-1, 1, len(t))
    # sweep a simple one-pole low-pass cutoff upward
    out = np.zeros_like(n)
    a = np.linspace(0.02, 0.6, len(t))
    for i in range(1, len(n)):
        out[i] = out[i - 1] + a[i] * (n[i] - out[i - 1])
    shape = np.sin(np.pi * t / dur) ** 2
    return vol * out * shape


def write_mp3(sig, name, length):
    sig = sig[: int(length * SR)]
    sig = sig / max(1e-9, np.abs(sig).max()) * 0.89
    wav = PUBLIC / (name + ".wav")
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((sig * 32767).astype(np.int16).tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "192k", str(PUBLIC / (name + ".mp3"))],
        check=True,
    )
    wav.unlink()
