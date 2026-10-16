"""Moody purple "practical light" grade for the talking-head clip.

The person is separated from the room with MediaPipe's selfie_multiclass
segmenter, so the room can go dark and purple (like LED-lit creator rooms)
while skin keeps its natural tone. A purple rim light is added along the
silhouette edge so the subject sits in the same light.

Usage:
  python3 scripts/purple_grade.py MODEL.tflite IN.mp4 OUT_VIDEO_ONLY.mp4 [--frame N OUT.png]
"""

import subprocess
import sys

import cv2
from ai_edge_litert.interpreter import Interpreter
import numpy as np

MODEL, SRC, DST = sys.argv[1], sys.argv[2], sys.argv[3]
SINGLE = None
if len(sys.argv) > 4 and sys.argv[4] == "--frame":
    SINGLE = (int(sys.argv[5]), sys.argv[6])

PURPLE = np.array([1.0, 0.42, 0.62])  # BGR multiplier for the room light
RIM = np.array([255, 90, 170], dtype=np.float32)  # BGR rim colour (violet)

interp = Interpreter(MODEL)
interp.allocate_tensors()
inp = interp.get_input_details()[0]["index"]
outp = interp.get_output_details()[0]["index"]


def person_prob(bgr):
    """Probability that each pixel is the person (1 - background softmax)."""
    x = cv2.resize(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), (256, 256)).astype(np.float32) / 255.0
    interp.set_tensor(inp, x[None])
    interp.invoke()
    logits = interp.get_tensor(outp)[0]
    e = np.exp(logits - logits.max(-1, keepdims=True))
    sm = e / e.sum(-1, keepdims=True)
    # classes: 0 bg, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 other
    return sm[..., 1:5].sum(-1)


cap = cv2.VideoCapture(SRC)
fps = cap.get(cv2.CAP_PROP_FPS)
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

writer = None
if SINGLE is None:
    writer = subprocess.Popen(
        [
            "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
            "-s", f"{w}x{h}", "-r", str(fps), "-i", "-",
            "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-g", "15",
            "-pix_fmt", "yuv420p", DST,
        ],
        stdin=subprocess.PIPE,
    )

# Soft light falling off from the top-right corner, like a purple LED strip.
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
glow = np.exp(-(((xx - w * 1.05) / (w * 0.9)) ** 2 + ((yy - h * 0.15) / (h * 0.55)) ** 2))
glow2 = np.exp(-(((xx + w * 0.1) / (w * 0.7)) ** 2 + ((yy - h * 0.75) / (h * 0.5)) ** 2))
vign = 1 - 0.55 * np.clip(((xx - w / 2) / (w * 0.75)) ** 2 + ((yy - h * 0.42) / (h * 0.7)) ** 2, 0, 1)


def curve(x, lift, gain, gamma):
    return np.clip(lift + (gain - lift) * np.power(np.clip(x, 0, 1), gamma), 0, 1)


prev = None
idx = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    person = cv2.resize(person_prob(frame), (w, h), interpolation=cv2.INTER_CUBIC)
    # Fill small holes (hands over the shirt) and clean specks.
    person = cv2.morphologyEx(person, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    if prev is not None:
        person = 0.6 * person + 0.4 * prev  # temporal smoothing, avoids edge flicker
    prev = person
    # Tight matte: steep threshold, erode 3px so no bright wall fringe survives.
    m = np.clip((person - 0.4) / 0.35, 0, 1)
    # Keep only the largest blob (the speaker) and fill enclosed holes such as
    # dark shirt folds that the model reads as background.
    binm = (m > 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(binm, 8)
    if n > 1:
        keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        binm = (lab == keep).astype(np.uint8)
    flood = (1 - binm).copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    border = [(x0, 0) for x0 in range(0, w, 30)]
    border += [(0, y0) for y0 in range(0, h, 30)] + [(w - 1, y0) for y0 in range(0, h, 30)]
    for pt in border:  # room is whatever background touches the frame edge
        if flood[pt[1], pt[0]] == 1:
            cv2.floodFill(flood, ff, pt, 2)
    holes = (flood == 1).astype(np.float32)
    solid = np.clip(binm + holes, 0, 1)
    # Lower body: fill each row between the outermost person pixels, so dark
    # shirt areas touching the bottom edge are never treated as room.
    y_torso = int(h * 0.6)
    rows = solid[y_torso:]
    has = rows.max(1) > 0
    left = np.where(has, rows.argmax(1), 0)
    right = np.where(has, w - 1 - rows[:, ::-1].argmax(1), -1)
    # The torso only widens toward the bottom: carry the widest span downward.
    left = np.minimum.accumulate(np.where(has, left, w))
    right = np.maximum.accumulate(right)
    cols = np.arange(w)[None, :]
    span = ((cols >= left[:, None]) & (cols <= right[:, None])).astype(np.float32)
    solid[y_torso:] = np.maximum(rows, span)
    holes = np.maximum(holes, solid * (1 - binm))
    core = cv2.erode(solid, np.ones((31, 31), np.uint8))
    m = np.maximum(np.maximum(m * binm, holes), core)  # solid inside, soft only at the edge
    m = cv2.erode(m, np.ones((3, 3), np.uint8))
    m = cv2.GaussianBlur(m, (0, 0), 2.2)
    m3 = m[..., None]

    f = frame.astype(np.float32) / 255.0
    luma = (0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2])[..., None]

    # Room: a dark room lit by purple practicals. Keep wall texture from luma,
    # fall off to near-black, and only the light pools carry saturated colour.
    light = 0.07 + 0.5 * glow[..., None] + 0.22 * glow2[..., None]
    base = curve(luma, 0.0, 1.0, 1.5) * light
    neutral = base * np.array([0.92, 0.85, 0.9])          # dim, slightly violet grey
    coloured = base * np.array([1.0, 0.45, 0.78])          # BGR purple light
    k = np.clip(light * 1.6, 0, 1)                        # brighter = more colour
    room = neutral * (1 - k) + coloured * k
    room *= vign[..., None]

    # Subject: natural skin, exposed down to sit in the darker room, with
    # violet spill in the shadows and a warm key preserved on the face.
    subj = curve(f, 0.0, 0.9, 1.22)
    shadow = (1 - luma) ** 3
    subj = subj + shadow * np.array([0.05, -0.012, 0.02])
    subj = subj * (0.82 + 0.18 * vign[..., None])

    # Rim light: thin violet edge on the side facing the light.
    inner = cv2.GaussianBlur(m, (0, 0), 6)
    rim = np.clip(m - inner, 0, 1) * 2.0
    rim *= 0.25 + 1.1 * glow + 0.4 * glow2
    rim3 = rim[..., None]
    subj = 1 - (1 - subj) * (1 - rim3 * RIM / 255.0 * 0.6)  # screen blend

    out = room * (1 - m3) + subj * m3
    # Gentle film finish: lifted blacks, rolled-off highlights.
    out = 0.025 + 0.95 * np.clip(out, 0, 1)
    out = np.clip(out, 0, 1)
    out8 = (out * 255).astype(np.uint8)

    if SINGLE is not None:
        if idx == SINGLE[0]:
            cv2.imwrite(SINGLE[1], out8)
            break
    else:
        writer.stdin.write(out8.tobytes())
    idx += 1

if writer is not None:
    writer.stdin.close()
    writer.wait()
