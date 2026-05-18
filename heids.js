// heids.js — Floating Heids, after Kelvingrove Art Gallery & Museum

const PI      = Math.PI
const HEAD_HW = 115   // head half-width at equator
const HEAD_HH = 155   // head half-height
const BG_CELL = 13    // background fill spacing
const N_HEADS = 9
const FOCAL_D = 0.32  // perspective strength (0 = orthographic)

// ── Expressions (fill words only — feature anatomy is curve-defined) ──────────
const EXPRESSIONS = [
  { name: 'surprise', fillWords: ['shock', 'jolt', 'aghast', 'recoil', 'brow', 'freeze', 'oh', 'bolt', 'still'] },
  { name: 'sad',      fillWords: ['hollow', 'grey', 'weep', 'alone', 'lost', 'still', 'mourn', 'pale', 'heavy'] },
  { name: 'happy',    fillWords: ['light', 'glad', 'soft', 'bliss', 'dear', 'golden', 'sweet', 'radiant', 'glow'] },
  { name: 'angry',    fillWords: ['rage', 'fume', 'boil', 'scowl', 'fire', 'wroth', 'harsh', 'burn', 'dark'] },
  { name: 'laugh',    fillWords: ['roar', 'shake', 'belly', 'glee', 'howl', 'burst', 'snort', 'peal', 'heave'] },
  { name: 'smirk',    fillWords: ['knowing', 'smug', 'clever', 'quite', 'indeed', 'tilted', 'arch', 'sly', 'cool'] },
]

const THREAD_CHARS = ['|', '·', '|', "'", '·', '|', '·', "'", '|']

function rand(lo, hi) { return lo + Math.random() * (hi - lo) }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)] }

// ── Spherical UV cell factory ─────────────────────────────────────────────────
function makeCell(nx, ny, text, fontSize, l, noRotation = false) {
  if (nx * nx + ny * ny > 0.97) return null
  const sinLam = ny
  const cosLam = Math.sqrt(Math.max(0, 1 - ny * ny))
  const sinPhi = nx / Math.max(cosLam, 0.001)
  const cosPhi = Math.sqrt(Math.max(0, 1 - sinPhi * sinPhi))
  const rotation = noRotation ? 0 : rand(-3, 3) * PI / 180
  return {
    sinPhi, cosPhi, sinLam, cosLam,
    text,
    fontSize: Math.round(fontSize + rand(-0.5, 0.5)),
    cosR: Math.cos(rotation),
    sinR: Math.sin(rotation),
    l: Math.round(l + rand(-3, 3)),
  }
}

// ── Parametric samplers ───────────────────────────────────────────────────────
function sampleArc(cx, cy, rX, rY, a0, a1, n, words, fontSize, l) {
  const cells = []
  const full = Math.abs(a1 - a0) >= 2 * PI - 0.01
  for (let i = 0; i < n; i++) {
    const t  = full ? i / n : (n > 1 ? i / (n - 1) : 0)
    const a  = a0 + t * (a1 - a0)
    const nx = cx + rX * Math.cos(a) + rand(-0.018, 0.018)
    const ny = cy + rY * Math.sin(a) + rand(-0.018, 0.018)
    const cell = makeCell(nx, ny, pick(words), fontSize, l)
    if (cell) cells.push(cell)
  }
  return cells
}

function sampleLine(x1, y1, x2, y2, n, words, fontSize, l) {
  const cells = []
  for (let i = 0; i < n; i++) {
    const t  = n > 1 ? i / (n - 1) : 0
    const nx = x1 + t * (x2 - x1) + rand(-0.018, 0.018)
    const ny = y1 + t * (y2 - y1) + rand(-0.018, 0.018)
    const cell = makeCell(nx, ny, pick(words), fontSize, l)
    if (cell) cells.push(cell)
  }
  return cells
}

