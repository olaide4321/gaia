"""Generate the narration voiceover with Kokoro-82M, a free, open (Apache-2.0) neural TTS model.

Runs fully offline once the model files are on disk; no paid API or account is needed.
Writes public/voiceover/vo-01.wav … vo-10.wav, one file per line in src/data/narration.json,
each paced to fit inside its subtitle slot.

Setup (one time), from the ionet-film folder:
    python3 -m venv .venv-tts
    .venv-tts/bin/pip install kokoro-onnx soundfile
    npm pack kokoro-js kokoro-q8-shards            # voices + model weights, from npm
    mkdir -p .tts && tar -xzf kokoro-js-*.tgz -C .tts && mv .tts/package .tts/kokoro-js
    tar -xzf kokoro-q8-shards-*.tgz -C .tts && cat .tts/package/kokoro-q8.part{0,1,2,3,4,5}.bin > .tts/model_quantized.onnx

Run:
    .venv-tts/bin/python scripts/generate-voiceover.py --model .tts/model_quantized.onnx --voices .tts/kokoro-js/voices
"""

import argparse
import json
import pathlib
import tempfile

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Spoken spellings for words the phonemizer would otherwise misread.
PRONUNCIATION = {
    "io.net": "eye oh dot net",
    "GPU": "G.P.U.",
}

SAMPLE_RATE = 24000
LEAD_IN = 0.08  # seconds of silence before each line
FIT_MARGIN = 0.25  # seconds of slot left free at the end of each line


def speakable(text: str) -> str:
    for word, spoken in PRONUNCIATION.items():
        text = text.replace(word, spoken)
    return text


def load_voices(voices_dir: pathlib.Path, names: list[str]) -> str:
    """kokoro-js ships each voice as raw float32 (510, 1, 256); kokoro-onnx wants one .npz."""
    arrays = {n: np.fromfile(voices_dir / f"{n}.bin", dtype=np.float32).reshape(510, 1, 256) for n in names}
    path = pathlib.Path(tempfile.mkdtemp()) / "voices.npz"
    np.savez(path, **arrays)
    return str(path)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="path to Kokoro-82M model_quantized.onnx")
    ap.add_argument("--voices", required=True, help="kokoro-js voices/ folder")
    ap.add_argument("--voice", default="am_michael", help="voice name, e.g. am_michael, bm_george, af_heart")
    ap.add_argument("--speed", type=float, default=0.92, help="preferred speaking speed (slower = more cinematic)")
    args = ap.parse_args()

    narration = json.loads((ROOT / "src/data/narration.json").read_text())
    fps = narration["fps"]
    kokoro = Kokoro(args.model, load_voices(pathlib.Path(args.voices), [args.voice]))
    out_dir = ROOT / "public/voiceover"
    out_dir.mkdir(parents=True, exist_ok=True)

    for line in narration["lines"]:
        slot = (line["to"] - line["from"]) / fps - LEAD_IN - FIT_MARGIN
        speed = args.speed
        while True:
            audio, sr = kokoro.create(speakable(line["text"]), voice=args.voice, speed=speed, lang="en-us")
            duration = len(audio) / sr
            if duration <= slot or speed >= 1.35:
                break
            speed = round(min(1.35, speed * duration / slot + 0.01), 3)
        audio = np.concatenate([np.zeros(int(LEAD_IN * sr), dtype=np.float32), audio.astype(np.float32)])
        peak = float(np.max(np.abs(audio))) or 1.0
        audio = audio / peak * 0.89  # normalise each line to about -1 dBFS
        sf.write(out_dir / f"{line['id']}.wav", audio, sr, subtype="PCM_16")
        status = "ok" if duration <= slot else "LONGER THAN SLOT"
        print(f"{line['id']}: {duration:5.2f}s spoken / {slot + FIT_MARGIN:5.2f}s slot  speed {speed:.2f}  {status}")


if __name__ == "__main__":
    main()
