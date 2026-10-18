"""Music + SFX for Episode 8 "Le Pays sans couleurs" (44 s).

Run: python3 scripts/make-audio-ep8colors.py -> public/ep8colors-music.mp3, public/ep8colors-sfx.mp3
The same "growing" tune as Episode 7. In the grey world it is a lone music
box; each time a colour comes back, it gains an instrument (pluck, glock,
bass + shaker). At the ravine it turns minor and slow; when his friends come
back it swells, and after the big BOUM the whole band plays it.
Frame numbers must match ColorsScene.tsx. 30 fps.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1240 + 90 - 8
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

OUT, SEE_FLOWER, LIFT, BLOOM, SEE_CLOUD, BLOW, FREE = 58, 174, 196, 222, 304, 356, 392
SEE_FISH, PICK, TOSS, SPLASH, HOPS, EDGE, SIT = 466, 480, 498, 508, (560, 574, 588), 662, 700
HELP, MOUNT, RIDE, LAND, BIG_BLOW, BOUM, MOUNT2, END = 770, 800, 812, 890, 904, 966, 1086, 1240
END_POP = END - 8 + 60

# the growing tune from Episode 7 (C major), as (beat, midi, length)
TUNE = [(0, 72, 1), (1, 74, 1), (2, 76, 2), (4, 74, 1), (5, 76, 1), (6, 79, 2),
        (8, 81, 1), (9, 79, 1), (10, 76, 1), (11, 79, 1), (12, 84, 4)]
C, Am, F, G = [48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]


def tune(at, sb=0.25, vol=0.12, voice="pluck", minor=False, upto=None, shift=0):
    for beat, m, ln in TUNE[:upto]:
        mm = (m - 1 if minor and m % 12 in (4, 9) else m) + shift
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


def colour_chime(at, vol=0.09, base=84):
    for k, m in enumerate([0, 4, 7, 12, 16, 19]):
        add(sfx, glock(base + m, 0.7, vol), at + k * 0.05)


# ---------------------------------------------------------------- music
# a grey world: the tune on a lone, muted music box
tune(f(30), sb=0.34, vol=0.07, voice="glock", minor=True, upto=7)
add(music, pad(Am, 4.0, 0.025), f(40))
tune(f(130), sb=0.2, vol=0.06, voice="glock", minor=True, upto=6)
# the flower blooms: the tune comes back, plucked and bright
tune(f(BLOOM + 4), sb=0.2, vol=0.11)
chord_bed(f(BLOOM + 4), [C, F], 0.8, 0.03, False)
# the cloud: + glock
add(music, pad(Am, 2.0, 0.025), f(SEE_CLOUD))
tune(f(FREE + 4), sb=0.2, vol=0.1)
tune(f(FREE + 4), sb=0.2, vol=0.06, voice="glock")
chord_bed(f(FREE + 4), [C, Am, F], 0.8, 0.035)
# the river: + bass and shaker, the walk gets a groove
chord_bed(f(SPLASH), [C, Am, F, G, C, Am], 0.92, 0.035)
for b in range(int((f(EDGE) - f(SPLASH)) / 0.23)):
    add(music, shaker(0.025), f(SPLASH) + b * 0.23)
tune(f(SPLASH + 4), sb=0.22, vol=0.1)
tune(f(SPLASH + 4), sb=0.22, vol=0.05, voice="glock", shift=12)
# the ravine: alone, minor, slow
tune(f(SIT), sb=0.5, vol=0.08, minor=True, upto=8)
add(music, pad(Am, 2.6, 0.03), f(SIT))
add(music, pad([41, 48, 53, 56], 2.0, 0.03), f(740))
# his friends come back: the tune swells
tune(f(HELP + 14), sb=0.26, vol=0.11)
tune(f(HELP + 14), sb=0.26, vol=0.07, voice="glock")
chord_bed(f(HELP + 14), [F, G, C], 0.95, 0.045)
# the big bubble: rising strings
add(music, pad(F, 1.2, 0.04), f(BIG_BLOW))
add(music, pad(G, 1.0, 0.05), f(BIG_BLOW + 34))
# BOUM: the whole band
for k, (ch, root) in enumerate([(C, 36), (Am, 33), (F, 29), (G, 31)] * 2):
    tb = f(BOUM + 2) + k * 0.92
    add(music, pad(ch, 1.0, 0.045), tb)
    add(music, ks(root, 0.9, 0.18, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum([m + 12 for m in ch], tb + h * 0.23, music, 0.035, down=h % 2 == 0)
        add(music, kick(0.22) if h % 2 == 0 else hat(0.04), tb + h * 0.23)
tune(f(BOUM + 2), sb=0.23, vol=0.12)
tune(f(BOUM + 2), sb=0.23, vol=0.07, voice="glock", shift=12)
# the ending: the tune, warm and slow
tune(f(1090), sb=0.3, vol=0.1)
tune(f(1090), sb=0.3, vol=0.05, voice="glock")
chord_bed(f(1090), [C, F, G, C], 0.9, 0.04)
# finale
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.35), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, whoosh(0.4, 0.05), f(36))  # the door
for k in range(3):
    add(sfx, glock(76 - k * 2, 0.4, 0.05), f(OUT + 14) + k * 0.12)  # yawn
for k in range(8):  # footsteps
    add(sfx, pop(1.4 + (k % 2) * 0.2, 0.04), f(134) + k * 0.14)
add(sfx, glock(70, 0.6, 0.04), f(SEE_FLOWER))
add(sfx, stretch(0.5, 0.05), f(LIFT + 2))  # lifting the flower
colour_chime(f(BLOOM))
sparkle(f(BLOOM + 2), sfx, 0.1)
add(sfx, boing(0.08, 260, 520), f(BLOOM + 20))
for k in range(8):
    add(sfx, pop(1.4 + (k % 2) * 0.2, 0.04), f(266) + k * 0.14)
for k in range(5):  # the cloud sobs
    add(sfx, glock(96 - (k % 2) * 3, 0.15, 0.03), f(SEE_CLOUD) + k * 0.2)
for s in (316, 334):
    add(sfx, boing(0.08, 240, 560), f(s + 4))
add(sfx, stretch(0.6, 0.1), f(BLOW + 2))
add(sfx, whoosh(0.5, 0.05), f(376))
add(sfx, pop(1.2, 0.25), f(FREE))
colour_chime(f(FREE + 2), base=86)
sparkle(f(FREE + 4), sfx, 0.1)
for k in range(8):
    add(sfx, pop(1.4 + (k % 2) * 0.2, 0.04), f(424) + k * 0.14)
for k in range(6):  # the fish flops
    add(sfx, bloop(0.05), f(440) + k * 0.2)
add(sfx, crinkle(0.2, 0.06), f(PICK + 2))
add(sfx, whoosh(0.3, 0.07), f(TOSS))
add(sfx, splat(0.25), f(SPLASH))
colour_chime(f(SPLASH + 2), base=88)
sparkle(f(SPLASH + 4), sfx, 0.1)
add(sfx, slide_whistle(500, 1100, 0.4, 0.06), f(520))
add(sfx, splat(0.15), f(544))
for s in HOPS:
    add(sfx, boing(0.07, 280, 560), f(s + 4))
    add(sfx, pop(1.6, 0.06), f(s + 15))
for k in range(8):
    add(sfx, pop(1.4 + (k % 2) * 0.2, 0.04), f(616) + k * 0.14)
add(sfx, slide_whistle(900, 400, 0.3, 0.08), f(EDGE))  # whoa!
for k in range(3):
    add(sfx, crinkle(0.1, 0.04), f(EDGE + 6) + k * 0.2)  # pebbles fall
add(sfx, glock(70, 1.2, 0.04), f(730))  # a sigh
add(sfx, sweep(600, 900, 0.5, 0.05, vibrato=0.02), f(HELP))  # the cloud calls him
sparkle(f(HELP + 10), sfx, 0.07)
add(sfx, boing(0.08, 260, 520), f(MOUNT + 2))
add(sfx, whoosh(2.4, 0.06), f(RIDE))
add(sfx, slide_whistle(500, 1100, 0.4, 0.05), f(776))  # the fish jumps
add(sfx, pop(1.2, 0.1), f(LAND + 6))
add(sfx, stretch(2.0, 0.12), f(BIG_BLOW + 6))
add(sfx, pop(0.7, 0.8), f(BOUM))
add(sfx, boum(0.7), f(BOUM))
add(sfx, crash(0.2), f(BOUM))
add(sfx, whoosh(2.0, 0.08), f(BOUM + 4))  # the colour wave
for k in range(14):
    add(sfx, glock(84 + [0, 2, 4, 7, 9, 12, 14][k % 7] + 12 * (k // 7), 0.6, 0.05), f(BOUM + 8) + k * 0.12)
sparkle(f(BOUM + 30), sfx, 0.1)
add(sfx, boing(0.08, 260, 520), f(MOUNT2 + 2))
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

write_mp3(music, "ep8colors-music", LENGTH)
write_mp3(sfx, "ep8colors-sfx", LENGTH)
print("wrote ep8colors-music.mp3, ep8colors-sfx.mp3")
