"""Music + SFX for Episode 6 "Le Petit Héros" (45 s).

Run: python3 scripts/make-audio-ep6.py -> public/ep6-music.mp3, public/ep6-sfx.mp3
Rainy-day theme -> the fear gag -> "MIAOU" -> climbing tension -> the freeze (drone,
heartbeat) -> Mélo's shout -> heroic theme building -> crack, fall -> the bubble
parachute (soaring) -> sun, bravo, happy theme -> finale. 30 fps, 120 BPM.
Frame numbers must match HeroScene.tsx.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1350
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

STREET, PINK_UP, PINK_DOWN, MIAOU, DECIDE, CLIMB = 92, 140, 178, 214, 296, 318
FREEZE, SLIP, SHOUT, BREATH, RESUME, ON_ROOF, CATCH = 440, 492, 508, 534, 560, 652, 708
CRACK, OFF_EDGE, BLOW, LAND, CHEER, LICK, END = 738, 752, 790, 930, 944, 966, 1268


def rain(dur, vol=0.05):
    n = rng.uniform(-1, 1, int(dur * SR))
    return vol * (lowpass(n, 0.35) - lowpass(n, 0.04))


def wind(dur, vol=0.08):
    t = t_arr(dur)
    n = lowpass(rng.uniform(-1, 1, len(t)), 0.03) * 8
    return vol * n * np.sin(np.pi * t / dur) ** 2


def thunder(dur=2.2, vol=0.6):
    t = t_arr(dur)
    n = lowpass(rng.uniform(-1, 1, len(t)), 0.02) * 12
    crack = rng.uniform(-1, 1, len(t)) * np.exp(-t / 0.06)
    return vol * (n * np.exp(-t / 0.9) + 0.4 * crack)


def heartbeat(at, vol=0.5):
    for k, off in enumerate([0, 0.18]):
        t = t_arr(0.2)
        add(sfx, vol * (0.7 if k else 1) * np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.05), at + off)


def meow(at, vol=0.18, happy=False):
    t = t_arr(0.45)
    base = np.interp(t, [0, 0.12, 0.45], [700, 950 if not happy else 1100, 600])
    sig = np.sin(2 * np.pi * np.cumsum(base) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(base) / SR)
    add(sfx, vol * sig * np.sin(np.pi * t / 0.45), at)


def purr(at, dur=1.0, vol=0.08):
    t = t_arr(dur)
    add(sfx, vol * lowpass(rng.uniform(-1, 1, len(t)), 0.08) * 6 * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 24 * t))) * np.sin(np.pi * t / dur), at)


def applause(at, dur=1.8, vol=0.1):
    out = np.zeros(int(dur * SR))
    for k in range(int(dur * 60)):
        p = int(rng.uniform(0, len(out) - 400))
        out[p : p + 300] += rng.uniform(-1, 1, 300) * np.exp(-np.arange(300) / 60)
    add(sfx, vol * out * np.sin(np.pi * np.arange(len(out)) / len(out)), at)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


C, Am, F, G, Dm, E = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71], [57, 62, 65, 69], [56, 59, 64, 68]


def bed(start, end, prog, vol=1.0, pizz=False, every=4):
    t0 = f(start)
    for b in range(int((end - start) / 15)):
        tb = t0 + b * BEAT
        chord, root = prog[(b // every) % len(prog)]
        if pizz:
            add(music, ks(root - 12, 0.22, 0.22 * vol, bright=0.6, decay=0.98), tb)
            add(music, ks(root - 5, 0.2, 0.12 * vol, bright=0.6, decay=0.98), tb + BEAT / 2)
        else:
            if b % 2 == 0:
                add(music, ks(root - 12, 0.6, 0.24 * vol, bright=0.3, decay=0.995), tb)
                add(music, kick(0.22 * vol), tb)
            else:
                add(music, snap(0.12 * vol), tb)
            strum(chord, tb + BEAT / 2, music, 0.07 * vol, down=b % 2 == 0)


# ---------------------------------------------------------------- music
# 1. rainy day (soft, A minor -> C)
for k, (beat, m) in enumerate([(0, 76), (1, 72), (2, 74), (3, 71), (4, 72), (6, 69), (8, 76), (9, 79), (10, 77), (11, 76), (12, 74)]):
    add(music, glock(m, 1.0, 0.1), f(10) + beat * 0.42)
add(music, pad([57, 64, 69], 3.0, 0.04), f(10))
bed(STREET, MIAOU - 4, [(Am, 45), (F, 41), (C, 48), (G, 43)], vol=0.7, pizz=True)
add(music, ks(40, 0.8, 0.2, bright=0.6, decay=0.99), f(PINK_UP + 22))  # "too high!"
# 2. the kitten: a tender, worried motif
for k, (beat, m) in enumerate([(0, 81), (1, 79), (2, 76), (3, 74), (4, 76)]):
    add(music, glock(m, 0.9, 0.11), f(MIAOU + 12) + beat * 0.4)
add(music, pad([57, 60, 64], 2.8, 0.045), f(MIAOU + 10))
# 3. the climb: pizzicato ostinato rising in pitch
for b in range(int((FREEZE - CLIMB) / 7.5)):
    tb = f(CLIMB) + b * BEAT / 2
    step = b // 4
    add(music, ks(45 + step, 0.18, 0.2, bright=0.6, decay=0.98), tb)
    if b % 2:
        add(music, snap(0.08), tb)
# 4. the freeze: low drone, wind, heartbeat (sfx)
t = t_arr(3.2)
add(music, 0.08 * (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 58.3 * t)) * np.minimum(t / 0.5, 1) * np.minimum((3.2 - t) / 0.6, 1), f(FREEZE + 6))
# 5. after Mélo's shout: the heroic theme starts, quietly, then builds
hero = [(0, 72, 1), (1, 74, 0.5), (1.5, 76, 0.5), (2, 79, 2), (4, 77, 1), (5, 76, 1), (6, 74, 2), (8, 72, 1), (9, 76, 1), (10, 79, 1), (11, 84, 3)]
for beat, m, ln in hero:
    add(music, glock(m, 0.6 + ln * 0.3, 0.11), f(RESUME) + beat * BEAT)
for b in range(int((CRACK - RESUME) / 15)):
    tb = f(RESUME) + b * BEAT
    chord, root = [(C, 48), (G, 43), (Am, 45), (F, 41)][(b // 4) % 4]
    add(music, ks(root - 12, 0.5, 0.18 + b * 0.005, bright=0.3, decay=0.995), tb)
    add(music, kick(0.16 + b * 0.008), tb)
    strum(chord, tb + BEAT / 2, music, 0.05 + b * 0.002, down=b % 2 == 0)
# 6. the catch: a short warm chord, then the crack cuts everything
for m in [60, 64, 67, 72]:
    add(music, glock(m + 12, 0.8, 0.08), f(CATCH + 4) + (m - 60) * 0.02)
# 7. the bubble parachute: soaring
fly = [(0, 72, 2), (2, 76, 1), (3, 79, 1), (4, 84, 3), (7, 83, 1), (8, 81, 2), (10, 79, 2), (12, 77, 1), (13, 79, 1), (14, 84, 2)]
t1 = f(BLOW + 6)
for beat, m, ln in fly:
    add(music, glock(m, 0.8 + ln * 0.4, 0.13), t1 + beat * 0.3)
for k, (chord, root) in enumerate([(C, 48), (Am, 45), (F, 41), (G, 43)]):
    tb = t1 + k * 1.2
    add(music, pad(chord, 1.3, 0.06), tb)
    add(music, ks(root - 12, 1.2, 0.2, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum(chord, tb + h * 0.3, music, 0.05, down=h % 2 == 0)
# 8. sunshine: the happy series theme to the end
melody = [(0, 76, 0.5), (0.5, 79, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 76, 0.5), (3, 72, 1), (4, 76, 0.5), (4.5, 79, 0.5), (5, 81, 0.5), (5.5, 84, 0.5), (6, 81, 1), (7, 79, 1)]
bed(LAND + 4, TOTAL - 30, [(C, 48), (Am, 45), (F, 41), (G, 43)], vol=0.9)
for rep in (0, 16):
    for beat, m, ln in melody:
        add(music, glock(m, 0.6 + ln * 0.3, 0.12), f(LAND + 4) + (rep + beat) * BEAT)
END_POP = TOTAL - 30
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.4), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, rain(29.0, 0.05), 0)
add(sfx, rain(2.5, 0.03) * np.linspace(1, 0, int(2.5 * SR)), f(860))
add(sfx, thunder(2.2, 0.4), f(30))
add(sfx, thunder(2.0, 0.45), f(120))
add(sfx, glock(96, 0.6, 0.05), f(10))
add(sfx, boing(0.12, 240, 480), f(104 + 5))  # Mélo hops on the wall
add(sfx, bloop(0.15), f(104 + 15))
add(sfx, boing(0.1, 300, 200), f(128 + 5))
add(sfx, boing(0.12, 220, 460), f(PINK_UP + 5))
add(sfx, bloop(0.15), f(PINK_UP + 15))
add(sfx, slide_whistle(600, 1500, 0.25, 0.12), f(PINK_UP + 22))  # look down: eek
for k in range(8):
    add(sfx, pop(2.2 + (k % 2) * 0.3, 0.04), f(PINK_UP + 24 + k * 2))  # knees knocking
add(sfx, boing(0.1, 400, 200), f(PINK_DOWN + 5))
meow(f(MIAOU), 0.22)
add(sfx, gulp(0.35), f(DECIDE))
for at in (CLIMB, 340, 362):
    add(sfx, boing(0.1, 240, 480), f(at + 5))
    add(sfx, bloop(0.14), f(at + 15))
for k in range(int((FREEZE - 380) / 8)):  # hands on the pipe
    add(sfx, pop(1.8 + (k % 2) * 0.3, 0.05), f(380 + k * 8))
add(sfx, wind(1.6, 0.14), f(FREEZE - 6))
add(sfx, thunder(2.0, 0.5), f(FREEZE))
add(sfx, slide_whistle(900, 500, 0.3, 0.1), f(452))  # slip
for k, at in enumerate(range(462, 530, 14)):
    heartbeat(f(at), 0.35 + 0.05 * k)
meow(f(SLIP), 0.16)
add(sfx, whoosh(0.3, 0.1), f(SHOUT))
add(sfx, whoosh(1.0, 0.06), f(BREATH + 4))  # deep breath in
add(sfx, whoosh(0.8, 0.05) * 0.8, f(BREATH + 14))  # ...and out
add(sfx, glock(96, 0.4, 0.12), f(RESUME))  # resolve
for k in range(int((640 - RESUME) / 6)):
    add(sfx, pop(1.8 + (k % 2) * 0.3, 0.05), f(RESUME + 2 + k * 6))
add(sfx, boing(0.1, 240, 480), f(647))
for k in range(8):  # crawling
    add(sfx, pop(1.3 + (k % 2) * 0.2, 0.04), f(ON_ROOF + 6 + k * 6))
meow(f(CATCH - 6), 0.14)
add(sfx, bloop(0.25), f(CATCH + 2))
add(sfx, wind(1.2, 0.12), f(CRACK - 8))
add(sfx, crash(0.3), f(CRACK))
add(sfx, pop(0.4, 0.6), f(CRACK))
add(sfx, slide_whistle(1500, 250, 1.1, 0.16), f(OFF_EDGE))  # falling
add(sfx, glock(96, 0.4, 0.14), f(BLOW))  # the idea
add(sfx, stretch(0.7, 0.22), f(BLOW + 1))
add(sfx, whoosh(2.4, 0.05), f(820))
add(sfx, boing(0.12, 300, 180), f(LAND))
add(sfx, pop(1.0, 0.4), f(LAND + 4))
applause(f(CHEER), 2.2, 0.12)
sparkle(f(950), sfx, 0.1)
purr(f(LICK), 1.0, 0.08)
giggle(f(LICK + 4), 0.09)
meow(f(1200), 0.16, happy=True)
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

write_mp3(music, "ep6-music", LENGTH)
write_mp3(sfx, "ep6-sfx", LENGTH)
print("wrote ep6-music.mp3, ep6-sfx.mp3")
