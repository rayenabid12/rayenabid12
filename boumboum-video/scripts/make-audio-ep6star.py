"""Music + SFX for Episode 6 "L'Étoile tombée" (45 s).

Run: python3 scripts/make-audio-ep6star.py -> public/ep6star-music.mp3, public/ep6star-sfx.mp3
One lullaby melody carries the whole story: music box at night, playful while
they play, minor and slowing as her light fades, almost silent at the choice,
full and soaring as she rises home, warm at the end.
Frame numbers must match FallenStarScene.tsx. 30 fps.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

TOTAL = 1350
LENGTH = TOTAL / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)

FALL, LANDED, DOOR, PEEK, REVEAL, TO_HANDS = 70, 118, 126, 196, 206, 246
HIDE, FOUND, SKY, WEAK, REALIZE, HUG, DECIDE = 300, 342, 432, 500, 620, 640, 730
STAND, BLOW, INSIDE, RELEASE, HOME, SPARKLE, END = 760, 772, 866, 900, 1010, 1095, 1268
BUBBLES, BOUNCES = (364, 380, 396), (384, 400, 416)
END_POP = END - 12 + 60

# the lullaby (F major), as (beat, midi, length) at a slow 3/4
LULLABY = [(0, 72, 1), (1, 77, 1), (2, 81, 1), (3, 79, 2), (5, 77, 1), (6, 76, 1), (7, 77, 1), (8, 79, 1), (9, 81, 3),
           (12, 84, 1), (13, 81, 1), (14, 79, 1), (15, 77, 2), (17, 76, 1), (18, 74, 1), (19, 76, 1), (20, 77, 4)]


def lullaby(at, sb=0.42, vol=0.12, shift=0, minor=False, voice="glock", fade=False):
    for k, (beat, m, ln) in enumerate(LULLABY):
        mm = m + shift
        if minor and (mm % 12) in (9, 4):  # A -> Ab, E -> Eb: a darker colour
            mm -= 1
        v = vol * (1 - k / len(LULLABY) * 0.6 if fade else 1)
        t = at + beat * sb
        if voice == "glock":
            add(music, glock(mm, 0.9 + ln * sb, v), t)
        else:
            add(music, ks(mm, 0.6 + ln * sb, v * 1.6, bright=0.45, decay=0.997), t)


def chime(at, vol=0.1, base=84):
    for k, m in enumerate([0, 4, 7, 12, 16]):
        add(sfx, glock(base + m, 0.8, vol), at + k * 0.05)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


def fizz(at, dur=0.4, vol=0.04):
    t = t_arr(dur)
    add(sfx, vol * lowpass(rng.uniform(-1, 1, len(t)), 0.7) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * t))) * np.sin(np.pi * t / dur), at)


F, Dm, Bb, C = [53, 57, 60, 65], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]
Am, Dmi, Gm = [45, 52, 57, 60], [50, 53, 57, 62], [43, 50, 55, 58]

# ---------------------------------------------------------------- music
lullaby(f(4), vol=0.11)  # night, music box
add(music, pad(F, 4.0, 0.035), f(4))
add(music, pad(Bb, 3.5, 0.035), f(150))
# he comes out: tiptoe pizzicato
for k, m in enumerate([65, 69, 72, 69, 65, 69, 72, 77]):
    add(music, ks(m, 0.15, 0.11, bright=0.7, decay=0.97), f(DOOR + 8) + k * 0.3)
add(music, pad([60, 65, 69, 72], 2.5, 0.04), f(TO_HANDS))
# friendship: the lullaby turns playful (faster, plucked)
lullaby(f(HIDE), sb=0.2, vol=0.09, voice="pluck")
for b in range(int((SKY - HIDE) / 7.5)):
    add(music, ks([41, 48, 45, 48][b % 4], 0.18, 0.14, bright=0.5, decay=0.98), f(HIDE) + b * 0.25)
# the sky: wonder
add(music, pad([65, 69, 72, 77], 2.4, 0.045), f(SKY + 10))
for k, m in enumerate([77, 81, 84, 89]):
    add(music, glock(m, 1.2, 0.07), f(450) + k * 0.25)
# she weakens: the lullaby in minor, slowing, fading
lullaby(f(WEAK + 10), sb=0.55, vol=0.11, minor=True, fade=True)
add(music, pad(Dmi, 3.0, 0.04), f(WEAK + 10))
add(music, pad(Gm, 3.0, 0.035), f(590))
# the choice: almost silence, a few low notes
for k, (m, at) in enumerate([(57, HUG + 10), (53, 680), (50, 712), (57, DECIDE)]):
    add(music, ks(m, 2.0, 0.12, bright=0.35, decay=0.998), f(at))
add(music, pad(Am, 3.5, 0.03), f(HUG + 10))
# the big bubble: strings swell
add(music, pad(F, 3.0, 0.04), f(STAND))
add(music, pad(Bb, 2.0, 0.05), f(BLOW + 50))
add(music, pad(C, 1.6, 0.06), f(INSIDE - 10))
# release: the lullaby, full and soaring, home
lullaby(f(RELEASE + 4), sb=0.24, vol=0.13)
for k, (chord, root) in enumerate([(F, 41), (Dm, 38), (Bb, 34), (C, 36)]):
    tb = f(RELEASE + 4) + k * 0.96
    add(music, pad(chord, 1.1, 0.05), tb)
    add(music, ks(root, 1.0, 0.18, bright=0.3, decay=0.997), tb)
    for h in range(4):
        strum([m + 12 for m in chord], tb + h * 0.24, music, 0.04, down=h % 2 == 0)
for k, m in enumerate([77, 81, 84, 89, 93]):
    add(music, glock(m, 1.6, 0.12), f(HOME) + k * 0.07)
add(music, pad([65, 69, 72, 77], 2.5, 0.06), f(HOME))
# alone, then her sparkle: the lullaby, warm and gentle, to the end
add(music, pad(Dm, 2.0, 0.03), f(1046))
lullaby(f(SPARKLE + 22), sb=0.34, vol=0.11, voice="pluck")
lullaby(f(SPARKLE + 22), sb=0.34, vol=0.06)
for k, (chord, root) in enumerate([(F, 41), (Bb, 34), (C, 36), (F, 41)]):
    add(music, pad(chord, 1.9, 0.04), f(SPARKLE + 22) + k * 1.36)
# finale
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(END_POP) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(END_POP))
add(music, glock(88, 1.2, 0.16), f(END_POP + 7))
add(music, glock(91, 1.4, 0.16), f(END_POP + 14))
add(music, kick(0.35), f(END_POP))

# ---------------------------------------------------------------- sfx
add(sfx, whoosh(1.6, 0.08), f(FALL))  # the shooting star
for k in range(10):
    add(sfx, glock(96 - k, 0.3, 0.05), f(FALL) + k * 0.15)
add(sfx, glock(100, 0.8, 0.12), f(LANDED))  # "tink" in the bush
add(sfx, whoosh(0.4, 0.05), f(DOOR - 4))  # the door
for k in range(6):
    add(sfx, pop(1.4 + (k % 2) * 0.2, 0.04), f(DOOR + 22 + k * 14))
add(sfx, whoosh(0.3, 0.05), f(PEEK))  # leaves
chime(f(REVEAL), 0.08)
add(sfx, glock(91, 0.8, 0.08), f(TO_HANDS + 10))
giggle(f(266), 0.06, 91)
add(sfx, whoosh(0.25, 0.06), f(HIDE))
chime(f(FOUND), 0.07, 88)
giggle(f(356), 0.09, 91)
for b in BUBBLES:
    add(sfx, stretch(0.35, 0.1), f(b + 4))
for i, b in enumerate(BOUNCES):
    add(sfx, boing(0.09, 300 + i * 80, 600 + i * 80), f(b))
    add(sfx, pop(1.6, 0.15), f(b + 3))
    giggle(f(b + 2), 0.05, 93)
chime(f(SKY + 14), 0.05, 89)
for at in (522, 548, 576, 604):  # her light flickers
    fizz(f(at), 0.4, 0.035)
add(sfx, glock(100, 0.7, 0.05), f(668))  # the tear
add(sfx, stretch(2.6, 0.12), f(BLOW + 6))
chime(f(INSIDE), 0.08, 89)
add(sfx, glock(93, 1.2, 0.08), f(880))  # their hands meet
add(sfx, whoosh(3.0, 0.04), f(RELEASE + 10))
add(sfx, glock(100, 0.7, 0.04), f(924))  # his tear
add(sfx, pop(1.2, 0.25), f(HOME))
sparkle(f(HOME + 2), sfx, 0.12)
for k in range(12):  # the constellation lights up, star by star
    add(sfx, glock(84 + [0, 2, 4, 7, 9, 12][k % 6] + 12 * (k // 6), 0.6, 0.06), f(HOME + 4) + k * 0.08)
for k in range(8):  # her sparkle falls to him
    add(sfx, glock(100 - k * 2, 0.25, 0.06), f(SPARKLE) + k * 0.07)
add(sfx, glock(96, 0.5, 0.1), f(SPARKLE + 18))
giggle(f(SPARKLE + 24), 0.08)
# finale
F0 = END - 12
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

write_mp3(music, "ep6star-music", LENGTH)
write_mp3(sfx, "ep6star-sfx", LENGTH)
print("wrote ep6star-music.mp3, ep6star-sfx.mp3")
