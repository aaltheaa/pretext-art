// ── Constants ────────────────────────────────────────────────────────
const FIXTURE_H = 72
const NAV_H = 52
const CELL_SIZE = 13
const LIGHT_PRESETS = [-50, -25, 0, 25, 50].map(d => d * Math.PI / 180)

// ── Paintings data ───────────────────────────────────────────────────
const PAINTINGS = [
  {
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: '1503–1519',
    aspect: 402 / 595,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/402px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    words: [
      'simplicity','is','the','ultimate','sophistication','art','is','never',
      'finished','only','abandoned','water','is','the','driving','force','of',
      'all','nature','the','noblest','pleasure','is','the','joy','of',
      'understanding','learning','never','exhausts','the','mind','where','the',
      'spirit','does','not','work','with','the','hand','there','is','no','art',
      'painting','is','poetry','that','is','seen','rather','than','felt',
      'life','without','love','is','no','life','at','all','study','without',
      'desire','spoils','the','memory','experience','never','errs','it','is',
      'only','your','judgement','that','errs',
    ],
    fallback: [
      { x1: 0,    y1: 0,    x2: 1,    y2: 0.07, color: '#2a3518' },
      { x1: 0,    y1: 0.07, x2: 0.22, y2: 0.70, color: '#3a4a28' },
      { x1: 0.78, y1: 0.07, x2: 1,    y2: 0.70, color: '#3a4830' },
      { x1: 0.22, y1: 0.07, x2: 0.78, y2: 0.20, color: '#b8a078' },
      { x1: 0.28, y1: 0.20, x2: 0.72, y2: 0.55, color: '#c8a878' },
      { x1: 0.22, y1: 0.55, x2: 0.78, y2: 0.72, color: '#a88858' },
      { x1: 0,    y1: 0.70, x2: 1,    y2: 1,    color: '#3a2818' },
      { x1: 0,    y1: 0,    x2: 1,    y2: 1,    color: '#6a5838' },
    ],
  },
  {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    aspect: 1280 / 1013,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    words: [
      'i','dream','of','painting','and','then','i','paint','my','dream',
      'great','things','are','done','by','a','series','of','small','things',
      'brought','together','i','put','my','heart','and','my','soul','into',
      'my','work','and','have','lost','my','mind','in','the','process',
      'i','am','seeking','i','am','striving','i','am','in','it','with','all',
      'my','heart','what','would','life','be','if','we','had','no','courage',
      'to','attempt','anything','the','sadness','will','last','forever',
      'normality','is','a','paved','road','comfortable','to','walk','but',
      'no','flowers','grow','on','it','there','is','nothing','more','truly',
      'artistic','than','to','love','people',
    ],
    fallback: [
      { x1: 0,    y1: 0,    x2: 1,    y2: 0.12, color: '#0c1848' },
      { x1: 0,    y1: 0,    x2: 0.14, y2: 0.58, color: '#0a1038' },
      { x1: 0,    y1: 0.12, x2: 1,    y2: 0.58, color: '#1a2a6e' },
      { x1: 0.55, y1: 0,    x2: 0.66, y2: 0.68, color: '#0a0e28' },
      { x1: 0.06, y1: 0.08, x2: 0.26, y2: 0.32, color: '#d8c838' },
      { x1: 0.28, y1: 0.04, x2: 0.56, y2: 0.26, color: '#b8a820' },
      { x1: 0,    y1: 0.58, x2: 1,    y2: 0.78, color: '#1e3818' },
      { x1: 0,    y1: 0.78, x2: 1,    y2: 1,    color: '#382810' },
      { x1: 0,    y1: 0,    x2: 1,    y2: 1,    color: '#1a2060' },
    ],
  },
  {
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    aspect: 1280 / 878,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    words: [
      'i','must','have','flowers','always','and','always','color','is','my',
      'day','long','obsession','joy','and','torment','i','perhaps','owe',
      'having','become','a','painter','to','flowers','the','richness','i',
      'achieve','comes','from','nature','the','source','of','my','inspiration',
      'my','garden','is','my','most','beautiful','masterwork','i','would',
      'like','to','paint','the','way','a','bird','sings','everyone','discusses',
      'my','art','and','pretends','to','understand','as','if','it','were',
      'necessary','to','understand','when','it','is','simply','necessary',
      'to','love','what','i','do','comes','from','my','entrails','from',
      'a','profound','longing','that','i','would','not','know','how','to',
      'satisfy','otherwise',
    ],
    fallback: [
      { x1: 0,    y1: 0,    x2: 1,    y2: 0.28, color: '#3a6848' },
      { x1: 0,    y1: 0.28, x2: 0.42, y2: 0.58, color: '#285878' },
      { x1: 0.42, y1: 0.28, x2: 1,    y2: 0.58, color: '#204868' },
      { x1: 0,    y1: 0.58, x2: 1,    y2: 1,    color: '#2a5838' },
      { x1: 0.12, y1: 0.25, x2: 0.32, y2: 0.52, color: '#e0b8a8' },
      { x1: 0.48, y1: 0.45, x2: 0.68, y2: 0.70, color: '#d8c0b0' },
      { x1: 0.62, y1: 0.18, x2: 0.82, y2: 0.40, color: '#f0d0a0' },
      { x1: 0,    y1: 0,    x2: 1,    y2: 1,    color: '#306050' },
    ],
  },
]

