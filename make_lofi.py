import math
import random
import wave
from array import array

RATE = 22050
SECONDS = 24
TAU = math.pi * 2
random.seed(13)

def note(freq, t, attack=.04, decay=.8):
    if t < 0 or t > decay:
        return 0.0
    env = min(1.0, t / attack) * max(0.0, 1.0 - t / decay)
    return math.sin(TAU * freq * t) * env

chords = [
    [261.63, 329.63, 392.00],
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63],
    [196.00, 246.94, 293.66],
]
melody = [
    (659.25, 0.0), (587.33, .75), (523.25, 1.5), (493.88, 2.25),
    (523.25, 4.0), (587.33, 4.75), (659.25, 5.5), (783.99, 6.4),
    (698.46, 8.0), (659.25, 8.75), (587.33, 9.5), (523.25, 10.25),
]

frames = array('h')
for i in range(RATE * SECONDS):
    t = i / RATE
    beat = t % 4.0
    bar = int(t // 4) % len(chords)
    value = 0.0

    for freq in chords[bar]:
        value += .10 * math.sin(TAU * freq * t) + .025 * math.sin(TAU * (freq * 2) * t)

    for freq, start in melody:
        local = (t % 12.0) - start
        value += .10 * note(freq, local, .06, .68)

    # Soft kick and brushed snare on the backbeat.
    kick = beat % 1.0
    value += .14 * math.exp(-kick * 18) * math.sin(TAU * 70 * kick)
    if .48 < beat % 1.0 < .56:
        value += random.uniform(-.05, .05) * (1.0 - (beat % 1.0 - .48) * 12)

    # Gentle tape hiss and filtered rain-like texture.
    value += random.uniform(-1, 1) * .008
    value = max(-.8, min(.8, value))
    sample = int(value * 28000)
    frames.append(sample)
    frames.append(sample)

with wave.open('lofi_cafe.wav', 'wb') as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(RATE)
    out.writeframes(frames.tobytes())
