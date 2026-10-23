# Narration script: *THE WORLD'S IDLE MACHINES*

**Runtime:** 60 seconds · **Tone:** calm, intimate and assured, like a documentary narrator who believes what they're saying. Leave the pauses in; the music fills them.

The timings below are fixed by `src/data/narration.json`. That file also drives the burned-in subtitles, the `.srt`/`.vtt` files and (in `lines` mode) where each voice file is placed.

| File name | Starts | Ends | Line | Direction |
|---|---|---|---|---|
| `vo-01` | 0:00.8 | 0:04.4 | Humanity learned to build intelligence. | Quiet, almost proud. |
| `vo-02` | 0:04.7 | 0:09.7 | But what happens when the world needs more computing power than it can afford? | Let the question hang. Slight weight on *afford*. |
| `vo-03` | 0:10.6 | 0:15.4 | Across the world, computing power sits unused, | Observational, slower. |
| `vo-04` | 0:15.5 | 0:21.5 | while innovators struggle to access the resources they need. | A touch of frustration. |
| `vo-05` | 0:23.0 | 0:27.7 | What if these scattered resources could work together? | Wonder. This is the turn. |
| `vo-06` | 0:28.8 | 0:37.5 | io.net brings distributed GPU resources together through a decentralized computing network. | Clear and confident. Say "eye-oh dot net". |
| `vo-07` | 0:38.6 | 0:44.3 | Because the next breakthrough might not require building everything from scratch. | Warm, hopeful. |
| `vo-08` | 0:44.7 | 0:49.7 | It might begin with connecting what already exists. | Gentle emphasis on *connecting*. |
| `vo-09` | 0:50.4 | 0:53.7 | The world doesn't just need more intelligence. | Slow, deliberate. |
| `vo-10` | 0:53.9 | 0:57.3 | It needs more ways to power it. | The final beat. Land it and stop. |

**On-screen end card:** **io.net**, then *Distributed GPU compute. Connected for what's next.*

## Recording tips (no special equipment needed)

1. Record in a quiet room with soft furnishings, such as a closet full of clothes. A phone held 20–30 cm from your mouth works well.
2. Record each line as its own file, with about 0.2 s of silence at the start.
3. Each line must fit its slot (Ends minus Starts). Read a little slower than feels natural.
4. Export as WAV (or MP3), name the files `vo-01.wav` … `vo-10.wav`, and put them in `public/voiceover/`.
5. In `src/config.ts`, set `VOICEOVER.mode` to `'lines'`, then run `npm run render`.

Free tools: **Audacity** (desktop) can record, trim and export WAV. Most phone voice-memo apps can export audio too.

If you'd rather record the whole narration in one take, follow the timings above. Save it as `public/voiceover/full.wav` and set `mode: 'full'`.

## Note on the story

The engineer's story, his flood-risk project and all on-screen numbers and data are fictional. The film doesn't claim that io.net powered any real flood forecast. A dramatization notice appears in the final seconds.
