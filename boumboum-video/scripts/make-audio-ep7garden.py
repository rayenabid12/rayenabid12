"""Music + SFX for Episode 7 "Le Jardin de Mélo" (45 s).

Run: python3 scripts/make-audio-ep7garden.py -> public/ep7garden-music.mp3, public/ep7garden-sfx.mp3
One little "growing" tune carries the story: a single plucked line for the seed,
ticking impatience, a day-by-day montage that adds a voice each morning, a
storm in minor, a lone piano for the loss, hope with the seeds, then the tune
with everyone playing as they grow the giant watermelon together.
Frame numbers must match GardenScene.tsx. 30 fps.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1268 + 90 - 8
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

PLANT, CAN, SHOUT, PINK_IN, MONTAGE, SPROUT = 96, 128, 210, 236, 300, 342
SUNRISES = [342, 392, 442, 492, 542, 592, 642, 692]
LEAVE, STORM, BREAK, CRACK, MORNING, ARRIVE = 720, 740, 800, 802, 850, 868
KNEEL, POINT, PICK, AGAIN, TOGETHER, ASIDE, CHOP, BITE, END = 900, 966, 996, 1012, 1042, 1148, 1188, 1212, 1268
END_POP = END - 8 + 60

# the growing tune (C major), as (beat, midi, length): it climbs, like a stem
TUNE = [(0, 72, 1), (1, 74, 1), (2, 76, 2), (4, 74, 1), (5, 76, 1), (6, 79, 2),
        (8, 81, 1), (9, 79, 1), (10, 76, 1), (11, 79, 1), (12, 84, 4)]
C, Am, F, G = [48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]
Cm, Ab, Fm = [48, 55, 60, 63], [44, 51, 56, 60], [41, 48, 53, 56]


def tune(at, sb=0.25, vol=0.12, voice="pluck", minor=False, upto=None):
    for k, (beat, m, ln) in enumerate(TUNE[:upto]):
        mm = m - 1 if minor and m % 12 in (4, 9) else m
        t = at + beat * sb
        if voice == "glock":
            add(music, glock(mm, 0.8 + ln * sb, vol), t)
        else:
            add(music, ks(mm, 0.5 + ln * sb, vol * 1.5, bright=0.5, decay=0.996), t)


def chord_bed(at, chords, each, vol=0.04, bassline=True):
    for k, ch in enumerate(chords):
        t = at + k * each
        add(music, pad(ch, each + 0.2, vol), t)
        if bassline:
            add(music, ks(ch[0] - 12, each, 0.16, bright=0.3, decay=0.997), t)


def thunder(at, vol=0.5):
    t = t_arr(2.2)
    rumble = lowpass(rng.uniform(-1, 1, len(t)), 0.03) * np.exp(-t * 1.6) * (1 - np.exp(-t * 30))
    add(sfx, vol * rumble / (np.abs(rumble).max() + 1e-9), at)
    add(sfx, kick(0.5), at)


# ---------------------------------------------------------------- music
# one seed: the tune, one plucked line, unfinished
tune(f(60), sb=0.3, vol=0.1, upto=7)
add(music, pad(C, 3.0, 0.03), f(60))
# watering, then waiting: a clock ticking, the tune stuck on one note
add(music, pad(F, 2.4, 0.03), f(CAN))
for k in range(9):
    add(sfx, snap(0.07 if k % 2 else 0.1), f(172) + k * 0.25)
# Pink: gentle, patient chords
chord_bed(f(PINK_IN + 20), [F, G], 0.9, 0.035, False)
add(music, glock(79, 1.0, 0.08), f(270))
# the montage: a soft loop; each morning a glock "ding", the tune grows a voice
for k, s in enumerate([MONTAGE] + SUNRISES):
    t0 = f(s)
    add(music, glock(84 + [0, 2, 4, 5, 7, 9, 11, 12, 12][k], 0.6, 0.08), t0)
chord_bed(f(MONTAGE), [C, Am, F, G] * 3, 1.42, 0.035)
for b in range(int((f(LEAVE) - f(MONTAGE)) / 0.355)):
    add(music, shaker(0.025), f(MONTAGE) + b * 0.355)
tune(f(SPROUT + 6), sb=0.18, vol=0.1)  # the sprout!
tune(f(492), sb=0.24, vol=0.08, voice="glock")
tune(f(592), sb=0.24, vol=0.1)
tune(f(592), sb=0.24, vol=0.05, voice="glock")
# goodnight... then the storm, in minor
add(music, pad(Am, 1.4, 0.03), f(LEAVE))
chord_bed(f(STORM), [Cm, Ab, Fm, Cm], 0.8, 0.04)
for k in range(12):
    add(music, ks([36, 39, 36, 43][k % 4], 0.3, 0.16, bright=0.4, decay=0.99), f(STORM) + k * 0.27)
# the morning after: a lone, slow piano version of the tune
tune(f(KNEEL), sb=0.5, vol=0.09, minor=True, upto=8)
add(music, pad(Am, 3.0, 0.03), f(KNEEL))
# hope: the seeds glint
for k, m in enumerate([76, 79, 84, 88]):
    add(music, glock(m, 1.0, 0.07), f(POINT + 6) + k * 0.18)
add(music, pad(F, 1.6, 0.035), f(POINT + 6))
add(music, pad(G, 1.4, 0.04), f(AGAIN))
# together: the tune, full and quick, with a beat
chord_bed(f(TOGETHER), [C, Am, F, G, C], 0.92, 0.045)
for b in range(16):
    tb = f(TOGETHER) + b * 0.23
    if b % 2 == 0:
        add(music, kick(0.25), tb)
    add(music, hat(0.04), tb + 0.115)
tune(f(TOGETHER + 6), sb=0.2, vol=0.11)
tune(f(TOGETHER + 6), sb=0.2, vol=0.06, voice="glock")
# the giant watermelon: wow
add(music, pad([60, 64, 67, 72], 1.2, 0.05), f(1166))
# the taste of patience: the tune, warm and slow, to the end
tune(f(1200), sb=0.26, vol=0.11)
tune(f(1200), sb=0.26, vol=0.05, voice="glock")
chord_bed(f(1200), [C, F, G], 0.75, 0.04)
# finale
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.35), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, glock(96, 0.6, 0.06), f(70))  # the seed glints
add(sfx, crinkle(0.25, 0.08), f(PLANT + 10))  # into the soil
add(sfx, pop(0.8, 0.08), f(PLANT + 12))
for at, ln in ((138, 28), (300, 16)):  # watering
    t = t_arr(f(ln))
    add(sfx, 0.035 * lowpass(rng.uniform(-1, 1, len(t)), 0.25) * np.sin(np.pi * t / t[-1]), f(at))
add(sfx, boing(0.12, 220, 380), f(SHOUT))  # « Allez, pousse ! »
for k in range(4):  # ...crickets
    add(sfx, glock(103, 0.05, 0.03), f(242) + k * 0.12)
for k, s in enumerate([PINK_IN, PINK_IN + 14]):
    add(sfx, boing(0.08, 240, 460), f(s + 4))
for s in SUNRISES[1:-1]:
    t = t_arr(f(12))
    add(sfx, 0.03 * lowpass(rng.uniform(-1, 1, len(t)), 0.25) * np.sin(np.pi * t / t[-1]), f(s + 5))
sparkle(f(SPROUT + 2), sfx, 0.08)  # the sprout!
add(sfx, boing(0.1, 260, 620), f(SPROUT + 16))
add(sfx, glock(91, 0.5, 0.06), f(540))  # the flower
add(sfx, bloop(0.12), f(640))  # the fruit
for k, s in enumerate([LEAVE + 10, LEAVE + 26]):
    add(sfx, boing(0.06, 240, 420), f(s + 4))
add(sfx, whoosh(2.5, 0.06), f(STORM))  # wind
t = t_arr(f(MORNING - STORM + 10))
add(sfx, 0.05 * lowpass(rng.uniform(-1, 1, len(t)), 0.5) * np.minimum(1, t * 2) * np.minimum(1, (t[-1] - t) * 2), f(STORM))  # rain
for at in (784, BREAK, 826):
    thunder(f(at), 0.4 if at != BREAK else 0.55)
add(sfx, crash(0.12), f(BREAK + 1))  # the plant snaps
add(sfx, splat(0.25), f(CRACK + 4))  # the fruit cracks
for k in range(5):
    add(sfx, pop(1.5 + k * 0.1, 0.05), f(CRACK + 16 + k * 2))
for k in range(4):  # birds, but grey
    add(sfx, glock(98 - (k % 2) * 3, 0.1, 0.025), f(MORNING + 20) + k * 0.15)
add(sfx, boing(0.06, 240, 380), f(ARRIVE + 4))
add(sfx, boing(0.06, 240, 380), f(ARRIVE + 14))
add(sfx, glock(100, 0.7, 0.05), f(914))  # the tear
for k in range(2):
    add(sfx, boing(0.06, 240, 420), f(924 + k * 14))
sparkle(f(POINT + 6), sfx, 0.07)  # the seeds glint
add(sfx, glock(96, 0.6, 0.08), f(PICK + 10))
add(sfx, crinkle(0.25, 0.08), f(1048))  # replanting
for k in range(5):  # watering together
    t = t_arr(0.4)
    add(sfx, 0.03 * lowpass(rng.uniform(-1, 1, len(t)), 0.25) * np.sin(np.pi * t / t[-1]), f(1058 + k * 23))
for k in range(6):  # growing, growing
    add(sfx, stretch(0.25, 0.04), f(1100 + k * 12))
add(sfx, boing(0.08, 220, 420), f(ASIDE + 4))
add(sfx, glock(91, 0.8, 0.08), f(1170))  # wow
add(sfx, whoosh(0.2, 0.1), f(CHOP - 2))  # the chop
add(sfx, splat(0.4), f(CHOP + 3))
add(sfx, pop(0.9, 0.3), f(CHOP + 3))
sparkle(f(CHOP + 6), sfx, 0.08)
for k in range(2):  # crunch!
    add(sfx, chew(0.18), f(BITE + 4 + k * 2))
for k in range(3):
    add(sfx, chew(0.1), f(BITE + 10 + k * 5))
add(sfx, glock(93, 0.8, 0.06), f(1236))  # mmmh
# finale
F0 = END - 8
add(sfx, whoosh(0.35, 0.16), f(F0 + 4))
add(sfx, bloop(0.22), f(F0 + 17))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.14), f(F0 + 19 + k * 3))
sparkle(f(F0 + 24), sfx, 0.08)
add(sfx, stretch(0.7, 0.12), f(F0 + 42))
add(sfx, pop(0.7, 0.8), f(END_POP))
add(sfx, boum(0.5), f(END_POP))
sparkle(f(END_POP + 4), sfx, 0.12)
add(sfx, glock(96, 0.3, 0.12), f(END_POP + 6))

write_mp3(music, "ep7garden-music", LENGTH)
write_mp3(sfx, "ep7garden-sfx", LENGTH)
print("wrote ep7garden-music.mp3, ep7garden-sfx.mp3")
