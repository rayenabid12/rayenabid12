"""Music + SFX for Episode 3 "Le Duel de Bulles".

Run: python3 scripts/make-audio-ep3.py -> public/ep3-music.mp3, public/ep3-sfx.mp3
Sunny park theme -> cartoon-western duel -> soft moment -> big shared bubble -> happy theme.
Global frames at 30 fps; 120 BPM (one beat = 15 frames).
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

LENGTH = 900 / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)


def whistle(notes, at, vol=0.12):
    """Western-style whistled melody: (beat, midi, length-in-beats)."""
    for beat, m, ln in notes:
        dur = ln * BEAT
        t = t_arr(dur)
        freq = note_hz(m) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / 0.25, 1))
        sig = np.sin(2 * np.pi * np.cumsum(freq) / SR) + 0.08 * rng.uniform(-1, 1, len(t))
        add(music, vol * sig * np.minimum(t / 0.04, 1) * np.minimum((dur - t) / 0.08, 1), at + beat * BEAT)


def twang(midi, at, vol=0.22):
    add(music, ks(midi, 1.4, vol, bright=0.75, decay=0.997), at)


def bell(at, vol=0.35):
    t = t_arr(1.6)
    sig = sum(a * np.sin(2 * np.pi * 1320 * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.6), (2.76, 0.5, 0.25), (5.4, 0.3, 0.1), (0.5, 0.4, 0.8)])
    add(sfx, vol * sig, at)


def chalk(at, vol=0.12):
    t = t_arr(0.35)
    n = lowpass(rng.uniform(-1, 1, len(t)), 0.6) - lowpass(rng.uniform(-1, 1, len(t)), 0.05)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 34 * t))
    add(sfx, vol * n * am * np.sin(np.pi * t / 0.35) * 4, at)


def thud(at, vol=0.5):
    t = t_arr(0.3)
    add(sfx, vol * np.sin(2 * np.pi * np.geomspace(120, 45, len(t)) * t) * np.exp(-t / 0.08), at)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


C, Am, F, G = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71]
Dm, E7 = [57, 62, 65, 69], [56, 59, 64, 68]
happy = [(C, 48), (Am, 45), (F, 41), (G, 43)]
melody = [
    (0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1),
    (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1),
    (8, 77, 0.5), (8.5, 81, 0.5), (9, 84, 1), (10, 81, 0.5), (10.5, 77, 0.5), (11, 74, 1),
    (12, 79, 0.5), (12.5, 77, 0.5), (13, 76, 0.5), (13.5, 74, 0.5), (14, 72, 2),
]


def happy_section(start, end, mel=True, vol=1.0):
    t0 = f(start)
    beats = int((end - start) / 15)
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = happy[(b // 4) % 4]
        if b % 2 == 0:
            add(music, ks(root - 12 + (7 if b % 4 == 2 else 0), 0.6, 0.28 * vol, bright=0.3, decay=0.995), tb)
            add(music, kick(0.3 * vol), tb)
        else:
            add(music, snap(0.16 * vol), tb)
        strum(chord, tb + BEAT / 2, music, 0.09 * vol, down=b % 2 == 0)
        add(music, shaker(0.04 * vol), tb + BEAT / 2)
    if mel:
        for beat, m, ln in melody:
            for rep in range(0, beats, 16):
                if rep + beat < beats:
                    add(music, glock(m, 0.6 + ln * 0.3, 0.13 * vol), t0 + (rep + beat) * BEAT)


def duel_section(start, end, vol=1.0, roll=False):
    """Cartoon western: galloping low pizz in A minor, snare on 2 and 4."""
    t0 = f(start)
    beats = int((end - start) / 15)
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (50, [50, 53, 57]), (52, [52, 56, 59])]
    for b in range(beats):
        tb = t0 + b * BEAT
        root, chord = prog[(b // 4) % 4]
        for k, off in enumerate([0, BEAT / 3, 2 * BEAT / 3]):  # gallop
            add(music, ks(root - 12 + (7 if k == 2 else 0), 0.25, (0.24 if k == 0 else 0.13) * vol, bright=0.6, decay=0.985), tb + off)
        if b % 2:
            add(music, snap(0.16 * vol), tb)
            for m in chord:
                add(music, ks(m + 12, 0.25, 0.05 * vol, bright=0.7, decay=0.98), tb + 0.01)
        if roll:
            add(music, shaker(0.03 + 0.05 * b / beats), tb + BEAT / 2)


# ---------------- music ----------------
happy_section(0, 184)
# "Yo." : a cool little bass lick
for k, m in enumerate([45, 48, 50, 52]):
    add(music, ks(m, 0.3, 0.25, bright=0.4, decay=0.99), f(196) + k * 0.12)
# DÉFI ! twang + whistle
twang(45, f(224), 0.3)
twang(57, f(224) + 0.02, 0.15)
whistle([(0, 69, 0.5), (0.5, 74, 0.5), (1, 69, 1.5), (3, 76, 0.5), (3.5, 74, 0.5), (4, 72, 1.5)], f(232), 0.1)
duel_section(232, 330)
# round 1: tick-tock tension + whistle
duel_section(345, 445, vol=0.8, roll=True)
whistle([(0, 81, 1), (1, 79, 0.5), (1.5, 76, 0.5), (2, 81, 2)], f(352), 0.07)
# score + round 2
duel_section(466, 610, vol=0.85)
whistle([(0, 69, 0.5), (0.5, 74, 0.5), (1, 69, 1.5)], f(470), 0.08)
# sad moment: slow glock in A minor, then it turns major when he smiles
for k, (m, beat) in enumerate([(69, 0), (72, 1), (76, 2), (74, 3), (72, 4), (71, 5), (69, 6)]):
    add(music, glock(m, 1.2, 0.12), f(616) + beat * BEAT * 0.9)
for chord, at in [(Am, 616), (F, 640)]:
    add(music, pad(chord, 1.0, 0.05), f(at))
for m in [72, 76, 79, 84]:
    add(music, glock(m, 1.2, 0.12), f(680) + (m - 72) * 0.03)
add(music, pad(C, 1.0, 0.05), f(680))
# the giant bubble: rising strums and an arpeggio build
for b in range((772 - 698) // 15 + 1):
    tb = f(698) + b * BEAT
    chord = [C, F, G, C, F, G][b % 6]
    strum(chord, tb, music, 0.06 + 0.02 * b, down=True)
    add(music, kick(0.15 + 0.04 * b), tb)
for k in range(24):
    add(music, glock(72 + [0, 4, 7, 12, 16, 19][k % 6] + 12 * (k // 12), 0.4, 0.06 + k * 0.003), f(740) + k * 0.07)
add(music, pad([60, 64, 67, 72, 76], 1.2, 0.06), f(740))
# happy theme back for the laugh, then the finale
happy_section(786, 900, mel=True)
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(870) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(870))
add(music, glock(88, 1.2, 0.16), f(877))
add(music, glock(91, 1.4, 0.16), f(884))
add(music, kick(0.4), f(870))

# ---------------- sfx ----------------
add(sfx, glock(96, 0.6, 0.06), f(10))  # title sparkle
for at in (80, 99, 118):
    add(sfx, boing(0.14, 220, 460), f(at + 5))
    add(sfx, bloop(0.22), f(at + 15))
add(sfx, stretch(0.9, 0.12), f(144))
add(sfx, pop(1.4, 0.5), f(170))
giggle(f(174), 0.07)
add(sfx, whoosh(0.4, 0.1), f(180))
add(sfx, snap(0.12), f(198))  # finger flick
add(sfx, whoosh(0.25, 0.12), f(222))
add(sfx, pop(0.8, 0.3), f(236))  # board appears
add(sfx, crinkle(0.4, 0.18), f(272))
add(sfx, crinkle(0.4, 0.14), f(276))
add(sfx, pop(1.3, 0.12), f(298))
add(sfx, gulp(0.4), f(312))
add(sfx, gulp(0.3), f(314))
for k in range(4):
    add(sfx, chew(0.12), f(318 + k * 6))
bell(f(330))
add(sfx, whoosh(0.3, 0.16), f(345))
# round 1
add(sfx, stretch(f(410 - 352), 0.2), f(352))
add(sfx, stretch(f(412 - 360), 0.12), f(360))
add(sfx, pop(0.55, 0.9), f(412))
add(sfx, splat(0.55), f(413))
add(sfx, slide_whistle(900, 500, 0.4, 0.08), f(418))
add(sfx, whoosh(0.3, 0.1), f(426))  # shrug
add(sfx, sweep(600, 200, 0.2, 0.12), f(440))  # bubble sucked back
add(sfx, crinkle(0.3, 0.12), f(447))  # wipe
chalk(f(452))
bell(f(466))
# round 2
add(sfx, stretch(f(515 - 490), 0.2), f(490))
add(sfx, slide_whistle(400, 1400, 1.0, 0.13), f(515))
add(sfx, pop(0.5, 1.0), f(548))
add(sfx, crash(0.2), f(548))
add(sfx, slide_whistle(1400, 300, 0.4, 0.13), f(549))
thud(f(560), 0.55)
add(sfx, boing(0.12, 300, 150), f(561))
for k in range(4):
    add(sfx, glock(96 - k * 2, 0.2, 0.05), f(566 + k * 5))  # dizzy stars
add(sfx, stretch(f(590 - 570), 0.1), f(570))
add(sfx, glock(100, 0.4, 0.08), f(596))  # double bubble "ting"
chalk(f(606))
add(sfx, sweep(500, 180, 0.3, 0.1), f(606))
# the gesture
for at in (624, 642):
    add(sfx, boing(0.1, 260, 420), f(at + 5))
    add(sfx, bloop(0.15), f(at + 15))
sparkle(f(660) + 0.2, sfx, 0.08)
add(sfx, whoosh(0.3, 0.08), f(680))
add(sfx, gulp(0.35), f(690))
add(sfx, gulp(0.3), f(692))
# the giant bubble
add(sfx, stretch(f(740 - 702), 0.22), f(702))
add(sfx, slide_whistle(300, 1200, 1.0, 0.1), f(740))
add(sfx, whoosh(1.2, 0.08), f(745))
add(sfx, pop(0.45, 1.0), f(772))
add(sfx, boum(1.0), f(772))
add(sfx, crash(0.25), f(772))
add(sfx, slide_whistle(1200, 300, 0.4, 0.1), f(774))
thud(f(786), 0.45)
thud(f(787), 0.4)
chalk(f(792))  # board flips to ÉQUIPE
sparkle(f(794), sfx, 0.1)
giggle(f(790), 0.1)
giggle(f(800), 0.09, 84)
giggle(f(808), 0.08)
# finale (same beats as every episode)
add(sfx, whoosh(0.35, 0.18), f(810))
add(sfx, bloop(0.25), f(823))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.16), f(825 + k * 3))
sparkle(f(830), sfx, 0.08)
add(sfx, stretch(0.7, 0.12), f(849))
add(sfx, pop(0.7, 0.9), f(870))
add(sfx, boum(0.6), f(870))
sparkle(f(874), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.14), f(876))
giggle(f(880), 0.07)

write_mp3(music, "ep3-music", LENGTH)
write_mp3(sfx, "ep3-sfx", LENGTH)
print("wrote ep3-music.mp3, ep3-sfx.mp3")
