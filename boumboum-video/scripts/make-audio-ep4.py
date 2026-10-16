"""Music + SFX for Episode 4 "Joyeux anniversaire, Mélo !".

Run: python3 scripts/make-audio-ep4.py -> public/ep4-music.mp3, public/ep4-sfx.mp3
Cosy home theme -> busy preparation -> slapstick -> panic -> tender moment ->
the birthday song (traditional melody, public domain). 30 fps, 120 BPM.
"""
import numpy as np

from kids_synth import *  # noqa: F401,F403
from synth import *  # noqa: F401,F403

LENGTH = 900 / FPS
f = lambda frame: frame / FPS  # noqa: E731
music = np.zeros(int(LENGTH * SR) + SR)
sfx = np.zeros_like(music)


def trombone(m0, m1, dur, vol=0.12):
    """Sad 'wah' slide: a buzzy tone sliding down with vibrato."""
    t = t_arr(dur)
    freq = np.geomspace(note_hz(m0), note_hz(m1), len(t)) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    sig = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)
    return vol * lowpass(sig, 0.25) * np.minimum(t / 0.03, 1) * np.minimum((dur - t) / 0.1, 1)


def doorbell(at):
    add(sfx, glock(79, 1.0, 0.3), at)
    add(sfx, glock(76, 1.4, 0.3), at + 0.35)


def giggle(at, vol=0.1, base=88):
    for k, m in enumerate([0, 3, 0, 5, 1, 7]):
        add(sfx, glock(base + m, 0.15, vol), at + k * 0.07)


def wobble_snd(at, dur, vol=0.12):
    t = t_arr(dur)
    freq = 300 * (1 + 0.25 * np.sin(2 * np.pi * np.linspace(3, 9, len(t)) * t))
    add(sfx, vol * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.minimum(t / dur * 1.5, 1), at)


C, Am, F, G = [60, 64, 67, 72], [57, 64, 69, 72], [57, 65, 69, 72], [55, 62, 67, 71]
Dm = [57, 62, 65, 69]


