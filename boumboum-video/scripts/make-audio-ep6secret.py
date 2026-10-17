"""Music + SFX for Episode 6 "Le Secret de Mélo" (45 s).

Run: python3 scripts/make-audio-ep6secret.py -> public/ep6secret-music.mp3, public/ep6secret-sfx.mp3
Fairground theme -> the deflated bubble -> tiptoe prank -> POP, silence -> sad music
box (the secret) -> hopeful lessons -> drumroll -> MÉGA BOUM, bell, fanfare.
Frame numbers must match SecretScene.tsx. 30 fps, 120 BPM.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1350
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

PINK_BLOW, PINK_BOUM, MELO_BLOW, DEFLATE = 104, 152, 246, 296
PRANK, PRANK_POP, HIDE, SIT, LESSON = 404, 430, 472, 600, 700
TINY1, TINY2, MEDIUM, BIG_BLOW, HESITATE, HANDS, MEGA, DING, END = 738, 790, 850, 966, 1024, 1040, 1064, 1075, 1268


def bell(at, vol=0.4):
    t = t_arr(2.2)
    sig = sum(a * np.sin(2 * np.pi * 880 * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.9), (2.76, 0.5, 0.35), (5.4, 0.3, 0.12), (0.5, 0.5, 1.2)])
    add(sfx, vol * sig, at)


def heartbeat(at, vol=0.5):
    for k, off in enumerate([0, 0.18]):
        t = t_arr(0.2)
        add(sfx, vol * (0.7 if k else 1) * np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.05), at + off)


def rustle(at, dur=0.5, vol=0.08):
    t = t_arr(dur)
    add(sfx, vol * lowpass(rng.uniform(-1, 1, len(t)), 0.4) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * t / dur) * 3, at)


def deflate(at, dur=0.55, vol=0.12):
    t = t_arr(dur)
    n = rng.uniform(-1, 1, len(t))
    add(sfx, vol * (lowpass(n, np.float64(0.5)) - lowpass(n, 0.1)) * np.linspace(1, 0.2, len(t)) * 3, at)
    add(sfx, sweep(500, 180, dur, 0.06), at)


def trombone(m0, m1, dur, vol=0.12):
    t = t_arr(dur)
    freq = np.geomspace(note_hz(m0), note_hz(m1), len(t)) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return vol * lowpass(np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph), 0.25) * np.minimum(t / 0.03, 1) * np.minimum((dur - t) / 0.1, 1)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


C, Am, F, G, Dm = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71], [57, 62, 65, 69]


def fair(start, end, vol=1.0):
    """Carnival oom-pah: bass on 1, chord on the off-beats, glock melody."""
    t0 = f(start)
    beats = int((end - start) / 15)
    prog = [(C, 48), (G, 43), (C, 48), (F, 41)]
    mel = [(0, 79), (0.5, 76), (1, 79), (2, 84), (3, 79), (4, 77), (4.5, 76), (5, 74), (6, 76), (7, 72)]
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = prog[(b // 2) % 4]
        add(music, ks(root - 12 + (7 if b % 2 else 0), 0.3, 0.24 * vol, bright=0.4, decay=0.99), tb)
        for k, m in enumerate(chord[:3]):
            add(music, ks(m + 12, 0.18, 0.05 * vol, bright=0.7, decay=0.97), tb + BEAT / 2 + k * 0.01)
    for rep in range(0, beats, 8):
        for beat, m in mel:
            if rep + beat < beats:
                add(music, glock(m, 0.4, 0.1 * vol), t0 + (rep + beat) * BEAT)


# ---------------------------------------------------------------- music
fair(0, 240)
fair(318, 384, 0.8)
add(music, trombone(62, 60, 0.35), f(DEFLATE + 18))
add(music, trombone(60, 55, 0.6), f(DEFLATE + 30))
# tiptoe prank (pizzicato)
for k, m in enumerate([60, 64, 67, 64, 60, 64, 67, 71, 72]):
    add(music, ks(m, 0.15, 0.14, bright=0.7, decay=0.97), f(384) + k * 0.2)
# after the laugh: silence, then a sad, tender music box (A minor)
for beat, m in [(0, 76), (1, 72), (2, 74), (3, 71), (4, 72), (6, 69), (7, 71), (8, 72), (9, 74), (10, 72)]:
    add(music, glock(m, 1.4, 0.1), f(524) + beat * 0.5)
add(music, pad([57, 60, 64], 3.0, 0.045), f(524))
add(music, pad([53, 57, 60], 2.6, 0.045), f(616))
# the promise: warm chord
add(music, pad([60, 64, 67], 2.0, 0.05), f(644))
# hopeful lessons (F major, light)
for b in range(int((900 - LESSON) / 15)):
    tb = f(LESSON) + b * BEAT
    chord, root = [(F, 41), (C, 48), (Dm, 38), (G, 43)][(b // 4) % 4]
    if b % 2 == 0:
        add(music, ks(root - 12, 0.5, 0.18, bright=0.3, decay=0.995), tb)
    strum(chord, tb + BEAT / 2, music, 0.05, down=b % 2 == 0)
for beat, m, ln in [(0, 77, 1), (1, 81, 1), (2, 84, 2), (4, 82, 1), (5, 81, 1), (6, 79, 2), (8, 77, 1), (9, 79, 1), (10, 81, 2), (12, 84, 2), (14, 86, 2)]:
    add(music, glock(m, 0.6 + ln * 0.3, 0.09), f(LESSON + 8) + beat * BEAT)
# the build-up: drumroll + rising pad
for k in range(int((MEGA - BIG_BLOW) / 2)):
    add(music, snap(0.04 + k * 0.003), f(BIG_BLOW) + k * 2 / FPS)
add(music, pad([60, 64, 67], 1.6, 0.04), f(BIG_BLOW))
add(music, pad([62, 65, 69], 1.6, 0.05), f(1012))
# MÉGA BOUM: fanfare + the happy series theme to the end
for m in [48, 60, 64, 67, 72, 76]:
    add(music, ks(m, 2.0, 0.14, bright=0.6, decay=0.998), f(DING) + (m - 48) * 0.003)
for k, m in enumerate([72, 76, 79, 84]):
    add(music, glock(m + 12, 0.8, 0.14), f(DING) + k * 0.08)
melody = [(0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1), (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1)]
t2 = f(1090)
for b in range(int((TOTAL - 30 - 1090) / 15)):
    tb = t2 + b * BEAT
    chord, root = [(C, 48), (Am, 45), (F, 41), (G, 43)][(b // 4) % 4]
    if b % 2 == 0:
        add(music, ks(root - 12, 0.6, 0.26, bright=0.3, decay=0.995), tb)
        add(music, kick(0.28), tb)
    else:
        add(music, snap(0.14), tb)
    strum(chord, tb + BEAT / 2, music, 0.08, down=b % 2 == 0)
    add(music, shaker(0.04), tb + BEAT / 2)
for rep in (0, 8):
    for beat, m, ln in melody:
        add(music, glock(m, 0.6 + ln * 0.3, 0.12), t2 + (rep + beat) * BEAT)
END_POP = TOTAL - 30
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.4), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, glock(96, 0.6, 0.05), f(10))
add(sfx, stretch(1.5, 0.18), f(PINK_BLOW + 2))
add(sfx, pop(0.55, 0.9), f(PINK_BOUM))
add(sfx, boum(0.7), f(PINK_BOUM))
add(sfx, slide_whistle(400, 1400, 0.35, 0.12), f(PINK_BOUM + 1))  # puck flies
add(sfx, glock(91, 0.5, 0.12), f(164))
add(sfx, whoosh(0.2, 0.1), f(PINK_BOUM + 2))  # Mélo covers his ears
giggle(f(172), 0.08)
for at in (204, 222):
    add(sfx, boing(0.1, 240, 480), f(at + 5))
    add(sfx, bloop(0.14), f(at + 15))
add(sfx, stretch(1.4, 0.14), f(MELO_BLOW + 2))
deflate(f(DEFLATE))
add(sfx, slide_whistle(400, 650, 0.2, 0.06), f(DEFLATE + 16))  # the puck barely moves
add(sfx, boing(0.08, 260, 420), f(391))
add(sfx, stretch(0.8, 0.12), f(PRANK + 2))
add(sfx, pop(0.8, 0.8), f(PRANK_POP))
add(sfx, slide_whistle(600, 1700, 0.25, 0.16), f(PRANK_POP + 1))  # Mélo's yelp
for k in range(8):
    add(sfx, pop(1.6 + (k % 2) * 0.3, 0.08), f(PRANK_POP + 12 + k * 4))
rustle(f(HIDE), 0.6, 0.12)
giggle(f(446), 0.11)
giggle(f(466), 0.1, 86)
giggle(f(486), 0.08)
for at in range(HIDE + 20, SIT, 30):
    rustle(f(at), 0.4, 0.05)
add(sfx, glock(100, 0.6, 0.05), f(524))  # the tear
for at in (562, 582):
    add(sfx, boing(0.08, 260, 420), f(at + 5))
    add(sfx, bloop(0.12), f(at + 15))
add(sfx, bloop(0.12), f(SIT + 8))
rustle(f(LESSON), 0.5, 0.1)
add(sfx, pop(2.2, 0.2), f(TINY1))
add(sfx, pop(2.1, 0.22), f(TINY2))
for k in range(4):
    add(sfx, snap(0.1), f(796 + k * 4))  # claps
add(sfx, pop(1.4, 0.4), f(MEDIUM))
giggle(f(MEDIUM + 6), 0.1)
giggle(f(MEDIUM + 18), 0.08, 91)
for at in (904, 923, 930):
    add(sfx, boing(0.08, 240, 480), f(at + 5))
add(sfx, stretch(1.7, 0.2), f(BIG_BLOW + 2))
heartbeat(f(HESITATE + 2), 0.35)
heartbeat(f(HESITATE + 16), 0.4)
sparkle(f(HANDS + 4), sfx, 0.08)
add(sfx, glock(96, 0.6, 0.1), f(HANDS + 6))
add(sfx, pop(0.45, 1.0), f(MEGA))
add(sfx, boum(1.0), f(MEGA))
add(sfx, crash(0.3), f(MEGA))
add(sfx, slide_whistle(300, 2000, 0.35, 0.14), f(MEGA + 1))  # the puck rockets up
bell(f(DING), 0.45)
for k in range(30):  # confetti
    add(sfx, pop(2.4 + (k % 5) * 0.2, 0.04), f(DING + 2) + k * 0.05)
giggle(f(1088), 0.1)
giggle(f(1100), 0.09, 84)
giggle(f(1116), 0.08)
# finale
F0 = END - 8
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

write_mp3(music, "ep6secret-music", LENGTH)
write_mp3(sfx, "ep6secret-sfx", LENGTH)
print("wrote ep6secret-music.mp3, ep6secret-sfx.mp3")
