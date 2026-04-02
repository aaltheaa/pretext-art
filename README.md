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

### word pool

Words are physical objects. Each word has a position, a velocity, and a mass implied by its width (measured via canvas). They drift around the canvas under gentle physics:

- **inertia** — words keep moving until damped
- **wall bounce** — elastic collision at canvas edges
- **mouse repulsion** — cursor pushes words away within a 130px radius
- **center pull** — a soft gravitational force keeps words from permanently drifting to the edges

The word widths are measured once at startup using `ctx.measureText()` — the same mechanism pretext uses internally — and stored so the physics engine can treat each word as a rigid body with a known footprint.

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
