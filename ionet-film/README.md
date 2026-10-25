# THE WORLD'S IDLE MACHINES

A 40-second cinematic film about **io.net**, built in code with [Remotion](https://www.remotion.dev/), React and TypeScript.

* 1920×1080 · 30 fps · 1,200 frames · H.264 MP4
* The animated parts are code-generated (SVG, Canvas and CSS): the globe network, the dashboards and the flood map.
* Nine photographs supplied by the project owner (in `public/photos/`) get a light, natural colour grade and slow camera moves.
* Calm, uplifting background music runs from start to finish, with light sound effects. It is all synthesised by a script (oscillators and noise), with no audio samples.
* Large burned-in subtitles with key phrases in gold, also exported as `.srt` and `.vtt`.
* The narration is voiced by the free, open Kokoro-82M AI voice model, generated offline (see [NARRATION.md](NARRATION.md)). You can swap in your own recordings.

## The story

| Time | Act | What you see |
|---|---|---|
| 0–8 s | **The Problem** | Rain over the city at night, then Lagos at night (the Civic Centre tower and the expressway), with lightning. A Lagos AI engineer works late at his desk, and his project stalls: *TRAINING PAUSED — insufficient compute*. |
| 8–14 s | **The Invisible Resources** | Idle machines: an empty office in Toronto, GPU racks in a Seoul data facility, then a montage grid of idle machines worldwide. |
| 14–26 s | **The Discovery** | GPUs linked by streams of light, then a dotted globe. GPU nodes ignite outward from Lagos and connect through golden arcs. io.net is introduced, and the network converges in an anamorphic flare. |
| 26–33 s | **The Possibility** | Back at his desk, his (fictional) workload resumes on distributed workers, first light over Lagos, training completes, and a flood-risk map of Lagos sweeps onto the screen. |
| 33–40 s | **The Reveal** | Pull back through a glowing network, then the io.net end card over a golden globe: *Distributed GPU compute. Connected for what's next.* |

---

## Quick start (step by step for beginners)

### 1. Install Node.js
Download the **LTS** version from <https://nodejs.org> and install it. Check it worked by opening a terminal and running:

```bash
node -v   # should print v18 or newer
```

### 2. Install the project
```bash
cd ionet-film
npm install
```

### 3. Preview it live (optional)
```bash
npm run studio
```
This opens Remotion Studio in your browser, where you can scrub the timeline frame by frame. Edits to the code update the preview instantly.

### 4. Render the MP4
```bash
npm run render
```
The video is written to **`out/the-worlds-idle-machines.mp4`**.

The first render downloads a headless Chrome automatically, which takes about a minute. The render itself takes roughly 10–20 minutes on a typical 4-core laptop.

> **No internet, or the Chrome download is blocked?** Point Remotion at a Chrome or Chromium you already have:
> ```bash
> REMOTION_BROWSER_EXECUTABLE="/path/to/chrome" npm run render
> ```

---

## Customising

Almost everything you'd want to change lives in **`src/config.ts`**:

| Setting | What it does |
|---|---|
| `VOICEOVER.mode` | `'lines'` (default), `'none'` (eight files `public/voiceover/vo-01.wav` … `vo-08.wav`) or `'full'` (one file `public/voiceover/full.wav`) |
| `SCORE.volume` / `duckedVolume` | Music level, and the level it eases down to under each narration line, so the voice stays clear while the music stays audible. |
| `SUBTITLES.burnIn` / `size` | `false` for a clean picture (the `.srt` is still generated); `size` is the font size in pixels. The gold words come from each line's `highlight` list in `src/data/narration.json`. |
| `LOGO.file` | `'auto'` (default) detects `public/ionet-logo.svg`, `.png` or `.webp`. Until one exists, a typographic **placeholder** wordmark is shown. |
| `LOGO.tint` | `'original'` keeps the logo's colours; `'ivory'` recolours it to the film's ivory |

### Using the official io.net logo
The official logo appears **everywhere io.net is shown on screen**: the introduction in Act 3 (about 0:29) and the end card (about 0:55). It keeps the gold glow and light-sweep effects.

The logo file isn't bundled, so you need to add it yourself:
1. Download the logo from io.net's media kit: <https://io.net/media-kit>. Pick the **white** version, because the film is dark. SVG is best.
2. Rename it to **`ionet-logo.svg`** (or `ionet-logo.png`) and put it in **`ionet-film/public/`**.
3. Run `npm run render`. The logo is detected automatically; no code changes are needed.

If you only have the black version, set `LOGO.tint: 'ivory'` in `src/config.ts`. To resize the logo, change `LOGO.height`.

Use of the logo is subject to io.net's brand guidelines on that page, so don't stretch or alter it.

> The subtitles still spell out "io.net" as text, so they stay readable and accessible.

### Photographs
The photos live in `public/photos/` and are placed by the scene files in `src/scenes/` with the `<Photo>` component (`src/components/Photo.tsx`).

| File | Used in |
|---|---|
| `rain-night-city.jpg` | Act 1 opening title |
| `lagos-night.jpg` | Act 1, "Lagos, Nigeria" |
| `engineer.jpg` | Act 1 wide shot and face close-up; Act 4 medium shot |
| `idle-office.jpg` | Act 2, Toronto office |
| `gpu-racks.jpg` | Act 2, Seoul data facility (cropped to leave out the padlock) |
| `gpus-connected.jpg` | Act 3 opening |
| `lagos-aerial-dawn.jpg` | Act 4, first light over Lagos |
| `network-surface.jpg` | Act 5 pull-back |
| `gold-globe.jpg` | Act 5 end-card backdrop |

To swap a photo, replace the file and keep its name. `<Photo grade="amber" | "warm" | "golden" | "hope">` sets the colour treatment. All four are light; `amber` mainly tones down strong blue light. Make sure you have the rights to any image you publish.

### The voiceover
The ten narration files in `public/voiceover/` were made with **Kokoro-82M**, a free, open (Apache-2.0) neural text-to-speech model, using the voice `am_michael`. It runs offline on your computer, with no paid API or account. The model weights come from the npm package `kokoro-q8-shards` and the voices from `kokoro-js`. The setup steps are at the top of `scripts/generate-voiceover.py`.

* **Change the voice:** run the script with `--voice`, for example `bm_george` (British male) or `af_heart` (American female). Then run `npm run render`.
* **Change the wording:** edit `src/data/narration.json`, then run the script again. Each line is paced automatically to fit its time slot.
* **Use your own recordings:** replace the files, keeping the names `vo-01.wav` … `vo-08.wav`. See [NARRATION.md](NARRATION.md) for timings and tips.

### Changing narration text or timing
Edit **`src/data/narration.json`**. Each act there has a slot (`from`/`to`) and a `designFrames` length; the act's shots are designed on that timeline and played back at the speed that fits the slot (see `src/time.tsx`). The soundtrack follows the same act boundaries. The file is the single source of truth for:
* the burned-in subtitles,
* `subtitles/the-worlds-idle-machines.srt` and `.vtt` (regenerated by `npm run subtitles`),
* where each voiceover file starts (`lines` mode),
* the act boundaries used by the film and the soundtrack.

### Changing the music
Edit `scripts/generate-soundtrack.mjs`, then run `npm run audio`. The background music is a calm piece in D major at about 86 BPM (chords D, A, Bm, G):
* **Opening:** soft piano.
* **From 8 s:** warm pads and bass join.
* **14–33 s:** a gentle pulse and a bell melody join.
* **Ending:** it resolves on D.

The instruments and sections are commented in the script, alongside light rain, soft transition swells, ignition chimes and the logo shimmer.

---

## Project layout

```
ionet-film/
├── src/
│   ├── config.ts              ← film settings (voiceover, logo, subtitles, music)
│   ├── data/narration.json    ← narration lines + timings (drives subtitles & VO)
│   ├── data/geo.ts            ← hand-drawn simplified continents + city nodes
│   ├── Film.tsx               ← assembles acts, overlays, audio
│   ├── scenes/                ← Act1Problem … Act5Reveal
│   └── components/            ← Globe, Photo, Rain,
│                                 screens/flood map, flares, grain, letterbox, subtitles
├── scripts/
│   ├── generate-soundtrack.mjs  → public/audio/score.wav
│   ├── generate-voiceover.py    → public/voiceover/vo-01.wav … vo-08.wav
│   └── generate-subtitles.mjs   → subtitles/*.srt, *.vtt
├── subtitles/                 ← generated subtitle files
├── public/photos/             ← supplied photographs (lightly graded in code)
├── public/ionet-logo.png      ← official io.net logo
├── public/voiceover/          ← narration, one WAV per line (AI-generated; replaceable)
├── NARRATION.md               ← narration script with timings and recording tips
└── out/                       ← rendered video (git-ignored)
```

## Commands

| Command | Does |
|---|---|
| `npm run studio` | Generate audio and subtitles, then open the live preview |
| `npm run render` | Generate audio and subtitles, then render the MP4 |
| `npm run still` | Render a single frame (frame 600) to `out/still.png` |
| `npm run audio` | Regenerate the soundtrack only |
| `npm run subtitles` | Regenerate the `.srt` and `.vtt` only |
| `npm run typecheck` | Type-check the TypeScript |

## Troubleshooting

* **`getaddrinfo ENOTFOUND` while downloading Chrome**: your network blocks the download. Use `REMOTION_BROWSER_EXECUTABLE` (see above).
* **Render is slow or runs out of memory**: lower the parallelism with `npm run render -- --concurrency=2`.
* **No sound**: make sure `public/audio/score.wav` exists (`npm run audio`). `npm run render` creates it automatically.
* **Voiceover file not found**: check the file names match `vo-01.wav` … `vo-08.wav` and that `VOICEOVER.extension` matches your file type.

## Disclaimers

* The engineer's story, his FLOODWATCH-LAGOS project and all on-screen figures are **fictional**. The film doesn't claim that io.net powered any real flood prediction, and it says so in the final seconds.
* The globe's nodes and arcs are an artistic visualization, not real network data.
* The io.net logo and the photographs in `public/photos/` were supplied by the project owner, who is responsible for having the rights to use them.
