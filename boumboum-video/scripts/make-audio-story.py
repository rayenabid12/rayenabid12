"""Music + cartoon SFX for the "BoumStory" kids' film (Le plus gros BOUM).

Run: python3 scripts/make-audio-story.py -> public/story-music.mp3, public/story-sfx.mp3
Ukulele is a Karplus-Strong plucked string, so it sounds organic rather than chiptune.
Global frames at 30 fps; 120 BPM, one beat = 15 frames.
"""
import numpy as np

from synth import *  # noqa: F401,F403

LENGTH = 540 / FPS
f = lambda frame: frame / FPS  # noqa: E731


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


# ---------------- music ----------------
music = np.zeros(int(LENGTH * SR) + SR)
C, Am, F, G = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71]
prog = [(C, 48), (Am, 45), (F, 41), (G, 43)]
melody = [  # (beat in 4-bar phrase, midi, length)
    (0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1),
    (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1),
    (8, 77, 0.5), (8.5, 81, 0.5), (9, 84, 1), (10, 81, 0.5), (10.5, 77, 0.5), (11, 74, 1),
    (12, 79, 0.5), (12.5, 77, 0.5), (13, 76, 0.5), (13.5, 74, 0.5), (14, 72, 2),
]


def play_section(start_frame, end_frame, full=True, melody_on=True):
    t0 = f(start_frame)
    beats = int((end_frame - start_frame) / 15)
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = prog[(b // 4) % 4]
        if b % 2 == 0:
            add(music, ks(root - 12 + (7 if b % 4 == 2 else 0), 0.6, 0.3, bright=0.3, decay=0.995), tb)
        strum(chord, tb + BEAT / 2, music, 0.1 if full else 0.07, down=b % 2 == 0)
        if full:
            add(music, kick(0.35), tb) if b % 2 == 0 else add(music, snap(), tb)
            for h in range(2):
                add(music, shaker(), tb + h * BEAT / 2)
    if melody_on:
        for beat, m, ln in melody:
            for rep in range(0, beats, 16):
                if rep + beat < beats:
                    add(music, glock(m, 0.6 + ln * 0.3), t0 + (rep + beat) * BEAT)


play_section(0, 180, full=True)
play_section(180, 270, full=False, melody_on=False)
play_section(345, 510, full=True)
# ta-da ending on the final pop
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(510) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(510))
add(music, glock(88, 1.2, 0.16), f(517))
add(music, glock(91, 1.4, 0.16), f(524))
add(music, kick(0.4), f(510))

# ---------------- sfx ----------------
sfx = np.zeros_like(music)
for at in (0, 14, 28):
    add(sfx, boing(0.16, 220, 480), f(at))
for at in (14, 28, 42):
    add(sfx, bloop(0.28), f(at))
sparkle(f(45), sfx, 0.08)  # hello!
sparkle(f(77), sfx, 0.1)  # pack appears
add(sfx, crinkle(0.4, 0.22), f(90))
add(sfx, crinkle(0.2, 0.3) + 0, f(102))
add(sfx, whoosh(0.35, 0.2), f(103))
add(sfx, slide_whistle(500, 1300, 0.42), f(110))
add(sfx, slide_whistle(1300, 700, 0.4), f(123))
add(sfx, gulp(), f(135))
for k in range(6):
    add(sfx, chew(), f(139 + k * 7.5))
sparkle(f(148), sfx, 0.08)  # "Miam !"

add(sfx, stretch(f(108), 0.2), f(186))  # blowing the bubble
add(sfx, whoosh(0.9, 0.18), f(222))  # lift-off
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(sfx, glock(m, 0.5, 0.09), f(222) + k * 0.06)
add(sfx, glock(70, 0.4, 0.14), f(250))  # "uh..."
add(sfx, glock(65, 0.5, 0.14), f(256))  # "...oh"

add(sfx, pop(0.55, 1.0), f(300))
add(sfx, boum(1.0), f(300))
add(sfx, crash(0.25), f(300))
add(sfx, glock(96, 0.15, 0.1), f(309))  # blink
add(sfx, slide_whistle(1400, 300, 0.85, 0.16), f(314))  # falling

add(sfx, splat(), f(345))
add(sfx, boing(0.18), f(346))
add(sfx, boing(0.22, 200, 700), f(385))
add(sfx, splat(0.55), f(406))

add(sfx, whoosh(0.35, 0.2), f(448))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.18), f(463 + k * 3))
add(sfx, bloop(0.22), f(470))
add(sfx, bloop(0.22), f(474))
add(sfx, stretch(1.0, 0.12), f(480))
add(sfx, pop(0.7, 0.9), f(510))
add(sfx, boum(0.6), f(510))
sparkle(f(514), sfx, 0.12)

write_mp3(music, "story-music", LENGTH)
write_mp3(sfx, "story-sfx", LENGTH)
print("wrote story-music.mp3, story-sfx.mp3")
