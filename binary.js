// ── Constants ─────────────────────────────────────────────────────────────────
const CHAR_SIZE = 13
const CHAR_W    = 8

// Rain mode
const DECAY      = 0.96
const SPEED_MIN  = 0.15
const SPEED_MAX  = 0.45
const RAIN_R     = 60       // cursor wave radius (px)
const RAIN_F     = 0.40     // wave force multiplier
const VEL_DAMP   = 0.86
const OFF_DAMP   = 0.92

// Page mode
const PAGE_SPRING    = 0.08
const PAGE_DAMP      = 0.72
const PAGE_REPEL_R   = 55
const PAGE_REPEL_R2  = PAGE_REPEL_R * PAGE_REPEL_R
const PAGE_REPEL_STR = 5
const PAGE_FLICKER   = 0.008   // chance per char per frame to flip while at rest

// ── Pre-computed colour tables ────────────────────────────────────────────────
const RAIN_COLOR = Array.from({ length: 101 }, (_, i) =>
  `hsl(130,100%,${Math.round(i / 100 * 62)}%)`
)
const HEAD_COLOR = '#55FF88'
const DIM_COLOR  = 'hsl(130,90%,28%)'
const DIGIT      = ['0', '1']

// ── Module state ──────────────────────────────────────────────────────────────
let raf     = null
let cleanup = null
let mode    = 'rain'

// ── Helpers ──────────────────────────────────────────────────────────────────
function randBit()   { return Math.random() < 0.5 ? 0 : 1 }
function randSpeed() { return SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN) }

