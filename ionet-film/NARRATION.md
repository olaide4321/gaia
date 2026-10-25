# Narration script: *THE WORLD'S IDLE MACHINES*

**Runtime:** 40 seconds · **Tone:** calm, intimate and assured, like a documentary narrator who believes what they're saying. It's a short spot, so keep the energy up without rushing.

The timings below are fixed by `src/data/narration.json`. That file also drives the burned-in subtitles, the `.srt`/`.vtt` files and (in `lines` mode) where each voice file is placed.

| File name | Starts | Ends | Line | Direction |
|---|---|---|---|---|
| `vo-01` | 0:00.5 | 0:03.3 | Humanity learned to build intelligence. | Quiet, almost proud. |
| `vo-02` | 0:03.5 | 0:07.9 | But what happens when the world needs more computing power than it can afford? | Let the question hang. Slight weight on *afford*. |
| `vo-03` | 0:08.3 | 0:13.9 | Across the world, computing power sits unused, while innovators struggle to reach it. | Observational, then a touch of frustration. |
| `vo-04` | 0:14.6 | 0:17.8 | What if these scattered resources could work together? | Wonder. This is the turn. |
| `vo-05` | 0:18.1 | 0:25.9 | io.net brings distributed GPU resources together through a decentralized computing network. | Clear and confident. Say "eye-oh dot net". |
| `vo-06` | 0:26.6 | 0:30.7 | The next breakthrough might begin with connecting what already exists. | Warm, hopeful. Gentle emphasis on *connecting*. |
| `vo-07` | 0:33.5 | 0:36.5 | The world doesn't just need more intelligence. | Slow, deliberate. |
| `vo-08` | 0:36.6 | 0:39.3 | It needs more ways to power it. | The final beat. Land it and stop. |

**On-screen end card:** **io.net**, then *Distributed GPU compute. Connected for what's next.*

## The included voiceover

The film ships with an AI-generated narration in `public/voiceover/vo-01.wav` … `vo-08.wav`. It was made with the free, open Kokoro-82M model (voice `am_michael`) by `scripts/generate-voiceover.py`. The script speaks "io.net" as "eye oh dot net" and paces each line to fit the timings above.

To use a human voice instead, record the lines and replace those files, keeping the same names.

## Recording tips (no special equipment needed)

1. Record in a quiet room with soft furnishings, such as a closet full of clothes. A phone held 20–30 cm from your mouth works well.
2. Record each line as its own file, with about 0.2 s of silence at the start.
3. Each line must fit its slot (Ends minus Starts). Read a little slower than feels natural.
4. Export as WAV (or MP3), name the files `vo-01.wav` … `vo-08.wav`, and put them in `public/voiceover/`.
5. Run `npm run render`. `VOICEOVER.mode` is already set to `'lines'` in `src/config.ts`.

Free tools: **Audacity** (desktop) can record, trim and export WAV. Most phone voice-memo apps can export audio too.

If you'd rather record the whole narration in one take, follow the timings above. Save it as `public/voiceover/full.wav` and set `mode: 'full'`.

## Note on the story

The engineer's story, his flood-risk project and all on-screen numbers and data are fictional. The film doesn't claim that io.net powered any real flood forecast. A dramatization notice appears in the final seconds.
