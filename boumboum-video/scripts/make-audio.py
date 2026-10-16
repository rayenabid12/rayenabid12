"""Synthesizes the original music bed and sound effects for the promo.

Run: python3 scripts/make-audio.py  -> writes public/music.mp3 and public/sfx.mp3
Timings are in video frames (30 fps) and match the scene animations.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
FPS = 30
LENGTH = 405 / FPS  # matches BoumBoumPromo durationInFrames
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


def write_mp3(sig, name):
    sig = sig[: int(LENGTH * SR)]
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


write_mp3(music, "music")
write_mp3(sfx, "sfx")
print("wrote music.mp3, sfx.mp3")
