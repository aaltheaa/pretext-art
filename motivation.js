// ─────────────────────────────────────────────────────────────────────────────
// pretext-art · motivation.js
// Dreamy aurora / sparkle background with cycling motivational quotes.
// Click anywhere to advance to the next quote.
// ─────────────────────────────────────────────────────────────────────────────

const QUOTES = [
  // don't make yourself small
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "Above all, be the heroine of your life, not the victim.", author: "Nora Ephron" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "Don't shrink yourself to fit into spaces you've outgrown.", author: "" },
  { text: "You don't have to make yourself small to be loved.", author: "" },
  // you got this / belief
  { text: "She believed she could, so she did.", author: "R.S. Grey" },
  { text: "I am not afraid. I was born to do this.", author: "Joan of Arc" },
  { text: "Whatever you are, be a good one.", author: "Mary Todd Lincoln" },
  { text: "You got this.", author: "" },
  // you are stronger than you think
  { text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
  { text: "A woman is like a tea bag — you never know how strong she is until she gets in hot water.", author: "Eleanor Roosevelt" },
  { text: "The most courageous act is still to think for yourself. Aloud.", author: "Coco Chanel" },
  { text: "I have chosen to no longer be apologetic for my femaleness and my femininity.", author: "Chimamanda Ngozi Adichie" },
  { text: "You are stronger than you think.", author: "" },
  // grace & self-compassion
  { text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.", author: "Brené Brown" },
  { text: "Talk to yourself like you would to someone you love.", author: "Brené Brown" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Sharon Salzberg" },
  // perseverance
  { text: "I have learned over the years that when one's mind is made up, this diminishes fear.", author: "Rosa Parks" },
  { text: "Do not wait for someone else to come and speak for you. It is you who can change the world.", author: "Malala Yousafzai" },
  { text: "If you're always trying to be normal, you will never know how amazing you can be.", author: "Maya Angelou" },
  { text: "I am no longer accepting the things I cannot change. I am changing the things I cannot accept.", author: "Angela Davis" },
]

// Four palettes that slowly cycle: hues [a, b, c] for three aurora channels
const PALETTES = [
  { hues: [270, 200, 320], sat: [60, 65, 65] },  // violet / teal / magenta
  { hues: [320, 280, 15],  sat: [65, 55, 60] },  // pink / purple / warm rose
  { hues: [200, 240, 165], sat: [70, 60, 55] },  // cyan / blue / mint
  { hues: [40,  300, 60],  sat: [60, 60, 65] },  // amber / violet / gold
]

const PALETTE_SECS = 30   // seconds per palette crossfade
const QUOTE_INTERVAL = 10000  // ms between auto-advances

export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const overlay = document.getElementById('motivation-overlay')
    const quoteEl = overlay.querySelector('.motivation-quote')
    const textEl  = overlay.querySelector('.motivation-text')
    const authEl  = overlay.querySelector('.motivation-author')

    overlay.classList.remove('hidden')

    let lw = canvas.width
    let lh = canvas.height
    let t  = 0
    let raf = null

    // ── Palette blending ────────────────────────────────────────────────────
    let palIdx  = 0
    let nextPal = 1
    let palBlend = 0

    function lerpHue(a, b, k) {
      let d = b - a
      if (d >  180) d -= 360
      if (d < -180) d += 360
      return (a + d * k + 360) % 360
    }

    function curHues() {
      return PALETTES[palIdx].hues.map((h, i) => lerpHue(h, PALETTES[nextPal].hues[i], palBlend))
    }
    function curSats() {
      return PALETTES[palIdx].sat.map((s, i) => s + (PALETTES[nextPal].sat[i] - s) * palBlend)
    }

    // ── Aurora bands ────────────────────────────────────────────────────────
    const BANDS = [
      { yf: 0.22, amp: 0.14, spd: 0.0000060, ph: 0.0,  wf: 0.55, al: 0.22, hi: 0 },
      { yf: 0.45, amp: 0.17, spd: 0.0000045, ph: 3.14, wf: 0.70, al: 0.18, hi: 1 },
      { yf: 0.65, amp: 0.13, spd: 0.0000070, ph: 1.20, wf: 0.60, al: 0.20, hi: 2 },
      { yf: 0.35, amp: 0.10, spd: 0.0000052, ph: 2.10, wf: 0.45, al: 0.13, hi: 0 },
      { yf: 0.55, amp: 0.16, spd: 0.0000035, ph: 0.80, wf: 0.65, al: 0.15, hi: 1 },
    ]

    function drawAurora(hues, sats) {
      ctx.save()
      for (const b of BANDS) {
        const cy = lh * b.yf + Math.sin(t * b.spd * 1000 + b.ph) * lh * b.amp
        const h  = b.wf * lh * 0.65
        const hue = hues[b.hi], sat = sats[b.hi]

        ctx.shadowColor = `hsl(${hue},${sat}%,65%)`
        ctx.shadowBlur  = 90

        const grad = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2)
        grad.addColorStop(0,   `hsla(${hue},${sat}%,55%,0)`)
        grad.addColorStop(0.3, `hsla(${hue},${sat}%,55%,${b.al})`)
        grad.addColorStop(0.5, `hsla(${hue},${sat}%,62%,${b.al * 1.5})`)
        grad.addColorStop(0.7, `hsla(${hue},${sat}%,55%,${b.al})`)
        grad.addColorStop(1,   `hsla(${hue},${sat}%,55%,0)`)
        ctx.fillStyle = grad

        // Wavy ribbon via bezier segments
        const segs = 7
        const sw   = lw / segs
        ctx.beginPath()
        ctx.moveTo(0, cy - h / 2)
        for (let i = 0; i < segs; i++) {
          const wave = (off) => Math.sin(t * b.spd * 800 + b.ph + (i + off) * 0.9) * lh * 0.018
          ctx.bezierCurveTo(
            (i + 0.33) * sw, cy - h / 2 + wave(0.33),
            (i + 0.66) * sw, cy - h / 2 + wave(0.66),
            (i + 1)    * sw, cy - h / 2 + wave(1),
          )
        }
        ctx.lineTo(lw, cy + h / 2)
        for (let i = segs; i > 0; i--) {
          const wave = (off) => Math.sin(t * b.spd * 600 + b.ph + (i - off) * 0.75) * lh * 0.018
          ctx.bezierCurveTo(
            (i - 0.33) * sw, cy + h / 2 + wave(0.33),
            (i - 0.66) * sw, cy + h / 2 + wave(0.66),
            (i - 1)    * sw, cy + h / 2 + wave(1),
          )
        }
        ctx.closePath()
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.restore()
    }

    // ── Soft orbs ───────────────────────────────────────────────────────────
    const ORBS = Array.from({ length: 7 }, (_, i) => ({
      xf:  0.15 + Math.random() * 0.7,
      yf:  0.15 + Math.random() * 0.7,
      r:   110  + Math.random() * 190,
      sxf: (0.0000015 + Math.random() * 0.0000020) * (Math.random() < 0.5 ? 1 : -1),
      syf: (0.0000012 + Math.random() * 0.0000018) * (Math.random() < 0.5 ? 1 : -1),
      ph:  Math.random() * Math.PI * 2,
      al:  0.06 + Math.random() * 0.08,
      hi:  i % 3,
    }))

    function drawOrbs(hues, sats) {
      ctx.save()
      for (const o of ORBS) {
        const x   = lw * o.xf + Math.cos(t * o.sxf * 1000 + o.ph) * lw * 0.11
        const y   = lh * o.yf + Math.sin(t * o.syf * 1000 + o.ph * 1.3) * lh * 0.09
        const hue = hues[o.hi], sat = sats[o.hi]
        const g   = ctx.createRadialGradient(x, y, 0, x, y, o.r)
        g.addColorStop(0,   `hsla(${hue},${sat}%,72%,${o.al})`)
        g.addColorStop(0.5, `hsla(${hue},${sat}%,60%,${o.al * 0.45})`)
        g.addColorStop(1,   `hsla(${hue},${sat}%,50%,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, o.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // ── Sparkles ────────────────────────────────────────────────────────────
    const SPARKS = Array.from({ length: 80 }, () => ({
      x:   Math.random() * (canvas.width  || 800),
      y:   Math.random() * (canvas.height || 600),
      sz:  0.5 + Math.random() * 2.2,
      spd: 0.00025 + Math.random() * 0.00055,
      ph:  Math.random() * Math.PI * 2,
      hi:  Math.floor(Math.random() * 3),
    }))

    function drawSparkles(hues) {
      ctx.save()
      for (const s of SPARKS) {
        const alpha = Math.pow(Math.abs(Math.sin(t * s.spd * 1000 + s.ph)), 2.2)
        if (alpha < 0.025) { s.x = Math.random() * lw; s.y = Math.random() * lh }
        const hue = hues[s.hi]
        ctx.shadowColor = `hsl(${hue},80%,85%)`
        ctx.shadowBlur  = 12
        ctx.fillStyle   = `hsla(${hue},80%,94%,${alpha * 0.85})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.sz * alpha + 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.restore()
    }

    // ── Draw loop ────────────────────────────────────────────────────────────
    const palFrames = PALETTE_SECS * 60
    let palFrame = 0

    function draw() {
      lw = canvas.width
      lh = canvas.height

      // Advance palette blend
      palFrame++
      palBlend = Math.min(1, palFrame / palFrames)
      if (palFrame >= palFrames) {
        palIdx   = nextPal
        nextPal  = (nextPal + 1) % PALETTES.length
        palFrame = 0
        palBlend = 0
      }

      const hues = curHues()
      const sats = curSats()

      // Soft motion-blur trail: dark semi-transparent fill instead of clearRect
      ctx.fillStyle = 'rgba(7, 5, 16, 0.07)'
      ctx.fillRect(0, 0, lw, lh)

      drawAurora(hues, sats)
      drawOrbs(hues, sats)
      drawSparkles(hues)

      t++
      raf = requestAnimationFrame(draw)
    }

    // ── Quote cycling ────────────────────────────────────────────────────────
    let quoteIdx  = 0
    let quoteTimer = null
    let fadeTimer  = null
    let transitioning = false

    function showQuote(idx) {
      textEl.textContent = QUOTES[idx].text
      authEl.textContent = QUOTES[idx].author ? `— ${QUOTES[idx].author}` : ''
      // Double rAF ensures the DOM has rendered before we add the class
      requestAnimationFrame(() => requestAnimationFrame(() => {
        quoteEl.classList.add('visible')
        transitioning = false
      }))
    }

    function advanceQuote() {
      if (transitioning) return
      transitioning = true
      clearTimeout(fadeTimer)
      quoteEl.classList.remove('visible')
      fadeTimer = setTimeout(() => {
        quoteIdx = (quoteIdx + 1) % QUOTES.length
        showQuote(quoteIdx)
      }, 2000)
      // Reset the auto-timer so a click doesn't fight with the interval
      clearInterval(quoteTimer)
      quoteTimer = setInterval(advanceQuote, QUOTE_INTERVAL)
    }

    // Click anywhere on the overlay to advance
    overlay.addEventListener('click', advanceQuote)

    showQuote(quoteIdx)
    quoteTimer = setInterval(advanceQuote, QUOTE_INTERVAL)

    draw()

    // ── Cleanup ──────────────────────────────────────────────────────────────
    this._cleanup = () => {
      cancelAnimationFrame(raf)
      clearInterval(quoteTimer)
      clearTimeout(fadeTimer)
      overlay.removeEventListener('click', advanceQuote)
      quoteEl.classList.remove('visible')
      overlay.classList.add('hidden')
      // Hard clear so old frame doesn't bleed into next experiment
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  },

  stop() {
    if (this._cleanup) { this._cleanup(); this._cleanup = null }
  },
}
