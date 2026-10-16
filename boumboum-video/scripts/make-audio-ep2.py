"""Music + SFX for Episode 2 "Boum-Boo !" (Halloween special).

Run: python3 scripts/make-audio-ep2.py -> public/ep2-music.mp3, public/ep2-sfx.mp3
Spooky-but-fun A minor until the BOUM, then the series' happy C major theme.
Global frames at 30 fps; 120 BPM (one beat = 15 frames).
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

LENGTH = 600 / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)


def pizz(midi, vol=0.18):
    return ks(midi, 0.28, vol, bright=0.55, decay=0.985)


def theremin(m0, m1, dur, vol=0.07):
    t = t_arr(dur)
    freq = np.geomspace(note_hz(m0), note_hz(m1), len(t)) * (1 + 0.025 * np.sin(2 * np.pi * 6 * t))
    sig = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    return vol * sig * np.minimum(t / 0.15, 1) * np.minimum((dur - t) / 0.2, 1)


def creak(dur=0.45, vol=0.18):
    t = t_arr(dur)
    freq = np.geomspace(180, 90, len(t)) * (1 + 0.15 * np.sign(np.sin(2 * np.pi * 28 * t)))
    return vol * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.sin(np.pi * t / dur)


def knock(vol=0.5):
    t = t_arr(0.12)
    return vol * (np.sin(2 * np.pi * 140 * t) + 0.5 * np.sin(2 * np.pi * 310 * t)) * np.exp(-t / 0.025)


def chatter(dur=1.0, vol=0.06):
    out = np.zeros(int(dur * SR))
    for k in range(int(dur * 22)):
        at = int(k / 22 * SR)
        n = int(0.006 * SR)
        out[at : at + n] += np.diff(rng.uniform(-1, 1, n + 1)) * np.exp(-np.arange(n) / 60)
    return vol * out


def flap(vol=0.08):
    t = t_arr(0.08)
    return vol * lowpass(rng.uniform(-1, 1, len(t)), 0.2) * np.sin(np.pi * t / 0.08) * 3


def giggle(at, vol=0.1):
    for k, m in enumerate([88, 91, 88, 93, 89, 95]):
        add(sfx, glock(m, 0.15, vol), at + k * 0.07)


# ---------------- music ----------------
AM, F_, DM, E_ = [57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]
spooky = [(AM, 45), (F_, 41), (DM, 38), (E_, 40)]
eerie = [(0, 76), (1, 79), (1.5, 76), (2, 75), (3, 76), (4, 72), (5, 71), (6, 68), (7, 71)]


def spooky_section(start, end, melody_on=True, perc=True):
    t0 = f(start)
    beats = int((end - start) / 15)
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = spooky[(b // 4) % 4]
        add(music, pizz(root - 12, 0.3), tb)
        add(music, pizz(root - 5, 0.18), tb + BEAT / 2)
        for k, m in enumerate(chord):
            add(music, pizz(m + 12, 0.07), tb + BEAT / 2 + k * 0.01)
        if perc:
            if b % 2:
                add(music, snap(0.12), tb)
            add(music, shaker(0.035), tb + BEAT / 2)
    if melody_on:
        for beat, m in eerie:
            for rep in range(0, beats, 8):
                if rep + beat < beats:
                    add(music, glock(m, 0.7, 0.11), t0 + (rep + beat) * BEAT)


spooky_section(0, 96)
# BOUH stinger
for m in [33, 45, 51, 57]:
    add(music, ks(m, 1.2, 0.2, bright=0.4, decay=0.996), f(100))
add(music, crash(0.25), f(100))
# hiding: trembling tremolo + theremin
for k in range(int((170 - 106) / 2)):
    add(music, pizz(40 + (k % 2), 0.08), f(106 + k * 2))
add(music, theremin(69, 75, 1.0), f(108))
add(music, theremin(75, 66, 1.1), f(140))
# sneaky plan march
spooky_section(172, 296, melody_on=False, perc=False)
for k in range(int((296 - 240) / 7.5)):
    add(music, shaker(0.04), f(240 + k * 7.5))

# friends: the series' happy theme
C, Am, F, G = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71]
prog = [(C, 48), (Am, 45), (F, 41), (G, 43)]
melody = [
    (0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1),
    (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1),
    (8, 77, 0.5), (8.5, 81, 0.5), (9, 84, 1), (10, 81, 0.5), (10.5, 77, 0.5), (11, 74, 1),
    (12, 79, 0.5), (12.5, 77, 0.5), (13, 76, 0.5), (13.5, 74, 0.5), (14, 72, 2),
]
t0 = f(330)
beats = int((570 - 330) / 15)
for b in range(beats):
    tb = t0 + b * BEAT
    chord, root = prog[(b // 4) % 4]
    if b % 2 == 0:
        add(music, ks(root - 12 + (7 if b % 4 == 2 else 0), 0.6, 0.3, bright=0.3, decay=0.995), tb)
        add(music, kick(0.35), tb)
    else:
        add(music, snap(), tb)
    strum(chord, tb + BEAT / 2, music, 0.1, down=b % 2 == 0)
    for h in range(2):
        add(music, shaker(), tb + h * BEAT / 2)
for beat, m, ln in melody:
    for rep in range(0, beats, 16):
        if rep + beat < beats:
            add(music, glock(m, 0.6 + ln * 0.3), t0 + (rep + beat) * BEAT)
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(570) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(570))
add(music, glock(88, 1.2, 0.16), f(577))
add(music, glock(91, 1.4, 0.16), f(584))
add(music, kick(0.4), f(570))

# ---------------- sfx ----------------
for k in range(6):
    add(sfx, flap(), f(4 + k * 6))
add(sfx, glock(96, 0.6, 0.06), f(10))  # title sparkle
for at in (30, 46):
    add(sfx, boing(0.14, 220, 460), f(at))
for at in (38, 54):
    add(sfx, bloop(0.25), f(at))
for at in (64, 70, 76):
    add(sfx, knock(), f(at))
add(sfx, creak(0.45), f(83))
add(sfx, sweep(110, 60, 0.7, 0.35, vibrato=0.08, rate=9) * env(0.7, 0.02, 0.4), f(100))  # "BOUH"
add(sfx, slide_whistle(500, 1500, 0.25, 0.14), f(100))  # his take
add(sfx, whoosh(0.4, 0.16), f(102))  # sheet flies off
add(sfx, bloop(0.2), f(118))  # bucket lands
for k in range(5):
    add(sfx, pop(1 + k * 0.15, 0.1), f(120 + k * 2))  # candy scatter
add(sfx, bloop(0.2), f(125))
add(sfx, chatter(1.2), f(132))
add(sfx, glock(96, 0.4, 0.14), f(172))  # idea "ting"
sparkle(f(173), sfx, 0.06)
add(sfx, slide_whistle(600, 1200, 0.25, 0.12), f(194))  # gum flip
add(sfx, gulp(), f(202))
for k in range(3):
    add(sfx, chew(), f(206 + k * 5))
add(sfx, boing(0.16), f(222))
add(sfx, bloop(0.22), f(232))
add(sfx, whoosh(0.3, 0.12), f(236))  # deep breath
add(sfx, stretch(f(53), 0.2), f(243))  # blowing the ghost bubble
add(sfx, theremin(81, 72, 0.5, 0.06), f(262))  # the ghost goes "oooh..."
add(sfx, pop(0.55, 1.0), f(300))
add(sfx, boum(1.0), f(300))
add(sfx, crash(0.25), f(300))
add(sfx, splat(0.4), f(302))  # gum all over the ghost
giggle(f(326))
giggle(f(340), 0.08)
add(sfx, chew(0.12), f(LICK := 360))
add(sfx, splat(0.45), f(362))
sparkle(f(366), sfx, 0.08)
add(sfx, boing(0.2, 200, 700), f(386))
add(sfx, bloop(0.22), f(397))
add(sfx, whoosh(0.8, 0.14), f(408))  # dolly-in
sparkle(f(440), sfx, 0.1)  # "A toi !"
add(sfx, slide_whistle(400, 1100, 0.7, 0.13), f(452))
add(sfx, whoosh(0.6, 0.25), f(500))
# finale
add(sfx, whoosh(0.35, 0.18), f(510))
add(sfx, bloop(0.25), f(523))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.16), f(525 + k * 3))
sparkle(f(530), sfx, 0.08)
add(sfx, stretch(0.7, 0.12), f(549))
add(sfx, pop(0.7, 0.9), f(570))
add(sfx, boum(0.6), f(570))
sparkle(f(574), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.14), f(576))
giggle(f(580), 0.07)

write_mp3(music, "ep2-music", LENGTH)
write_mp3(sfx, "ep2-sfx", LENGTH)
print("wrote ep2-music.mp3, ep2-sfx.mp3")