// ── Feature anatomy per expression ───────────────────────────────────────────
// Coordinates normalized: nx,ny ∈ [-1,1], y-down.
// Smile arc  : arc(cx, cy, rX, rY, 0, PI)      → bottom half → ⌣ (smile)
// Frown arc  : arc(cx, cy, rX, rY, PI, 2*PI)   → top half    → ⌢ (frown)
// Upper brow : arc(cx, cy, rX, rY, -PI, 0)     → top half    → arch
function buildFeatures(exprIdx) {
  const cells = []
  const fS = () => rand(11, 15)
  const fL = () => rand(88, 95)

  function arc(cx, cy, rX, rY, a0, a1, n, words) {
    cells.push(...sampleArc(cx, cy, rX, rY, a0, a1, n, words, fS(), fL()))
  }
  function line(x1, y1, x2, y2, n, words) {
    cells.push(...sampleLine(x1, y1, x2, y2, n, words, fS(), fL()))
  }

  // ── Nose (shared — gives face structure) ──────────────────────────────────
  line(0, -0.06, 0, 0.13, 5, ['|', 'nose', '|', 'bridge'])
  arc(-0.11, 0.18, 0.07, 0.04, 0, 2 * PI, 5, ['o', '—'])   // left nostril
  arc( 0.11, 0.18, 0.07, 0.04, 0, 2 * PI, 5, ['o', '—'])   // right nostril

  switch (exprIdx) {
    case 0: { // ── surprise ──────────────────────────────────────────────────
      // Brows: high arched — eye height bump up, peak above center
      arc(-0.30, -0.54, 0.22, 0.10, -PI, 0, 10, ['arch', 'lift', 'rise', '—'])
      arc( 0.30, -0.54, 0.22, 0.10, -PI, 0, 10, ['arch', 'lift', 'rise', '—'])
      // Eyes: large wide-open circles
      arc(-0.30, -0.10, 0.16, 0.14, 0, 2 * PI, 14, ['wide', 'O', 'open', 'white'])
      arc( 0.30, -0.10, 0.16, 0.14, 0, 2 * PI, 14, ['wide', 'O', 'open', 'white'])
      // Mouth: open O
      arc(0, 0.46, 0.18, 0.15, 0, 2 * PI, 14, ['OH', 'gasp', '!', 'ah'])
      // Forehead wrinkles
      line(-0.28, -0.67, 0.28, -0.67, 7, ['—', 'oh', '~'])
      line(-0.22, -0.75, 0.22, -0.75, 6, ['—', '~'])
      break
    }

    case 1: { // ── sad ───────────────────────────────────────────────────────
      // Brows: inner raised, outer drooping (/\ shape)
      line(-0.50, -0.36, -0.14, -0.48, 7, ['heavy', 'low', 'droop', '—'])
      line( 0.14, -0.48,  0.50, -0.36, 7, ['heavy', 'low', 'droop', '—'])
      // Eyes: heavy upper lid (flat top) + normal lower arc
      arc(-0.30, -0.10, 0.14, 0.05, PI, 2 * PI, 8, ['heavy', 'droop', 'dim'])
      arc(-0.30, -0.10, 0.14, 0.09, 0, PI, 8, ['cast', 'low', 'dim'])
      arc( 0.30, -0.10, 0.14, 0.05, PI, 2 * PI, 8, ['heavy', 'droop', 'dim'])
      arc( 0.30, -0.10, 0.14, 0.09, 0, PI, 8, ['cast', 'low', 'dim'])
      // Mouth: frown — top arc of ellipse (center above corners)
      arc(0, 0.50, 0.28, 0.10, PI, 2 * PI, 12, ['woe', 'sigh', '——', 'ache'])
      // Nasolabial folds drooping
      line(-0.14, 0.22, -0.30, 0.46, 4, ['droop', '\\'])
      line( 0.14, 0.22,  0.30, 0.46, 4, ['droop', '/'])
      break
    }

    case 2: { // ── happy ─────────────────────────────────────────────────────
      // Brows: gentle lift
      arc(-0.30, -0.44, 0.20, 0.07, -PI * 0.9, -PI * 0.1, 8, ['lift', 'warm', '~'])
      arc( 0.30, -0.44, 0.20, 0.07, -PI * 0.9, -PI * 0.1, 8, ['lift', 'warm', '~'])
      // Eyes: cheeks push up — flat lower lid, normal upper
      arc(-0.30, -0.12, 0.14, 0.08, PI, 2 * PI, 8, ['crinkle', 'bright', 'beam'])
      arc(-0.30, -0.12, 0.14, 0.04, 0, PI, 7, ['warm', 'glow'])
      arc( 0.30, -0.12, 0.14, 0.08, PI, 2 * PI, 8, ['crinkle', 'bright', 'beam'])
      arc( 0.30, -0.12, 0.14, 0.04, 0, PI, 7, ['warm', 'glow'])
      // Mouth: wide smile — bottom arc (center below corners = ⌣)
      arc(0, 0.40, 0.32, 0.12, 0, PI, 15, ['smile', 'wide', 'joy', 'yes', 'warm'])
      // Cheek rounds
      arc(-0.42, 0.26, 0.10, 0.07, PI * 0.7, PI * 1.5, 5, ['glow', 'soft'])
      arc( 0.42, 0.26, 0.10, 0.07, PI * 0.7, PI * 1.5, 5, ['glow', 'soft'])
      break
    }

    case 3: { // ── angry ─────────────────────────────────────────────────────
      // Brows: severe \/ — outer high, inner low
      line(-0.50, -0.50, -0.14, -0.34, 8, ['narrow', 'set', 'hard', '—'])
      line( 0.14, -0.34,  0.50, -0.50, 8, ['narrow', 'set', 'hard', '—'])
      // Eyes: narrow slits
      arc(-0.30, -0.10, 0.15, 0.04, PI, 2 * PI, 8, ['glare', 'pierce', 'fix'])
      arc(-0.30, -0.10, 0.15, 0.04, 0, PI, 6, ['narrow', 'hard'])
      arc( 0.30, -0.10, 0.15, 0.04, PI, 2 * PI, 8, ['glare', 'pierce', 'fix'])
      arc( 0.30, -0.10, 0.15, 0.04, 0, PI, 6, ['narrow', 'hard'])
      // Mouth: tight horizontal line
      line(-0.22, 0.44, 0.22, 0.44, 8, ['gnash', 'clench', 'tense', '—'])
      // Forehead crease between brows
      line(-0.04, -0.30,  0.04, -0.46, 4, ['furrow', '|', '!'])
      line( 0.04, -0.30, -0.04, -0.46, 4, ['furrow', '|'])
      // Flared nostrils (larger override)
      arc(-0.13, 0.20, 0.09, 0.05, 0, PI, 5, ['flare', '—'])
      arc( 0.13, 0.20, 0.09, 0.05, 0, PI, 5, ['flare', '—'])
      break
    }

    case 4: { // ── laugh ─────────────────────────────────────────────────────
      // Brows: raised high
      arc(-0.30, -0.54, 0.21, 0.09, -PI, 0, 9, ['rise', 'lift', '~'])
      arc( 0.30, -0.54, 0.21, 0.09, -PI, 0, 9, ['rise', 'lift', '~'])
      // Eyes: nearly shut — very flat arcs
      arc(-0.30, -0.12, 0.14, 0.03, PI, 2 * PI, 7, ['squint', 'crinkle', 'shut'])
      arc(-0.30, -0.12, 0.14, 0.03, 0, PI, 5, ['shut'])
      arc( 0.30, -0.12, 0.14, 0.03, PI, 2 * PI, 7, ['squint', 'crinkle', 'shut'])
      arc( 0.30, -0.12, 0.14, 0.03, 0, PI, 5, ['shut'])
      // Mouth: very wide open — outer lip
      arc(0, 0.36, 0.36, 0.14, 0, PI, 15, ['HA', 'ha', 'wide', 'open'])
      // Mouth: inner arc (top of opening)
      arc(0, 0.36, 0.33, 0.07, PI, 2 * PI, 11, ['ha', 'HA', 'roar'])
      // Cheek bulge
      arc(-0.46, 0.22, 0.10, 0.08, PI * 0.5, PI * 1.3, 5, ['shake', 'roar'])
      arc( 0.46, 0.22, 0.10, 0.08, PI * 0.5, PI * 1.3, 5, ['shake', 'roar'])
      break
    }

    case 5: { // ── smirk ─────────────────────────────────────────────────────
      // Brows: asymmetric — right raised, left neutral
      arc(-0.30, -0.42, 0.19, 0.06, -PI * 0.9, -PI * 0.1, 7, ['arch', '—'])
      arc( 0.30, -0.50, 0.20, 0.09, -PI * 0.9, -PI * 0.1, 8, ['arch', 'wink', 'half'])
      // Eyes: asymmetric — right more open
      arc(-0.30, -0.10, 0.14, 0.06, PI, 2 * PI, 7, ['half', 'lidded'])
      arc(-0.30, -0.10, 0.14, 0.06, 0, PI, 6, ['sly'])
      arc( 0.30, -0.10, 0.14, 0.09, PI, 2 * PI, 8, ['knowing', 'wink'])
      arc( 0.30, -0.10, 0.14, 0.09, 0, PI, 7, ['one', 'sly'])
      // Mouth: one-sided raise (right side curves up, left stays flat)
      arc(0, 0.44, 0.28, 0.08, -PI * 0.2, PI * 0.65, 9, ['curl', 'wry', 'slight', 'hm'])
      line(-0.28, 0.44, 0.02, 0.44, 4, ['——', 'flat'])
      // Nasolabial fold (right only)
      line(0.14, 0.24, 0.28, 0.44, 4, ['knowing', '/'])
      break
    }
  }

  return cells
}

