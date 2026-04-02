# pretext art

A collection of canvas-based text experiments inspired by [chenglou/pretext](https://github.com/chenglou/pretext) — a library for measuring and laying out text without DOM interaction.

Live: **[aaltheaa.github.io/pretext-art](https://aaltheaa.github.io/pretext-art/)**

---

## what is pretext?

Pretext separates text work into two phases:

1. **Prepare** (expensive, once) — analyzes text, segments graphemes, caches character widths via the canvas `measureText` API
2. **Layout** (cheap, repeated) — pure arithmetic over the cached measurements, no DOM reflow

This separation is what makes it fast enough for real-time use — resize events, scroll handlers, animation loops. The key insight is that text measurement is just math once the widths are cached.

That idea — *treating text as a set of positioned, measurable units rather than a rendered string* — is the conceptual seed for the experiments here.

---

## experiments

### museum

Three famous paintings — Mona Lisa, The Starry Night, Water Lilies — rendered entirely from words. Each painting is a grid of artist quotes, color-sampled from the real painting image, arranged so the combined palette recreates the original at a distance.

Each word cell has a random surface tilt (-1 to 1) and a slight random rotation (±8°). An interactive light fixture above the painting lets you change the angle of light across the canvas. Words whose tilt faces the light become brighter; words angled away darken. This creates a texture-relief effect — the same text mosaic looks different under each of the five preset angles.

**Controls:**
- **Click the ceiling track** — 5 preset light positions from hard left to hard right
- **Click the ball chain** (hanging from the right end of the track) — toggles the light off/on. The lamp dims, the cone disappears, and words render at flat base color
- **With light off, click the painting** — switches to reading mode: words reflow into a proper paragraph across the painting area, using `ctx.measureText()` to word-wrap the artist's quotes to the painting width. Colors still reflect the underlying painting. Click again to return to the mosaic
- **◀ prev / next ▶** — fades between paintings

**How it's built:**

Color pipeline: at startup each cell gets a color from a set of hand-authored fallback regions (specific zones like sky, hills, face — ordered specific-to-general with a catch-all). Concurrently, the real Wikimedia image loads into an offscreen 200px canvas; once ready, `getImageData` re-samples every cell in-place. The fallback means something always renders immediately; the image upgrade is invisible.

Performance was the main challenge. With ~1800 cells per painting, `fillText` + canvas state switches at 60fps were expensive — especially on landscape paintings (Starry Night, Water Lilies) which have 2–3× more cells than the portrait Mona Lisa. The fixes:

- **Adaptive cell count**: `MAX_CELLS = 1800` cap; cell size scales up proportionally so wider paintings don't explode the grid
- **Stop-when-idle rAF**: the animation loop only runs while the light is moving or a fade is in progress — otherwise it stops entirely. A `scheduleFrame()` call on click restarts it
- **`setTransform` instead of `save/restore`**: replacing per-cell `ctx.save()`/`ctx.restore()` with direct matrix calls eliminated ~4000 canvas state stack operations per frame
- **Easing tuned**: light arm lerp factor of 0.35 gives a snappy feel without overshoot

**Physics parameters:**
| parameter | value | effect |
|---|---|---|
| `CELL_SIZE` | 13px base | grid density before adaptive scaling |
| `MAX_CELLS` | 1800 | cap across all painting shapes |
| `REPEL_RADIUS` (light) | cos alignment | tilt range ±π/4 against light angle |
| arm easing | 0.35/frame | how quickly the fixture arm swings |

---

### word pool

Words are physical objects. Each word has a position, a velocity, and a mass implied by its width (measured via canvas). They drift around the canvas under gentle physics:

- **inertia** — words keep moving until damped
- **wall bounce** — elastic collision at canvas edges
- **mouse repulsion** — cursor pushes words away within a 130px radius
- **center pull** — a soft gravitational force keeps words from permanently drifting to the edges

The word widths are measured once at startup using `ctx.measureText()` — the same mechanism pretext uses internally — and stored so the physics engine can treat each word as a rigid body with a known footprint.

---

### dragon

A paragraph of text is decomposed into individual characters. Each character is measured, positioned, and stored as an independent particle with spring physics.

A dragon flies through the text along a [Lissajous curve](https://en.wikipedia.org/wiki/Lissajous_curve) — a parametric path that naturally weaves back and forth across the canvas. Its body is a chain of segments, each one following the next with a fixed spacing constraint (verlet-style chain physics).

When the dragon passes through the text, each character within its repulsion radius is pushed away proportional to proximity. When the dragon moves on, the spring pulls each character back to its base position.

The character layout mirrors what pretext's `layoutWithLines` does: wrap text to a max width, then iterate through each line accumulating x positions by summing character widths. Pretext does this with cached segment data; here it's done with `ctx.measureText()` inline at startup.

**Physics parameters:**
| parameter | value | effect |
|---|---|---|
| `SPRING` | 0.14 | how quickly characters return |
| `DAMPING` | 0.76 | how quickly motion dissipates |
| `REPEL_RADIUS` | 44px | how far the dragon's influence reaches |
| `REPEL_STRENGTH` | 3.8 | how hard it pushes |
| `SEG_SPACING` | 15px | length of each body segment |

---

## how it's built

No build step, no dependencies. Pure ES modules served as static files.

```
index.html      tab shell, canvas element
style.css       dark theme layout
main.js         tab switching, resize handling
museum.js       painting mosaic + light fixture experiment
word-pool.js    word physics experiment
dragon.js       dragon + reactive text experiment
```

Each experiment exports `{ start(canvas), stop() }`. `main.js` calls `stop()` on the current experiment before calling `start()` on the next, so animation loops and event listeners are always cleaned up.

---

## running locally

```bash
npx serve .
# or just open index.html directly in a browser
```
