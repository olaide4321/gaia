# Narration script: *THE WORLD'S IDLE MACHINES*

**Runtime:** 40 seconds · **Tone:** calm, intimate and assured, like a documentary narrator who believes what they're saying. It's a short spot, so keep the energy up without rushing.

The timings below are fixed by `src/data/narration.json`. That file also drives the burned-in subtitles, the `.srt`/`.vtt` files and (in `lines` mode) where each voice file is placed.

| File name | Starts | Ends | Line |
|---|---|---|---|
| `vo-01` | 0:00.3 | 0:04.0 | Humanity learned to build intelligence. |
| `vo-02` | 0:04.1 | 0:08.7 | But what happens when the world needs more computing power than it can afford? |
| `vo-03` | 0:08.7 | 0:14.5 | Across the world, computing power sits unused, while innovators struggle to reach it. |
| `vo-04` | 0:14.5 | 0:17.6 | What if these scattered resources could work together? |
| `vo-05` | 0:17.6 | 0:24.6 | io.net brings distributed GPU resources together through a decentralized computing network. |
| `vo-06` | 0:26.2 | 0:30.9 | The next breakthrough might begin with connecting what already exists. |
| `vo-07` | 0:32.6 | 0:35.9 | The world doesn't just need more intelligence. |
| `vo-08` | 0:36.0 | 0:39.7 | It needs more ways to power that intelligence. |

**On-screen end card:** **io.net**, then *Distributed GPU compute. Connected for what's next.*

## The included voiceover

The narration in `public/voiceover/vo-01.wav` … `vo-08.wav` is the project owner's own voice, from one phone recording. It was cleaned up (noise, tone, levels), cut at the pauses, sped up 6% without changing pitch, and timed to the table above.

Line 8 was recorded as "It needs more ways to power that intelligence", so the subtitle uses that wording rather than the original "It needs more ways to power it."

To redo a line, record it again and replace that file, keeping its name. A free, offline AI voice is also available via `scripts/generate-voiceover.py`, but it overwrites these files.

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