// ── Build full head cell list ─────────────────────────────────────────────────
function buildGrid(exprIdx) {
  const expr    = EXPRESSIONS[exprIdx]
  const bgCells = []

  for (let dy = -HEAD_HH; dy <= HEAD_HH; dy += BG_CELL) {
    for (let dx = -HEAD_HW; dx <= HEAD_HW; dx += BG_CELL) {
      const nx = dx / HEAD_HW
      const ny = dy / HEAD_HH
      if (nx * nx + ny * ny > 0.97) continue
      const cell = makeCell(nx, ny, pick(expr.fillWords), rand(7, 9), rand(50, 66), true)
      if (cell) bgCells.push(cell)
    }
  }

  return { bgCells, featureCells: buildFeatures(exprIdx) }
}

// ── Spawn heads ───────────────────────────────────────────────────────────────
function spawnHeads(lw, lh) {
  const exprOrder = []
  for (let i = 0; i < N_HEADS; i++) {
    exprOrder.push(i < EXPRESSIONS.length ? i : Math.floor(Math.random() * EXPRESSIONS.length))
  }
  for (let i = exprOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [exprOrder[i], exprOrder[j]] = [exprOrder[j], exprOrder[i]]
  }

  const COLS  = 3
  const colW  = lw / COLS
  const rowYs = [
    [lh * 0.22, lh * 0.26],
    [lh * 0.53, lh * 0.57],
    [lh * 0.84, lh * 0.90],
  ]

  const heads = []
  for (let i = 0; i < N_HEADS; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const [yLo, yHi] = rowYs[row] ?? rowYs[rowYs.length - 1]

    const cx = colW * (col + 0.5) + rand(-colW * 0.22, colW * 0.22)
    const cy = rand(yLo, yHi)

    const { bgCells, featureCells } = buildGrid(exprOrder[i])
    heads.push({
      exprIdx: exprOrder[i],
      bgCells, featureCells,
      bgDepth: new Float32Array(bgCells.length),
      bgPos:   new Float32Array(bgCells.length * 2),
      bgIdx:   Array.from({ length: bgCells.length },      (_, k) => k),
      ftDepth: new Float32Array(featureCells.length),
      ftPos:   new Float32Array(featureCells.length * 2),
      ftIdx:   Array.from({ length: featureCells.length }, (_, k) => k),
      baseCx:  cx,
      baseCy:  cy,
      rotAngle:  rand(0, 2 * PI),
      rotSpeed:  rand(0.008, 0.020) * (Math.random() < 0.5 ? 1 : -1),
      swayPhase: rand(0, 2 * PI),
      swaySpeed: rand(0.00080, 0.0022),
      swayAmp:   rand(10, 26),
      bobPhase:  rand(0, 2 * PI),
      bobSpeed:  rand(0.00040, 0.0012),
      bobAmp:    rand(6, 18),
    })
  }
  return heads
}