// ── Module-scope state ───────────────────────────────────────────────
const imageCache = {}   // survives stop/start cycles (resize-safe)
let raf = null
let cleanup = null
let scheduleFrame = null  // set by start(), used by loadImage callback

let currentIdx = 0
let wordGrid = []
let readingGrid = []
let lightOn = true
let readingMode = false
let lightAngle = 0
let lightTarget = 0
let fadeAlpha = 1
let fadeDir = 0
let transitioning = false
let pendingIdx = null
let layout = {}

// ── Utilities ────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function sampleFallback(painting, nx, ny) {
  for (const region of painting.fallback) {
    if (nx >= region.x1 && nx <= region.x2 && ny >= region.y1 && ny <= region.y2) {
      return region.color
    }
  }
  return painting.fallback[painting.fallback.length - 1].color
}

function makeSamplerFromImage(img, painting) {
  const W = 200
  const H = Math.round(200 / painting.aspect)
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const octx = off.getContext('2d')
  octx.drawImage(img, 0, 0, W, H)
  const data = octx.getImageData(0, 0, W, H).data
  return function sample(nx, ny) {
    const px = clamp(Math.floor(nx * W), 0, W - 1)
    const py = clamp(Math.floor(ny * H), 0, H - 1)
    const i = (py * W + px) * 4
    const r = data[i].toString(16).padStart(2, '0')
    const g = data[i + 1].toString(16).padStart(2, '0')
    const b = data[i + 2].toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
}

function upgradeGridColors(img, idx) {
  const sampler = makeSamplerFromImage(img, PAINTINGS[idx])
  for (const cell of wordGrid) {
    const hex = sampler(cell.nx, cell.ny)
    Object.assign(cell, hexToHSL(hex))
  }
}

function buildWordGrid(idx, lo) {
  const painting = PAINTINGS[idx]
  const words = painting.words
  const grid = []
  const fontSizes = [8, 9, 10, 11]
  for (let row = 0; row < lo.rows; row++) {
    for (let col = 0; col < lo.cols; col++) {
      const nx = lo.cols > 1 ? col / (lo.cols - 1) : 0.5
      const ny = lo.rows > 1 ? row / (lo.rows - 1) : 0.5
      const x = lo.paintX + nx * lo.paintFitW
      const y = lo.paintY + ny * lo.paintFitH
      const hex = sampleFallback(painting, nx, ny)
      const hsl = hexToHSL(hex)
      grid.push({
        x, y, nx, ny,
        text: words[Math.floor(Math.random() * words.length)],
        tilt: Math.random() * 2 - 1,
        rotation: (Math.random() * 16 - 8) * Math.PI / 180,
        fontSize: fontSizes[Math.floor(Math.random() * fontSizes.length)],
        ...hsl,
      })
    }
  }
  // Sort by fontSize to minimize ctx.font state changes
  grid.sort((a, b) => a.fontSize - b.fontSize)
  return grid
}

function buildReadingGrid(idx, lo, ctx) {
  const painting = PAINTINGS[idx]
  const text = painting.words.join(' ')
  const fontSize = 13
  const lineH = Math.round(fontSize * 1.75)
  const pad = 20
  const maxW = lo.paintFitW - pad * 2
  ctx.font = `${fontSize}px Georgia, serif`
  const spaceW = ctx.measureText(' ').width

  // Word-wrap into lines
  const wds = text.split(' ')
  const lines = []
  let line = '', lineW = 0
  for (const w of wds) {
    const ww = ctx.measureText(w).width
    if (line && lineW + spaceW + ww > maxW) {
      lines.push(line)
      line = w; lineW = ww
    } else {
      line = line ? `${line} ${w}` : w
      lineW = line === w ? ww : lineW + spaceW + ww
    }
  }
  if (line) lines.push(line)

  const totalH = lines.length * lineH
  const startY = lo.paintY + Math.max(pad, (lo.paintFitH - totalH) / 2) + fontSize
  const startX = lo.paintX + pad

  const grid = []
  for (let li = 0; li < lines.length; li++) {
    const y = startY + li * lineH
    let x = startX
    for (const w of lines[li].split(' ')) {
      const nx = clamp((x - lo.paintX) / lo.paintFitW, 0, 1)
      const ny = clamp((y - lo.paintY) / lo.paintFitH, 0, 1)
      const hex = sampleFallback(painting, nx, ny)
      const hsl = hexToHSL(hex)
      grid.push({ text: w, x, y, fontSize, rotation: 0, tilt: 0, nx, ny, ...hsl })
      x += ctx.measureText(w).width + spaceW
    }
  }
  return grid
}

function upgradeReadingGridColors(img, idx) {
  const sampler = makeSamplerFromImage(img, PAINTINGS[idx])
  for (const cell of readingGrid) {
    const hex = sampler(cell.nx, cell.ny)
    Object.assign(cell, hexToHSL(hex))
  }
}

function loadImage(idx) {
  if (imageCache[idx]) return
  imageCache[idx] = 'loading'
  const img = new Image()
  img.crossOrigin = 'anonymous'  // must be before src
  img.onload = () => {
    imageCache[idx] = img
    if (currentIdx === idx && wordGrid.length > 0) {
      upgradeGridColors(img, idx)
      upgradeReadingGridColors(img, idx)
      if (scheduleFrame) scheduleFrame()
    }
  }
  img.onerror = () => { imageCache[idx] = 'failed' }
  img.src = PAINTINGS[idx].url
}

function startTransition(nextIdx) {
  if (transitioning) return
  transitioning = true
  pendingIdx = nextIdx
  fadeDir = -1
  loadImage(nextIdx)
  loadImage((nextIdx + 1) % PAINTINGS.length)
}

function computeLayout(lw, lh, idx) {
  const painting = PAINTINGS[idx]
  const availH = lh - FIXTURE_H - NAV_H
  const fitW = Math.min(lw * 0.88, availH * painting.aspect)
  const fitH = fitW / painting.aspect
  // Adaptive cell size: cap grid at ~1000 cells regardless of painting dimensions
  const MAX_CELLS = 1800
  const rawCols = Math.floor(fitW / CELL_SIZE)
  const rawRows = Math.floor(fitH / CELL_SIZE)
  const scale = Math.max(1, Math.sqrt((rawCols * rawRows) / MAX_CELLS))
  const cols = Math.max(1, Math.floor(rawCols / scale))
  const rows = Math.max(1, Math.floor(rawRows / scale))
  return {
    lw, lh,
    paintX: (lw - fitW) / 2,
    paintY: FIXTURE_H + (availH - fitH) / 2,
    paintFitW: fitW,
    paintFitH: fitH,
    cols,
    rows,
  }
}

// ── Rendering ────────────────────────────────────────────────────────
function drawWord(ctx, cell, lightAngle, alpha, dpr, litUp) {
  let finalL, wordAlpha
  if (litUp) {
    const alignment = Math.cos(lightAngle - cell.tilt * Math.PI / 4)
    const brightness = 0.5 + 0.35 * Math.max(0, alignment)
    finalL = clamp(cell.l + (brightness - 0.675) * 90, 8, 92)
    wordAlpha = alpha * (0.65 + brightness * 0.35)
  } else {
    finalL = clamp(cell.l, 8, 92)
    wordAlpha = alpha * 0.88
  }

  const cos = Math.cos(cell.rotation)
  const sin = Math.sin(cell.rotation)
  ctx.globalAlpha = wordAlpha
  ctx.fillStyle = `hsl(${cell.h}, ${cell.s}%, ${finalL}%)`
  ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * cell.x, dpr * cell.y)
  ctx.fillText(cell.text, 0, 0)
}

