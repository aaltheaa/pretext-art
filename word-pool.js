const WORDS = [
  'ephemeral', 'cascade', 'luminous', 'solitude', 'reverie',
  'murmur', 'gossamer', 'twilight', 'serendipity', 'labyrinth',
  'whisper', 'vermillion', 'nebula', 'penumbra', 'lullaby',
  'quixotic', 'susurrus', 'azure', 'melancholy', 'zephyr',
  'halcyon', 'iridescent', 'cerulean', 'aurora', 'liminal',
  'numinous', 'crepuscular', 'sempiternal', 'umbra', 'zenith',
  'syntax', 'fragment', 'iterate', 'recursion', 'pretext',
  'phoneme', 'morpheme', 'lexicon', 'palimpsest', 'codex',
]

const PALETTE = [
  '#FF6B8A', '#FF9F6B', '#FFD46B', '#6BFF9F',
  '#6BB5FF', '#B56BFF', '#FF6BEF', '#6BFFF0',
]

let raf = null
let words = []
let mouse = { x: -9999, y: -9999 }
let cleanup = null

export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw = canvas.width / dpr
    const lh = canvas.height / dpr
    ctx.scale(dpr, dpr)

    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)
    cleanup = () => {
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
    }

    words = WORDS.map((text, i) => {
      const size = 13 + Math.floor(Math.random() * 11)
      ctx.font = `${size}px Georgia, serif`
      const tw = ctx.measureText(text).width
      return {
        text,
        x: Math.random() * (lw - tw - 40) + 20,
        y: size + Math.random() * (lh - size * 2 - 20),
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        size,
        tw,
        color: PALETTE[i % PALETTE.length],
        alpha: 0.5 + Math.random() * 0.4,
      }
    })

    function tick() {
      ctx.clearRect(0, 0, lw, lh)

      for (const w of words) {
        // Jitter to keep moving
        w.vx += (Math.random() - 0.5) * 0.04
        w.vy += (Math.random() - 0.5) * 0.04

        // Mouse repulsion
        const mdx = w.x + w.tw / 2 - mouse.x
        const mdy = w.y - w.size / 2 - mouse.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < 130 && md > 0) {
          const force = (1 - md / 130) * 0.65
          w.vx += (mdx / md) * force
          w.vy += (mdy / md) * force
        }

        // Gentle pull back toward canvas center when straying
        const cdx = lw / 2 - (w.x + w.tw / 2)
        const cdy = lh / 2 - w.y
        const cd = Math.sqrt(cdx * cdx + cdy * cdy)
        if (cd > Math.min(lw, lh) * 0.42) {
          w.vx += (cdx / cd) * 0.05
          w.vy += (cdy / cd) * 0.05
        }

        // Speed cap and damping
        const speed = Math.sqrt(w.vx * w.vx + w.vy * w.vy)
        if (speed > 3) { w.vx = (w.vx / speed) * 3; w.vy = (w.vy / speed) * 3 }
        w.vx *= 0.986
        w.vy *= 0.986

        w.x += w.vx
        w.y += w.vy

        // Wall bounce
        if (w.x < 0) { w.x = 0; w.vx = Math.abs(w.vx) * 0.7 }
        if (w.x + w.tw > lw) { w.x = lw - w.tw; w.vx = -Math.abs(w.vx) * 0.7 }
        if (w.y < w.size) { w.y = w.size; w.vy = Math.abs(w.vy) * 0.7 }
        if (w.y > lh) { w.y = lh; w.vy = -Math.abs(w.vy) * 0.7 }

        // Glow pass
        ctx.save()
        ctx.globalAlpha = w.alpha * 0.18
        ctx.shadowColor = w.color
        ctx.shadowBlur = 18
        ctx.fillStyle = w.color
        ctx.font = `${w.size}px Georgia, serif`
        ctx.fillText(w.text, w.x, w.y)
        ctx.restore()

        // Main text
        ctx.globalAlpha = w.alpha
        ctx.fillStyle = w.color
        ctx.font = `${w.size}px Georgia, serif`
        ctx.fillText(w.text, w.x, w.y)
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    tick()
  },

  stop() {
    cancelAnimationFrame(raf)
    raf = null
    if (cleanup) { cleanup(); cleanup = null }
    words = []
    mouse = { x: -9999, y: -9999 }
  },
}
