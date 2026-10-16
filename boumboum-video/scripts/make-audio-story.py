"""Music + cartoon SFX for the "BoumStory" kids' film (Le plus gros BOUM).

Run: python3 scripts/make-audio-story.py -> public/story-music.mp3, public/story-sfx.mp3
Ukulele is a Karplus-Strong plucked string, so it sounds organic rather than chiptune.
Global frames at 30 fps; 120 BPM, one beat = 15 frames.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

LENGTH = 600 / FPS
f = lambda frame: frame / FPS  # noqa: E731


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
play_section(345, 570, full=True)
# ta-da ending on the final pop
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(570) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(570))
add(music, glock(88, 1.2, 0.16), f(577))
add(music, glock(91, 1.4, 0.16), f(584))
add(music, kick(0.4), f(570))

# ---------------- sfx ----------------
sfx = np.zeros_like(music)
for at in (3, 18, 33):
    add(sfx, boing(0.16, 220, 480), f(at))
for at in (14, 29, 44):
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

# "A toi !" close-up
add(sfx, whoosh(0.25, 0.14), f(457))


def slurp(vol=0.25):
    t = t_arr(0.45)
    wet = lowpass(rng.uniform(-1, 1, len(t)), 0.15) * 3
    tone = sweep(300, 700, 0.45, 1.0)
    return vol * (0.6 * wet + 0.4 * tone) * np.sin(np.pi * t / 0.45)


add(sfx, slurp(), f(466))
add(sfx, glock(79, 0.5, 0.12), f(482))  # "mmm"
add(sfx, glock(84, 0.6, 0.12), f(486))
sparkle(f(492), sfx, 0.1)  # "A toi !"
add(sfx, slide_whistle(400, 1100, 0.7, 0.13), f(494))
add(sfx, whoosh(0.6, 0.25), f(500))

# finale
add(sfx, whoosh(0.35, 0.2), f(508))
for k in range(8):
    add(sfx, pop(1 + k * 0.07, 0.18), f(523 + k * 3))
add(sfx, bloop(0.22), f(524))
add(sfx, bloop(0.22), f(530))
add(sfx, stretch(1.0, 0.12), f(540))
add(sfx, pop(0.7, 0.9), f(570))
add(sfx, boum(0.6), f(570))
sparkle(f(574), sfx, 0.12)

write_mp3(music, "story-music", LENGTH)
write_mp3(sfx, "story-sfx", LENGTH)
print("wrote story-music.mp3, story-sfx.mp3")