function drawFixture(ctx, lo, lightAngle, lightTarget, lightOn) {
  const pivotX = lo.lw / 2
  const pivotY = 12
  const armLen = 38
  const trackY = 8
  const trackL = lo.paintX + 20
  const trackR = lo.paintX + lo.paintFitW - 20

  const armX = pivotX + Math.sin(lightAngle) * armLen
  const armY = pivotY + Math.cos(lightAngle) * armLen

  // Light cone (only when on)
  if (lightOn) {
    const coneLen = lo.lh - armY - NAV_H
    const halfAngle = 0.24
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(armX, armY)
    ctx.lineTo(armX + Math.sin(lightAngle - halfAngle) * coneLen,
               armY + Math.cos(lightAngle - halfAngle) * coneLen)
    ctx.lineTo(armX + Math.sin(lightAngle + halfAngle) * coneLen,
               armY + Math.cos(lightAngle + halfAngle) * coneLen)
    ctx.closePath()
    ctx.fillStyle = 'rgba(255, 248, 200, 0.055)'
    ctx.fill()
    ctx.restore()
  }

  // Ceiling track
  ctx.strokeStyle = 'rgba(200, 190, 165, 0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(trackL, trackY)
  ctx.lineTo(trackR, trackY)
  ctx.stroke()

  // Preset tick marks (only when on)
  if (lightOn) {
    for (let i = 0; i < LIGHT_PRESETS.length; i++) {
      const frac = i / (LIGHT_PRESETS.length - 1)
      const tx = trackL + frac * (trackR - trackL)
      const isActive = Math.abs(lightTarget - LIGHT_PRESETS[i]) < 0.001
      ctx.strokeStyle = isActive ? 'rgba(255, 245, 160, 0.9)' : 'rgba(200, 190, 165, 0.3)'
      ctx.lineWidth = isActive ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(tx, trackY - 5)
      ctx.lineTo(tx, trackY + 5)
      ctx.stroke()
    }
  }

  // Arm
  ctx.strokeStyle = lightOn ? 'rgba(210, 200, 175, 0.85)' : 'rgba(120, 115, 100, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  ctx.lineTo(armX, armY)
  ctx.stroke()

  // Pivot
  ctx.fillStyle = 'rgba(220, 210, 185, 0.8)'
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2)
  ctx.fill()

  // Lamp head
  ctx.save()
  if (lightOn) {
    ctx.shadowColor = '#fff8c0'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#fff8c0'
  } else {
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(80, 75, 60, 0.7)'
  }
  ctx.beginPath()
  ctx.arc(armX, armY, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Ball chain — hangs from right end of track
  const chainX = trackR + 12
  const ballLinks = 4
  const linkSpacing = 7
  ctx.strokeStyle = lightOn ? 'rgba(200, 190, 165, 0.5)' : 'rgba(200, 190, 165, 0.35)'
  ctx.lineWidth = 1
  for (let i = 0; i < ballLinks; i++) {
    const by = trackY + i * linkSpacing + linkSpacing * 0.5
    ctx.beginPath()
    ctx.arc(chainX, by, 2, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Pull ball
  const pullY = trackY + ballLinks * linkSpacing + 5
  ctx.save()
  ctx.shadowColor = lightOn ? 'rgba(255, 245, 160, 0.6)' : 'rgba(100, 95, 80, 0.4)'
  ctx.shadowBlur = lightOn ? 6 : 0
  ctx.fillStyle = lightOn ? 'rgba(240, 230, 160, 0.9)' : 'rgba(100, 95, 80, 0.7)'
  ctx.beginPath()
  ctx.arc(chainX, pullY, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawNav(ctx, lo, idx, alpha) {
  const p = PAINTINGS[idx]
  const navY = lo.lh - NAV_H / 2

  ctx.globalAlpha = alpha
  ctx.font = 'italic 13px Georgia, serif'
  ctx.fillStyle = 'rgba(220, 215, 200, 0.85)'
  ctx.textAlign = 'center'
  ctx.fillText(`${p.title}  —  ${p.artist},  ${p.year}`, lo.lw / 2, navY - 6)

  ctx.globalAlpha = 1
  ctx.font = '12px Georgia, serif'
  ctx.fillStyle = 'rgba(190, 185, 170, 0.65)'
  ctx.textAlign = 'left'
  ctx.fillText('◀  prev', lo.lw * 0.10, navY + 14)
  ctx.textAlign = 'right'
  ctx.fillText('next  ▶', lo.lw * 0.90, navY + 14)
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
}

// ── Module export ────────────────────────────────────────────────────
export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw = canvas.width / dpr
    const lh = canvas.height / dpr
    ctx.scale(dpr, dpr)

    // Reset per-start animation state (not currentIdx, lightOn, readingMode, or imageCache)
    fadeAlpha = 1; fadeDir = 0; transitioning = false; pendingIdx = null

    // Compute layout and build grids
    layout = computeLayout(lw, lh, currentIdx)
    wordGrid = buildWordGrid(currentIdx, layout)
    readingGrid = buildReadingGrid(currentIdx, layout, ctx)

    // Upgrade immediately if image already cached
    if (imageCache[currentIdx] instanceof HTMLImageElement) {
      upgradeGridColors(imageCache[currentIdx], currentIdx)
      upgradeReadingGridColors(imageCache[currentIdx], currentIdx)
    } else {
      loadImage(currentIdx)
    }

    // Prefetch adjacent paintings
    loadImage((currentIdx + 1) % PAINTINGS.length)

    // Click handler
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const cx = (e.clientX - rect.left) * (lw / rect.width)
      const cy = (e.clientY - rect.top) * (lh / rect.height)

      // Ball chain hit test (hangs from right end of track)
      const trackR = layout.paintX + layout.paintFitW - 20
      const chainX = trackR + 12
      const pullY = FIXTURE_H * 0.6
      if (Math.hypot(cx - chainX, cy - pullY) < 16) {
        lightOn = !lightOn
        if (!lightOn) readingMode = false  // reset reading mode when turning back on
        scheduleFrame()
        return
      }

      // Fixture zone — find nearest preset tick (only when light is on)
      if (cy < FIXTURE_H && lightOn) {
        const trackL = layout.paintX + 20
        let nearest = LIGHT_PRESETS[0]
        let minDist = Infinity
        for (let i = 0; i < LIGHT_PRESETS.length; i++) {
          const frac = i / (LIGHT_PRESETS.length - 1)
          const tx = trackL + frac * (trackR - trackL)
          const d = Math.abs(cx - tx)
          if (d < minDist) { minDist = d; nearest = LIGHT_PRESETS[i] }
        }
        lightTarget = nearest
        scheduleFrame()
        return
      }

      // Painting area click when lights off — toggle reading mode
      if (!lightOn &&
          cx >= layout.paintX && cx <= layout.paintX + layout.paintFitW &&
          cy >= layout.paintY && cy <= layout.paintY + layout.paintFitH) {
        readingMode = !readingMode
        scheduleFrame()
        return
      }

      // Nav zone
      if (cy > lh - NAV_H) {
        if (cx < lw * 0.35) { startTransition((currentIdx - 1 + PAINTINGS.length) % PAINTINGS.length); scheduleFrame() }
        if (cx > lw * 0.65) { startTransition((currentIdx + 1) % PAINTINGS.length); scheduleFrame() }
      }
    }
    canvas.addEventListener('click', onClick)
    cleanup = () => canvas.removeEventListener('click', onClick)

    let rafScheduled = false

    scheduleFrame = function scheduleFrame() {
      if (!rafScheduled) {
        rafScheduled = true
        raf = requestAnimationFrame(tick)
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, lw, lh)

      const activeGrid = readingMode ? readingGrid : wordGrid
      let lastSize = -1
      for (const cell of activeGrid) {
        if (cell.fontSize !== lastSize) {
          ctx.font = `${cell.fontSize}px Georgia, serif`
          lastSize = cell.fontSize
        }
        drawWord(ctx, cell, lightAngle, fadeAlpha, dpr, lightOn && !readingMode)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      drawFixture(ctx, layout, lightAngle, lightTarget, lightOn)
      drawNav(ctx, layout, currentIdx, fadeAlpha)
    }

    // Animation loop
    function tick() {
      rafScheduled = false

      const lightDelta = lightTarget - lightAngle
      const lightMoving = Math.abs(lightDelta) > 0.0005
      if (lightMoving) {
        lightAngle += lightDelta * 0.35
      } else {
        lightAngle = lightTarget
      }

      // Fade transition logic
      if (fadeDir === -1) {
        fadeAlpha = Math.max(0, fadeAlpha - 0.045)
        if (fadeAlpha <= 0) {
          currentIdx = pendingIdx
          readingMode = false
          layout = computeLayout(lw, lh, currentIdx)
          wordGrid = buildWordGrid(currentIdx, layout)
          readingGrid = buildReadingGrid(currentIdx, layout, ctx)
          if (imageCache[currentIdx] instanceof HTMLImageElement) {
            upgradeGridColors(imageCache[currentIdx], currentIdx)
            upgradeReadingGridColors(imageCache[currentIdx], currentIdx)
          } else {
            loadImage(currentIdx)
          }
          fadeDir = 1
        }
      } else if (fadeDir === 1) {
        fadeAlpha = Math.min(1, fadeAlpha + 0.045)
        if (fadeAlpha >= 1) { fadeDir = 0; transitioning = false }
      }

      drawFrame()

      // Only keep looping while something is animating
      if (lightMoving || fadeDir !== 0) scheduleFrame()
    }

    drawFrame()  // initial draw
  },

  stop() {
    cancelAnimationFrame(raf)
    raf = null
    scheduleFrame = null
    if (cleanup) { cleanup(); cleanup = null }
    wordGrid = []
  },
}