let raf = null

export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw  = canvas.width  / dpr
    const lh  = canvas.height / dpr
    ctx.scale(dpr, dpr)

    const heads = spawnHeads(lw, lh)
    let t = 0

    function drawThread(topX, botX, botY) {
      const dx   = botX - topX
      const step = 9
      const N    = Math.max(0, Math.floor(botY / step))

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = '6px monospace'
      ctx.textAlign = 'center'

      for (let i = 0; i <= N; i++) {
        const frac     = N > 0 ? i / N : 0
        const edgeFade = Math.min(frac * 6, 1) * Math.min((1 - frac) * 6, 1)
        ctx.globalAlpha = 0.28 * edgeFade
        ctx.fillStyle   = '#ffffff'
        ctx.fillText(THREAD_CHARS[i % THREAD_CHARS.length], topX + dx * frac, frac * botY)
      }
      ctx.textAlign   = 'left'
      ctx.globalAlpha = 1
    }

    function project(cells, depthBuf, posBuf, cx, cy, cosθ, sinθ) {
      for (let i = 0; i < cells.length; i++) {
        const c       = cells[i]
        const sinPhiR = c.sinPhi * cosθ + c.cosPhi * sinθ
        const cosPhiR = c.cosPhi * cosθ - c.sinPhi * sinθ
        const z3dR    = c.cosLam * cosPhiR
        const pScale  = 1 / (1 - z3dR * FOCAL_D)
        depthBuf[i]       = z3dR
        posBuf[i * 2]     = cx + c.cosLam * sinPhiR * HEAD_HW * pScale
        posBuf[i * 2 + 1] = cy + c.sinLam * HEAD_HH  * pScale
      }
    }

    function drawHead(head, cx, cy) {
      const cosθ = Math.cos(head.rotAngle)
      const sinθ = Math.sin(head.rotAngle)

      project(head.bgCells,      head.bgDepth, head.bgPos, cx, cy, cosθ, sinθ)
      project(head.featureCells, head.ftDepth, head.ftPos, cx, cy, cosθ, sinθ)
      head.bgIdx.sort((a, b) => head.bgDepth[a] - head.bgDepth[b])
      head.ftIdx.sort((a, b) => head.ftDepth[a] - head.ftDepth[b])

      // BG pass — one fixed transform, all bg cells drawn with fillText(x, y)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      let lastFontPx = -1, lastL = -1, lastAlpha = -1
      for (let j = 0; j < head.bgCells.length; j++) {
        const i         = head.bgIdx[j]
        const cell      = head.bgCells[i]
        const depthNorm = (head.bgDepth[i] + 1) / 2
        const fontPx    = Math.round(cell.fontSize * (0.30 + 1.10 * depthNorm))
        const lFinal    = Math.round(cell.l * 0.20 + (52 + 43 * depthNorm) * 0.80)
        const alpha     = 0.45 + 0.50 * depthNorm
        if (fontPx !== lastFontPx)              { ctx.font        = `${fontPx}px Georgia, serif`; lastFontPx = fontPx }
        if (lFinal !== lastL)                   { ctx.fillStyle   = `hsl(0,0%,${lFinal}%)`;       lastL = lFinal }
        if (Math.abs(alpha - lastAlpha) > 0.02) { ctx.globalAlpha = alpha;                         lastAlpha = alpha }
        ctx.fillText(cell.text, head.bgPos[i * 2], head.bgPos[i * 2 + 1])
      }

      // Feature pass — per-cell setTransform for rotation (only ~155 cells)
      lastFontPx = lastL = lastAlpha = -1
      for (let j = 0; j < head.featureCells.length; j++) {
        const i         = head.ftIdx[j]
        const cell      = head.featureCells[i]
        const depthNorm = (head.ftDepth[i] + 1) / 2
        const fontPx    = Math.round(cell.fontSize * (0.30 + 1.10 * depthNorm))
        const lFinal    = Math.round(cell.l * 0.20 + (52 + 43 * depthNorm) * 0.80)
        const alpha     = 0.45 + 0.50 * depthNorm
        if (fontPx !== lastFontPx)              { ctx.font        = `${fontPx}px Georgia, serif`; lastFontPx = fontPx }
        if (lFinal !== lastL)                   { ctx.fillStyle   = `hsl(0,0%,${lFinal}%)`;       lastL = lFinal }
        if (Math.abs(alpha - lastAlpha) > 0.02) { ctx.globalAlpha = alpha;                         lastAlpha = alpha }
        ctx.setTransform(dpr * cell.cosR, dpr * cell.sinR,
                         -dpr * cell.sinR, dpr * cell.cosR,
                         dpr * head.ftPos[i * 2], dpr * head.ftPos[i * 2 + 1])
        ctx.fillText(cell.text, 0, 0)
      }
    }

    function tick() {
      t++
      for (const h of heads) h.rotAngle += h.rotSpeed

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      ctx.fillStyle   = '#07070e'
      ctx.fillRect(0, 0, lw, lh)

      const pos = heads.map(h => ({
        cx: h.baseCx + Math.sin(t * h.swaySpeed + h.swayPhase) * h.swayAmp,
        cy: h.baseCy + Math.sin(t * h.bobSpeed  + h.bobPhase)  * h.bobAmp,
      }))

      // Pass 1: threads (behind heads)
      for (let i = 0; i < heads.length; i++) {
        drawThread(heads[i].baseCx, pos[i].cx, pos[i].cy - HEAD_HH)
      }

      // Pass 2: heads
      for (let i = 0; i < heads.length; i++) {
        drawHead(heads[i], pos[i].cx, pos[i].cy)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(tick)
    }

    tick()
  },

  stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null }
  },
}