// ── Main export ───────────────────────────────────────────────────────────────
export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw  = canvas.width  / dpr
    const lh  = canvas.height / dpr
    ctx.scale(dpr, dpr)

    mode = 'rain'

    const cols = Math.ceil(lw / CHAR_W) + 1
    const rows = Math.ceil(lh / CHAR_SIZE) + 2
    const pageN = cols * rows

    // ── Rain data ─────────────────────────────────────────────────────────────
    const brightness = Array.from({ length: cols }, () => new Float32Array(rows))
    const rainChars  = Array.from({ length: cols }, () =>
      Uint8Array.from({ length: rows }, randBit)
    )
    const offsets    = Array.from({ length: cols }, () => new Float32Array(rows))
    const rainVelX   = Array.from({ length: cols }, () => new Float32Array(rows))
    const drops      = Array.from({ length: cols }, () => ({
      y: Math.floor(Math.random() * rows),
      speed: randSpeed(),
    }))

    // Pre-fill brightness so the curtain is dense on frame 1
    for (let i = 0; i < cols; i++) {
      const bri     = brightness[i]
      const headRow = Math.floor(drops[i].y)
      for (let t = 0; t < rows; t++) {
        const r = headRow - t
        if (r >= 0 && r < rows) bri[r] = Math.pow(DECAY, t)
      }
    }

    // ── Page data — flat typed arrays for cache efficiency ────────────────────
    // Indexed as [row * cols + col]
    const pBaseX = new Float32Array(pageN)
    const pBaseY = new Float32Array(pageN)
    const pX     = new Float32Array(pageN)
    const pY     = new Float32Array(pageN)
    const pVX    = new Float32Array(pageN)
    const pVY    = new Float32Array(pageN)
    const pBit   = Uint8Array.from({ length: pageN }, randBit)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col
        const bx  = col * CHAR_W
        const by  = row * CHAR_SIZE + CHAR_SIZE
        pBaseX[idx] = bx;  pBaseY[idx] = by
        pX[idx]     = bx;  pY[idx]     = by
      }
    }

    // Cursor position in logical pixels (-1 = outside canvas)
    let mx = -1, my = -1

    // ── Animation loop ────────────────────────────────────────────────────────
    function tick() {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, lw, lh)
      ctx.font = `bold ${CHAR_SIZE}px monospace`

      // ── Rain mode ──────────────────────────────────────────────────────────
      if (mode === 'rain') {
        for (let i = 0; i < cols; i++) {
          const drop = drops[i]
          const bri  = brightness[i]
          const ch   = rainChars[i]
          const off  = offsets[i]
          const vx   = rainVelX[i]

          for (let r = 0; r < rows; r++) {
            bri[r] *= DECAY
            vx[r]  *= VEL_DAMP
            off[r] += vx[r]
            off[r] *= OFF_DAMP
          }

          const headRow = Math.floor(drop.y)
          if (headRow >= 0 && headRow < rows) bri[headRow] = 1.0

          const baseX = i * CHAR_W
          for (let r = 0; r < rows; r++) {
            const b = bri[r]
            if (b < 0.015) continue
            if (b > 0.95) {
              ctx.fillStyle   = HEAD_COLOR
              ctx.globalAlpha = 1
            } else {
              ctx.fillStyle   = RAIN_COLOR[Math.round(b * 100)]
              ctx.globalAlpha = Math.min(1, b + 0.08)
            }
            ctx.fillText(DIGIT[ch[r]], baseX + off[r], r * CHAR_SIZE + CHAR_SIZE)
          }

          if (Math.random() < 0.04) ch[Math.floor(Math.random() * rows)] = randBit()

          drop.y += drop.speed
          if (drop.y > rows + 10) {
            drop.y     = -Math.floor(Math.random() * rows * 0.3) - 5
            drop.speed = randSpeed()
          }
        }

        ctx.globalAlpha = 1

      // ── Page mode ──────────────────────────────────────────────────────────
      } else {
        ctx.fillStyle   = DIM_COLOR
        ctx.globalAlpha = 0.95

        for (let idx = 0; idx < pageN; idx++) {
          const bx = pBaseX[idx]
          const by = pBaseY[idx]
          const dx = pX[idx] - bx
          const dy = pY[idx] - by
          const vx = pVX[idx]
          const vy = pVY[idx]

          // Check cursor proximity using base position (avoids sqrt)
          let nearCursor = false
          if (mx >= 0) {
            const cdx = bx - mx, cdy = by - my
            nearCursor = cdx * cdx + cdy * cdy < PAGE_REPEL_R2
          }

          // At rest and not near cursor — skip physics, batch draw
          if (!nearCursor && vx * vx + vy * vy < 0.0001 && dx * dx + dy * dy < 0.09) {
            if (Math.random() < PAGE_FLICKER) pBit[idx] = randBit()
            ctx.fillText(DIGIT[pBit[idx]], bx, by)
            continue
          }

          // Full physics update
          let fx = -dx * PAGE_SPRING
          let fy = -dy * PAGE_SPRING

          if (mx >= 0) {
            const rx    = pX[idx] - mx
            const ry    = pY[idx] - my
            const dist2 = rx * rx + ry * ry
            if (dist2 < PAGE_REPEL_R2 && dist2 > 0.25) {
              const dist = Math.sqrt(dist2)
              const str  = PAGE_REPEL_STR * (1 - dist / PAGE_REPEL_R) ** 2
              fx += (rx / dist) * str
              fy += (ry / dist) * str
              if (Math.random() < 0.22) pBit[idx] = randBit()
            }
          }

          pVX[idx] = (vx + fx) * PAGE_DAMP
          pVY[idx] = (vy + fy) * PAGE_DAMP
          pX[idx] += pVX[idx]
          pY[idx] += pVY[idx]

          // Colour scales with displacement — dim at rest, bright when flung
          const disp = Math.sqrt(dx * dx + dy * dy)
          const t    = Math.min(disp / 55, 1)
          ctx.fillStyle   = `hsl(130,${Math.round(90 + t * 10)}%,${Math.round(28 + t * 52)}%)`
          ctx.globalAlpha = 0.95 + t * 0.05
          ctx.fillText(DIGIT[pBit[idx]], pX[idx], pY[idx])

          // Reset to dim defaults for the next at-rest characters
          ctx.fillStyle   = DIM_COLOR
          ctx.globalAlpha = 0.95
        }

        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(tick)
    }

    tick()

    // ── Event handlers ────────────────────────────────────────────────────────
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      const nmx  = (e.clientX - rect.left) * (lw / rect.width)
      const nmy  = (e.clientY - rect.top)  * (lh / rect.height)

      // Rain mode: velocity-driven column wave
      if (mode === 'rain' && mx >= 0) {
        const dx     = nmx - mx
        const colMin = Math.max(0, Math.floor((nmx - RAIN_R) / CHAR_W))
        const colMax = Math.min(cols - 1, Math.ceil((nmx + RAIN_R) / CHAR_W))
        const rowMin = Math.max(0, Math.floor((nmy - RAIN_R) / CHAR_SIZE))
        const rowMax = Math.min(rows - 1, Math.ceil((nmy + RAIN_R) / CHAR_SIZE))

        for (let i = colMin; i <= colMax; i++) {
          const vx = rainVelX[i]
          for (let r = rowMin; r <= rowMax; r++) {
            if (brightness[i][r] < 0.015) continue
            const cellX = i * CHAR_W, cellY = r * CHAR_SIZE
            const dist  = Math.sqrt((cellX - nmx) ** 2 + (cellY - nmy) ** 2)
            if (dist < RAIN_R) {
              const tt = 1 - dist / RAIN_R
              vx[r] += dx * tt * tt * RAIN_F
            }
          }
        }
      }

      mx = nmx; my = nmy
    }

    const onLeave = () => { mx = -1; my = -1 }

    const onClick = () => {
      if (mode === 'rain') {
        mode = 'page'
        // Snap all page characters back to base before revealing
        for (let i = 0; i < pageN; i++) {
          pX[i] = pBaseX[i]; pY[i] = pBaseY[i]
          pVX[i] = 0;        pVY[i] = 0
        }
      } else {
        mode = 'rain'
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)
    cleanup = () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  },

  stop() {
    cancelAnimationFrame(raf); raf = null
    if (cleanup) { cleanup(); cleanup = null }
    mode = 'rain'
  },
}
