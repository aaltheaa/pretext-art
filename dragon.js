const TEXT = `Words are living things. They breathe and shift and sometimes escape the page entirely, trailing meaning behind them like smoke. Watch this creature as it weaves between the syllables, and notice how language bends around a presence that has no words of its own. Letters scatter, then slowly drift back to where they belong, as if nothing happened.`

const FONT_SIZE = 17
const LINE_HEIGHT = 34
const MAX_TEXT_WIDTH = 580
const SEGMENT_COUNT = 22
const SEG_SPACING = 15
const REPEL_RADIUS = 44
const REPEL_STRENGTH = 3.8
const SPRING = 0.14
const DAMPING = 0.76

let raf = null

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw = canvas.width / dpr
    const lh = canvas.height / dpr
    ctx.scale(dpr, dpr)

    const font = `${FONT_SIZE}px Georgia, serif`
    ctx.font = font

    const textWidth = Math.min(MAX_TEXT_WIDTH, lw - 80)
    const textX = (lw - textWidth) / 2
    const lines = wrapText(ctx, TEXT, textWidth)
    const totalTextHeight = lines.length * LINE_HEIGHT
    const textStartY = Math.round((lh - totalTextHeight) / 2) + FONT_SIZE

    // Build per-character position array
    const chars = []
    lines.forEach((line, li) => {
      const lineY = textStartY + li * LINE_HEIGHT
      let x = textX
      for (const char of line) {
        const cw = ctx.measureText(char).width
        if (char !== ' ') {
          chars.push({ char, baseX: x, baseY: lineY, x, y: lineY, vx: 0, vy: 0, cw })
        }
        x += cw
      }
    })

    // Dragon state
    const cx = lw / 2
    const cy = lh / 2
    let t = 0

    // Segments: each follows the one ahead
    const segments = Array.from({ length: SEGMENT_COUNT }, () => ({ x: cx, y: cy }))

    function lerp(a, b, f) { return a + (b - a) * f }

    function tick() {
      ctx.clearRect(0, 0, lw, lh)

      // Advance dragon head along a Lissajous figure through the text block
      t += 0.011
      const rx = Math.min(textWidth * 0.52, lw * 0.36)
      const ry = Math.min(totalTextHeight * 0.62, lh * 0.28)
      const headX = cx + rx * Math.sin(2.1 * t)
      const headY = cy + ry * Math.sin(3.0 * t + 0.85)

      // Smooth head toward target, body follows with chain physics
      segments[0].x += (headX - segments[0].x) * 0.32
      segments[0].y += (headY - segments[0].y) * 0.32
      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1]
        const curr = segments[i]
        const dx = prev.x - curr.x
        const dy = prev.y - curr.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > SEG_SPACING) {
          curr.x = prev.x - (dx / dist) * SEG_SPACING
          curr.y = prev.y - (dy / dist) * SEG_SPACING
        }
      }

      // Update character physics
      for (const c of chars) {
        // Spring back toward base position
        let fx = (c.baseX - c.x) * SPRING
        let fy = (c.baseY - c.y) * SPRING

        // Repulsion from each dragon segment
        for (const seg of segments) {
          const dx = c.x - seg.x
          const dy = c.y - seg.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < REPEL_RADIUS && dist > 0.5) {
            const strength = REPEL_STRENGTH * Math.pow(1 - dist / REPEL_RADIUS, 1.5)
            fx += (dx / dist) * strength
            fy += (dy / dist) * strength
          }
        }

        c.vx = (c.vx + fx) * DAMPING
        c.vy = (c.vy + fy) * DAMPING
        c.x += c.vx
        c.y += c.vy
      }

      // Draw characters
      ctx.font = font
      for (const c of chars) {
        const dx = c.x - c.baseX
        const dy = c.y - c.baseY
        const displacement = Math.sqrt(dx * dx + dy * dy)
        const intensity = Math.min(displacement / 55, 1)

        // Shift from soft lavender-white to cyan/violet when displaced
        const hue = 200 + intensity * 120
        const sat = Math.round(intensity * 80)
        const lit = Math.round(72 + intensity * 20)
        ctx.globalAlpha = 0.72 + intensity * 0.28
        ctx.fillStyle = intensity < 0.05
          ? 'rgba(225, 220, 255, 0.82)'
          : `hsl(${hue}, ${sat}%, ${lit}%)`
        ctx.fillText(c.char, c.x, c.y)
      }
      ctx.globalAlpha = 1

      // Draw dragon body (tail → head so head renders on top)
      for (let i = segments.length - 1; i >= 0; i--) {
        const seg = segments[i]
        const progress = i / (segments.length - 1) // 0 = head, 1 = tail
        const radius = lerp(10, 2.5, progress)
        const hue = lerp(172, 265, progress)
        const sat = lerp(100, 65, progress)
        const lit = lerp(62, 30, progress)
        const alpha = lerp(0.92, 0.18, progress)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowColor = `hsl(${hue}, ${sat}%, ${lit}%)`
        ctx.shadowBlur = radius * 2.5
        ctx.beginPath()
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`
        ctx.fill()
        ctx.restore()
      }

      // Draw eyes on head
      const head = segments[0]
      const neck = segments[2] || segments[1] || head
      const angle = Math.atan2(head.y - neck.y, head.x - neck.x)
      const eyeR = 2.2
      const eyeForward = 7
      const eyeSide = 4.5

      ctx.globalAlpha = 1
      ctx.fillStyle = '#00ffee'
      ctx.shadowColor = '#00ffee'
      ctx.shadowBlur = 6
      for (const side of [-1, 1]) {
        const ex = head.x + Math.cos(angle) * eyeForward + Math.cos(angle + side * 1.35) * eyeSide
        const ey = head.y + Math.sin(angle) * eyeForward + Math.sin(angle + side * 1.35) * eyeSide
        ctx.beginPath()
        ctx.arc(ex, ey, eyeR, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(tick)
    }

    tick()
  },

  stop() {
    cancelAnimationFrame(raf)
    raf = null
  },
}