def bed(start, end, prog, vol=1.0, mel=None, mel_vol=0.12, pizz=False):
    t0 = f(start)
    beats = int((end - start) / 15)
    for b in range(beats):
        tb = t0 + b * BEAT
        chord, root = prog[(b // 4) % len(prog)]
        if pizz:
            add(music, ks(root - 12, 0.2, 0.22 * vol, bright=0.6, decay=0.98), tb)
            add(music, ks(root - 5, 0.2, 0.14 * vol, bright=0.6, decay=0.98), tb + BEAT / 2)
            if b % 2:
                add(music, snap(0.12 * vol), tb)
        else:
            if b % 2 == 0:
                add(music, ks(root - 12, 0.6, 0.26 * vol, bright=0.3, decay=0.995), tb)
                add(music, kick(0.25 * vol), tb)
            else:
                add(music, snap(0.14 * vol), tb)
            strum(chord, tb + BEAT / 2, music, 0.08 * vol, down=b % 2 == 0)
            add(music, shaker(0.035 * vol), tb + BEAT / 2)
    if mel:
        for beat, m, ln in mel:
            if beat < beats:
                add(music, glock(m, 0.5 + ln * 0.3, mel_vol), t0 + beat * BEAT)


home = [(C, 48), (F, 41), (Am, 45), (G, 43)]
cosy = [(0, 76, 1), (1, 79, 1), (2, 77, 0.5), (2.5, 76, 0.5), (3, 74, 1), (4, 72, 1), (5, 74, 1), (6, 76, 2),
        (8, 77, 1), (9, 81, 1), (10, 79, 0.5), (10.5, 77, 0.5), (11, 76, 1), (12, 74, 2)]

# ---------------------------------------------------------------- music
bed(0, 124, home, vol=0.8, mel=cosy)
add(music, ks(43, 1.0, 0.25, bright=0.6, decay=0.996), f(138))  # the double take "dun"
add(music, ks(55, 1.0, 0.2, bright=0.6, decay=0.996), f(138))
for k, m in enumerate([72, 76, 79, 84]):  # calendar circle drawn
    add(music, glock(m, 0.5, 0.1), f(146) + k * 0.12)
# preparation: bouncy pizzicato
prep = [(0, 84, 0.5), (0.5, 81, 0.5), (1, 84, 0.5), (1.5, 81, 0.5), (2, 79, 1), (4, 77, 0.5), (4.5, 79, 0.5), (5, 81, 1), (6, 84, 1)]
bed(196, 296, [(F, 41), (C, 48), (G, 43), (C, 48)], vol=0.9, mel=prep, mel_vol=0.09, pizz=True)
add(music, trombone(62, 60, 0.35), f(298))
add(music, trombone(61, 59, 0.35), f(310) - 0.2)
# cake: drumroll then sad trombone
for k in range(18):
    add(music, snap(0.06 + k * 0.006), f(304) + k * 0.025)
add(music, trombone(60, 58, 0.4, 0.13), f(342))
add(music, trombone(59, 57, 0.4, 0.13), f(354))
add(music, trombone(58, 51, 0.9, 0.13), f(366))
# panic run + nervous wait
for k in range(12):
    add(music, ks(48 + k, 0.15, 0.16, bright=0.7, decay=0.98), f(380) + k * 0.07)
bed(404, 506, [([57, 60, 64], 45), ([56, 59, 64], 44)], vol=0.7, pizz=True)
for k, m in enumerate([45, 48, 50, 52]):  # Mélo's "Yo" lick
    add(music, ks(m, 0.3, 0.25, bright=0.4, decay=0.99), f(468) + k * 0.12)
# the reveal... a tender music box
for k, (beat, m) in enumerate([(0, 76), (1, 79), (2, 84), (3, 83), (4, 79), (5, 76), (6, 77), (7, 74)]):
    add(music, glock(m, 1.2, 0.11), f(530) + beat * BEAT * 0.9)
add(music, pad([60, 64, 67], 2.0, 0.05), f(530))
add(music, pad([57, 65, 69], 1.6, 0.05), f(565))
# the hug: warm strums
bed(600, 704, [(F, 41), (C, 48), (G, 43), (C, 48)], vol=0.8, mel=[(0, 81, 2), (2, 79, 1), (3, 77, 1), (4, 76, 2), (6, 79, 2)], mel_vol=0.1)
# the wish: hush + rising glock roll
for k in range(20):
    add(music, glock(72 + [0, 4, 7, 12][k % 4] + 12 * (k // 10), 0.4, 0.05 + k * 0.003), f(714) + k * 0.08)
add(music, pad([60, 64, 67, 72], 1.8, 0.05), f(716))
# the birthday song (traditional), brisk, over the party
hb = [(0, 67, 0.75), (0.75, 67, 0.25), (1, 69, 1), (2, 67, 1), (3, 72, 1), (4, 71, 2),
      (6, 67, 0.75), (6.75, 67, 0.25), (7, 69, 1), (8, 67, 1), (9, 74, 1), (10, 72, 2)]
sb = 0.3  # seconds per beat
t0 = f(770)
for beat, m, ln in hb:
    add(music, glock(m + 12, 0.4 + ln * 0.25, 0.17), t0 + beat * sb)
    add(music, ks(m, 0.3 + ln * 0.2, 0.08, bright=0.6, decay=0.99), t0 + beat * sb)
for b in range(12):
    chord, root = [(C, 48), (C, 48), (G, 43), (G, 43), (G, 43), (G, 43), (G, 43), (G, 43), (C, 48), (C, 48), (C, 48), (C, 48)][b]
    add(music, ks(root - 12, 0.3, 0.22, bright=0.3, decay=0.99), t0 + b * sb)
    strum(chord, t0 + b * sb + sb / 2, music, 0.07, down=b % 2 == 0)
    add(music, kick(0.2), t0 + b * sb)
# finale (shared beats)
bed(820, 870, home, vol=0.8)
for m in [60, 64, 67, 72, 76]:
    add(music, ks(m, 1.6, 0.13, bright=0.6, decay=0.997), f(870) + (m - 60) * 0.004)
add(music, glock(84, 1.2, 0.2), f(870))
add(music, glock(88, 1.2, 0.16), f(877))
add(music, glock(91, 1.4, 0.16), f(884))
add(music, kick(0.4), f(870))

# ---------------------------------------------------------------- sfx
add(sfx, glock(96, 0.6, 0.06), f(10))
for at in (70, 89, 108):
    add(sfx, boing(0.12, 220, 460), f(at + 5))
    add(sfx, bloop(0.2), f(at + 15))
add(sfx, slide_whistle(500, 1300, 0.2, 0.1), f(136))
add(sfx, glock(96, 0.4, 0.14), f(184))  # idea "ting"
sparkle(f(185), sfx, 0.06)
add(sfx, pop(1.2, 0.3), f(202))  # banner
sparkle(f(204), sfx, 0.05)
for b in (212, 232, 252):
    add(sfx, stretch(0.4, 0.14), f(b + 4))
    add(sfx, bloop(0.14), f(b + 16))
for k, p in enumerate((282, 287, 292)):
    add(sfx, pop(1.1 + k * 0.15, 0.6), f(p))
add(sfx, whoosh(0.3, 0.1), f(304))  # cherry toss
add(sfx, pop(2.0, 0.15), f(318))  # plink
wobble_snd(f(320), 0.7)
add(sfx, splat(0.6), f(340))
add(sfx, pop(0.4, 0.5), f(340))
doorbell(f(376))
add(sfx, slide_whistle(500, 1500, 0.25, 0.13), f(378))
for k in range(6):
    add(sfx, pop(1.6 + (k % 2) * 0.3, 0.09), f(390 + k * 4))
add(sfx, whoosh(0.25, 0.1), f(396))  # banner falls
add(sfx, boing(0.1, 400, 200), f(400))
add(sfx, whoosh(0.4, 0.12), f(410))  # door opens
for at in (420, 439):
    add(sfx, boing(0.1, 260, 420), f(at + 5))
    add(sfx, bloop(0.15), f(at + 15))
add(sfx, snap(0.12), f(466))  # finger flick
add(sfx, glock(100, 0.6, 0.06), f(548))  # the tear
for at in (582,):
    add(sfx, boing(0.1, 260, 420), f(at + 5))
    add(sfx, bloop(0.18), f(at + 15))
add(sfx, bloop(0.3), f(604))  # squishy hug
sparkle(f(608), sfx, 0.07)
giggle(f(620), 0.06, 84)
add(sfx, pop(1.3, 0.2), f(652))  # gift appears
sparkle(f(670), sfx, 0.09)
add(sfx, boing(0.1, 260, 420), f(707))
add(sfx, stretch(1.0, 0.14), f(718))
add(sfx, glock(96, 0.8, 0.12), f(744))  # bubbles merge into a heart
add(sfx, glock(100, 0.8, 0.1), f(746))
add(sfx, pop(0.55, 0.9), f(766))
add(sfx, boum(0.8), f(766))
for k in range(30):  # confetti crackle
    add(sfx, pop(2.4 + (k % 5) * 0.2, 0.04), f(768) + k * 0.05)
giggle(f(776), 0.09)
giggle(f(790), 0.08, 84)
# finale
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

write_mp3(music, "ep4-music", LENGTH)
write_mp3(sfx, "ep4-sfx", LENGTH)
print("wrote ep4-music.mp3, ep4-sfx.mp3")
