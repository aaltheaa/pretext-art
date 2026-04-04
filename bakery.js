// ── Constants ─────────────────────────────────────────────────────────────────
const PI = Math.PI

// ── Utilities ─────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255
  let g = parseInt(hex.slice(3,5),16)/255
  let b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  let h=0, s=0
  const l = (max+min)/2
  if (max!==min) {
    const d = max-min
    s = l>0.5 ? d/(2-max-min) : d/(max+min)
    switch(max) {
      case r: h=((g-b)/d+(g<b?6:0))/6; break
      case g: h=((b-r)/d+2)/6; break
      case b: h=((r-g)/d+4)/6; break
    }
  }
  return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) }
}

// ── Shapes ────────────────────────────────────────────────────────────────────
// path(ctx, cx, cy, size) draws a closed path in logical coords
// bbox(size) returns {hw, hh} half-dimensions of bounding box

const Shapes = {
  croissant: {
    // Crescent arc shape: outer convex arch + inner concave arch meeting at tapered tips
    path(ctx, cx, cy, size) {
      const w = size * 1.1
      const bow = size * 0.52   // outer arch rises this high above the tip line
      const belly = size * 0.16 // inner arch rises this high (less) — creates concave belly
      ctx.beginPath()
      ctx.moveTo(cx - w, cy + size * 0.04)
      ctx.bezierCurveTo(cx - w * 0.42, cy - bow, cx + w * 0.42, cy - bow, cx + w, cy + size * 0.04)
      ctx.bezierCurveTo(cx + w * 0.42, cy - belly, cx - w * 0.42, cy - belly, cx - w, cy + size * 0.04)
      ctx.closePath()
    },
    bbox: s => ({ hw: s * 1.14, hh: s * 0.56 }),
  },
  almondCroissant: {
    // Plump oval — an almond croissant is a filled, reassembled pastry; rounder than a regular croissant
    path(ctx, cx, cy, size) {
      ctx.beginPath()
      ctx.ellipse(cx, cy, size * 1.0, size * 0.52, 0, 0, 2 * PI)
    },
    bbox: s => ({ hw: s * 1.04, hh: s * 0.55 }),
  },
  painAuChocolat: {
    // Capsule/stadium shape — reads clearly as an elongated rolled log
    path(ctx, cx, cy, size) {
      const w = size * 1.35, h = size * 0.72
      ctx.beginPath()
      ctx.roundRect(cx - w/2, cy - h/2, w, h, h / 2)
    },
    bbox: s => ({ hw: s * 0.70, hh: s * 0.38 }),
  },
  danish: {
    path(ctx, cx, cy, size) {
      ctx.beginPath()
      ctx.roundRect(cx - size*0.9/2, cy - size*0.9/2, size*0.9, size*0.9, size*0.2)
    },
    bbox: s => ({ hw: s*0.48, hh: s*0.48 }),
  },
  muffin: {
    path(ctx, cx, cy, size) {
      const domeR = size*0.52
      const domeY = cy - size*0.16
      const baseTop = cy + size*0.10
      const baseH = size*0.52
      const bTop = size*0.88, bBot = size*0.66
      ctx.beginPath()
      ctx.arc(cx, domeY, domeR, PI, 0)
      ctx.lineTo(cx + bTop/2, baseTop)
      ctx.lineTo(cx + bBot/2, baseTop + baseH)
      ctx.lineTo(cx - bBot/2, baseTop + baseH)
      ctx.lineTo(cx - bTop/2, baseTop)
      ctx.closePath()
    },
    bbox: s => ({ hw: s*0.50, hh: s*0.80 }),
  },
  bagel: {
    path(ctx, cx, cy, size) {
      ctx.beginPath()
      ctx.ellipse(cx, cy, size*0.90, size*0.60, 0, 0, 2*PI)
      ctx.ellipse(cx, cy, size*0.36, size*0.24, 0, 0, 2*PI, true)
    },
    bbox: s => ({ hw: s*0.94, hh: s*0.63 }),
  },
  donut: {
    path(ctx, cx, cy, size) {
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, 2*PI)
      ctx.arc(cx, cy, size*0.42, 0, 2*PI, true)
    },
    bbox: s => ({ hw: s*1.04, hh: s*1.04 }),
  },
  galette: {
    path(ctx, cx, cy, size) {
      const verts = 14
      const j = [0.04,-0.03,0.06,-0.02,0.05,-0.04,0.03,-0.05,0.07,-0.02,0.04,-0.03,0.05,-0.04]
      ctx.beginPath()
      for (let i=0; i<verts; i++) {
        const a = (i/verts)*2*PI - PI/2
        const r = size*(1+j[i])
        const px = cx + Math.cos(a)*r, py = cy + Math.sin(a)*r
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py)
      }
      ctx.closePath()
    },
    bbox: s => ({ hw: s*1.1, hh: s*1.1 }),
  },
  canele: {
    // Ridged circle — the fluted silhouette of a canelé viewed from above
    path(ctx, cx, cy, size) {
      const n = 20
      const rOut = size * 0.82
      const rIn  = size * 0.70
      ctx.beginPath()
      for (let i = 0; i < n * 2; i++) {
        const a  = (i / (n * 2)) * 2 * PI
        const r  = i % 2 === 0 ? rOut : rIn
        const px = cx + Math.cos(a) * r
        const py = cy + Math.sin(a) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
    },
    bbox: s => ({ hw: s * 0.86, hh: s * 0.86 }),
  },
}

// ── Pastry data ───────────────────────────────────────────────────────────────
const PASTRIES = [
  {
    name: 'Croissant',
    shape: Shapes.croissant,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      return { h:32, s:68, l:clamp(Math.round(58 - d*22), 30, 62) }
    },
    words: ['butter','laminate','fold','chill','proof','flour','yeast','milk',
            'flaky','golden','layers','crisp','glaze','score','bake','steam',
            'rise','roll','sheet','turn','crescent','crumb','warm','honey',
            'détrempe','feuilletage','envelope','brioche','lard','peel'],
    recipeCard: {
      meta: 'Makes 8 · Active 3 h · Total 2 days',
      ingredients: ['500 g bread flour','10 g instant yeast','60 g sugar','10 g salt','300 ml warm whole milk','280 g cold unsalted butter, for lamination','1 egg, for egg wash'],
      steps: [
        'Combine flour, yeast, sugar, salt, and warm milk. Mix to a shaggy dough. Knead 5 minutes. Cover and rest 1 hour, then overnight in the fridge.',
        'Beat cold butter between parchment into a 19 cm square — pliable but still cold.',
        'Roll dough to twice the width of the butter. Enclose butter, pinch seams. Roll out, fold in thirds. Rotate 90°. Repeat for 6 turns total, resting 30 minutes in the fridge between every 2 turns.',
        'Roll to 4 mm. Cut into tall triangles. Roll from base to tip, curving ends inward.',
        'Proof on lined trays 2 hours until visibly puffy and jiggling when shaken.',
        'Brush with egg wash. Bake at 400°F for 18–20 minutes until deep amber. Cool 15 minutes.',
      ],
    },
  },
  {
    name: 'Almond Croissant',
    shape: Shapes.almondCroissant,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      return { h:36, s:60, l:clamp(Math.round(60 - d*18), 34, 65) }
    },
    words: ['almond','frangipane','cream','paste','sugar','butter','flour','egg',
            'flaked','toasted','sliced','sweet','nutty','filled','soaked','syrup',
            'golden','rich','moist','crunch','fragrant','amaretto','soft','crisp',
            'glaze','warm','aroma','twice','baked','custard'],
    recipeCard: {
      meta: 'Makes 6 · Active 30 min · Uses day-old croissants',
      ingredients: ['6 day-old croissants','115 g unsalted butter, softened','100 g sugar','2 eggs','120 g almond flour','1 tbsp amaretto or almond extract','Simple syrup (equal parts water and sugar, simmered)','60 g sliced almonds','Icing sugar, to finish'],
      steps: [
        'Make frangipane: beat butter and sugar until pale. Add eggs one at a time, fold in almond flour and amaretto.',
        'Slice each croissant horizontally. Brush cut surfaces generously with simple syrup.',
        'Spread frangipane inside the croissant. Press top back on.',
        'Coat the outside with more frangipane. Press sliced almonds all over.',
        'Bake at 375°F for 15–18 minutes until set and almonds are deeply golden. Dust with icing sugar while hot.',
      ],
    },
  },
  {
    name: 'Pain au Chocolat',
    shape: Shapes.painAuChocolat,
    colorAt(nx, ny) {
      const edge = Math.max(Math.abs(nx), Math.abs(ny))
      return { h:24, s:52, l:clamp(Math.round(16 + edge*22), 12, 36) }
    },
    words: ['chocolate','dark','bitter','butter','fold','laminate','chill','proof',
            'flour','yeast','milk','bake','layers','crisp','warm','melt','ganache',
            'rich','deep','bar','enclose','wrap','golden','edge','steam','flake',
            'crumb','dip','shell','cocoa'],
    recipeCard: {
      meta: 'Makes 12 · Active 3 h · Total 2 days',
      ingredients: ['500 g bread flour','10 g instant yeast','60 g sugar','10 g salt','300 ml warm whole milk','280 g cold unsalted butter, for lamination','180 g dark chocolate (60–70%), cut into batons','1 egg, for egg wash'],
      steps: [
        'Prepare laminated dough following the croissant method through all 6 turns. Rest overnight.',
        'Roll to 4 mm. Cut rectangles 12 cm × 20 cm.',
        'Place two chocolate batons near one short edge. Roll tightly over them, seam-side down.',
        'Proof 2 hours until visibly puffed.',
        'Brush with egg wash. Bake at 400°F for 16–18 minutes until deeply golden.',
        "Cool 10 minutes before eating — or don't.",
      ],
    },
  },
  {
    name: 'Danish',
    shape: Shapes.danish,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      const l = d < 0.35 ? 74 : clamp(68 - (d - 0.35)*20, 44, 74)
      return { h:40, s:54, l:Math.round(l) }
    },
    words: ['fold','pastry','cream','cheese','jam','berry','glaze','sugar','butter',
            'flour','yeast','milk','egg','braid','twist','roll','proof','golden',
            'sweet','soft','flaky','puff','custard','fruit','center','swirl',
            'drizzle','icing','bake','warm'],
    recipeCard: {
      meta: 'Makes 9 · Active 2.5 h · Total overnight',
      ingredients: ['500 g bread flour','14 g instant yeast','80 g sugar','8 g salt','300 ml warm milk','1 egg','250 g cold unsalted butter, for lamination','200 g cream cheese','60 g sugar','1 tsp vanilla extract','Thick jam or fruit preserves','Icing sugar and milk, for drizzle'],
      steps: [
        'Make enriched laminated dough: combine flour, yeast, sugar, salt, milk, and egg. Laminate with butter using 4 turns. Rest overnight.',
        'Beat cream cheese with sugar and vanilla until smooth.',
        'Roll dough to 5 mm. Cut into 10 cm squares.',
        'Fold all four corners toward the center and press firmly.',
        'Pipe cream cheese into the center well, add a spoonful of jam.',
        'Proof 90 minutes. Bake at 375°F for 14 minutes until golden.',
        'Brush warm pastries with apricot glaze. Drizzle thinned icing sugar across the top.',
      ],
    },
  },
  {
    name: 'Blueberry Muffin',
    shape: Shapes.muffin,
    colorAt(nx, ny) {
      // Overlapping sine waves produce organic blueberry-spot patches
      const spot = Math.sin(nx * 12.3 + ny * 6.7) * Math.sin(ny * 10.9 - nx * 5.1)
      const inDome = ny < 0.2
      if (inDome && spot > 0.68) return { h: 258, s: 52, l: 33 }  // deep blueberry
      if (inDome && spot > 0.54) return { h: 268, s: 40, l: 42 }  // lighter berry
      const isTop = ny < -0.1
      return { h: isTop ? 34 : 32, s: 58, l: clamp(Math.round(58 + ny * 8), 38, 64) }
    },
    words: ['blueberry','batter','fold','sugar','butter','flour','egg','milk',
            'vanilla','lemon','zest','baking','powder','moist','tender','dome',
            'peak','burst','purple','crumb','top','warm','sweet','fresh','wild',
            'plump','juicy','salt','sour','cream'],
    recipeCard: {
      meta: 'Makes 12 · Active 20 min · Bake 20 min',
      ingredients: ['300 g all-purpose flour','2 tsp baking powder','½ tsp salt','150 g sugar','115 g unsalted butter, melted','2 eggs','240 ml whole milk','1 tsp vanilla extract','Zest of 1 lemon','280 g fresh blueberries','Turbinado sugar, for topping'],
      steps: [
        'Whisk flour, baking powder, and salt.',
        'In another bowl, whisk sugar, butter, eggs, milk, vanilla, and lemon zest.',
        'Pour wet into dry. Fold until just combined — lumps are fine. Do not overmix.',
        'Fold in blueberries. Fill tins to the very brim for a tall dome. Scatter turbinado sugar over each.',
        'Bake at 425°F for 5 minutes. Reduce to 375°F, bake 15 minutes more. Skewer should come out clean.',
        'Cool 10 minutes in tin before turning out.',
      ],
    },
  },
  {
    name: 'Bagel',
    shape: Shapes.bagel,
    colorAt(nx, ny) {
      const edge = Math.max(Math.abs(nx), Math.abs(ny))
      return { h:30, s:56, l:clamp(Math.round(44 + edge*18), 36, 62) }
    },
    words: ['boil','bake','flour','yeast','water','malt','salt','sesame','poppy',
            'everything','crust','chewy','dense','hole','ring','score','proof',
            'shape','roll','oven','steam','glaze','egg','topping','dough','stretch',
            'lye','Montreal','bagel','wood'],
    recipeCard: {
      meta: 'Makes 8 · Active 1 h · Total overnight',
      ingredients: ['500 g high-gluten bread flour','7 g instant yeast','10 g salt','1 tbsp malt barley syrup, plus more for boiling','280 ml warm water','Sesame, poppy, or everything seasoning'],
      steps: [
        'Combine all ingredients. The dough will be stiff — stiffer than bread. Knead 10 minutes until smooth.',
        'Divide into 8 portions. Roll each into a rope, join ends, pinch firmly to seal.',
        'Place on a floured tray. Retard in the fridge overnight.',
        'Boil water with 2 tbsp malt syrup. Boil bagels 1 minute per side.',
        'Brush with egg white. Press into seasoning.',
        'Bake on a preheated stone at 450°F for 20 minutes until deep mahogany.',
      ],
    },
  },
  {
    name: 'Old Fashioned Donut',
    shape: Shapes.donut,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      const ring = Math.abs(d - 0.7) / 0.3
      return { h:38, s:32, l:clamp(Math.round(82 - ring*28), 52, 86) }
    },
    words: ['fry','glaze','cinnamon','nutmeg','cake','flour','baking','powder','egg',
            'sugar','butter','milk','vanilla','dip','drip','coat','ring','golden',
            'crisp','crack','ridge','sweet','soft','dense','oil','temp','cool',
            'flip','rack','warm'],
    recipeCard: {
      meta: 'Makes 10–12 · Active 45 min · Fry 15 min',
      ingredients: ['280 g cake flour','1½ tsp baking powder','½ tsp salt','½ tsp cinnamon','¼ tsp freshly grated nutmeg','100 g sugar','30 g unsalted butter, softened','2 egg yolks','120 ml buttermilk','Neutral oil, for frying','200 g icing sugar','3 tbsp whole milk','½ tsp vanilla'],
      steps: [
        'Whisk flour, baking powder, salt, cinnamon, and nutmeg.',
        'Cream butter and sugar. Beat in egg yolks, then buttermilk. Add dry ingredients — mix to a sticky dough, do not overwork.',
        'Chill at least 1 hour.',
        'Roll to 12 mm thick. Cut with a donut cutter.',
        'Fry in oil at 375°F for 1 minute per side until deeply golden with cracked ridges. Drain on a rack.',
        'Whisk icing sugar, milk, and vanilla into a glaze. Dip warm donuts, let excess drip. Set until glaze firms.',
      ],
    },
  },
  {
    name: 'Galette',
    shape: Shapes.galette,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      return { h:30, s:58, l:clamp(Math.round(62 - d*26), 26, 62) }
    },
    words: ['butter','flour','water','salt','fold','rough','flaky','rustic','crimp',
            'cream','fruit','custard','almond','frangipane','bake','tart','crust',
            'edge','seal','caramelize','golden','pear','apple','fig','plum','walnut',
            'honey','free-form','galette','score'],
    recipeCard: {
      meta: 'Serves 6–8 · Active 45 min · Bake 40 min',
      ingredients: ['200 g all-purpose flour','½ tsp salt','1 tsp sugar','140 g cold unsalted butter, cubed','3–5 tbsp ice water','120 g almond cream or thick jam','4–5 pieces seasonal fruit, thinly sliced','1 egg, for egg wash','2 tbsp turbinado sugar'],
      steps: [
        'Cut cold butter into flour, salt, and sugar until pea-sized pieces remain.',
        'Drizzle ice water one tablespoon at a time until dough just holds. Do not overwork. Chill 30 minutes.',
        'Roll into a rough 30 cm circle on parchment — rustic is the point.',
        'Spread almond cream to within 5 cm of the edge. Fan fruit over the top.',
        'Fold the border over, pleating loosely. Brush crust with egg wash, scatter turbinado sugar.',
        'Bake at 400°F for 40 minutes until crust is deeply golden and fruit is caramelized. Cool 15 minutes.',
      ],
    },
  },
  {
    name: 'Canelé',
    shape: Shapes.canele,
    colorAt(nx, ny) {
      const d = Math.sqrt(nx*nx + ny*ny)
      // Deep caramelized mahogany at center, warm amber glow at the ridged edges
      return { h:28, s:60, l:clamp(Math.round(18 + d*22), 15, 42) }
    },
    words: ['caramel','custard','rum','vanilla','copper','mold','crust','batter','beeswax',
            'dark','amber','bronze','crisp','custardy','Bordeaux','flute','ridge','burnish',
            'eggy','butter','milk','flour','rest','pour','patience','lacquer','mahogany',
            'overnight','unmold','silky'],
    recipeCard: {
      meta: 'Makes 12 · Active 30 min · Rest 24–48 h · Bake 1 h',
      ingredients: ['500 ml whole milk','1 vanilla bean, split and scraped','2 eggs + 2 yolks','200 g sugar','100 g all-purpose flour','50 g unsalted butter, melted','3 tbsp dark rum','Beeswax and butter, for the molds'],
      steps: [
        'Heat milk with the vanilla bean and its seeds until just simmering. Remove from heat and cool to lukewarm.',
        'Whisk sugar and flour together. Beat in eggs and yolks. Gradually stir in the warm milk. Mix in melted butter and rum. Strain the batter.',
        'Cover and rest in the fridge for at least 24 hours — 48 is better. The long rest develops flavour and improves the crust.',
        'Melt beeswax and butter together (roughly 3:1 by weight). Brush canelé molds generously inside, coating every ridge. Chill until the wax sets firm.',
        'Stir the rested batter well. Fill cold molds to within 5 mm of the rim.',
        'Bake at 230°C for 15 minutes, then reduce to 180°C and bake 45–55 minutes more. The canelés should be deep mahogany to near-black on the outside. Do not underbake.',
        'Unmold immediately onto a rack. The exterior crisps as it cools. Best eaten within 2 hours of baking.',
      ],
    },
  },
]

// ── Module-scope state ────────────────────────────────────────────────────────
let raf = null
let cleanup = null
let scheduleFrame = null
let rafScheduled = false

let layouts = []        // [{ cx, cy, size }] one per pastry
let mosaicGrids = []    // word cells filling each pastry shape
let recipeGrids = []    // word cells for recipe text
let expandedIdx = -1    // which pastry is animating/shown (-1 only when fully closed)
let expanding = false   // true = animating open, false = animating closed
let expandProgress = 0  // 0 = collapsed, 1 = fully expanded (lerped)
let hoveredIdx = -1
let hitCtx = null       // shared offscreen ctx for shape hit testing

// ── Layout ────────────────────────────────────────────────────────────────────
function computeLayouts(lw, lh) {
  const PAD = lw * 0.04
  const usableW = lw - PAD * 2
  const COUNTER_H = Math.round(lh * 0.13)
  const playH = lh - COUNTER_H

  if (lw < 550) {
    // Mobile: 3 columns × 3 rows grid
    const COLS = 3
    const colW = usableW / COLS
    const baseSize = Math.min(colW * 0.32, playH * 0.14)
    const rowYs = [playH * 0.18, playH * 0.50, playH * 0.82]
    return PASTRIES.map((p, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const cx = PAD + colW * col + colW / 2
      const cy = rowYs[row] ?? rowYs[rowYs.length - 1]
      return { cx, cy, size: baseSize }
    })
  }

  // Desktop: Row 1 indices 0–4 (5 pastries), Row 2 indices 5–8 (4 pastries)
  const row1n = 5, row2n = 4
  const colW1 = usableW / row1n
  const colW2 = usableW / row2n
  const baseSize = Math.min(colW1 * 0.30, playH * 0.22)

  const row1Y = playH * 0.30
  const row2Y = playH * 0.72

  return PASTRIES.map((p, i) => {
    const row2 = i >= 5
    const ri = row2 ? i - 5 : i
    const colW = row2 ? colW2 : colW1
    const cx = PAD + colW * ri + colW / 2
    const cy = row2 ? row2Y : row1Y
    return { cx, cy, size: baseSize }
  })
}

// ── Grid building ─────────────────────────────────────────────────────────────
function buildPastryGrid(pIdx, lo) {
  const p = PASTRIES[pIdx]
  const { hw, hh } = p.shape.bbox(lo.size)
  const CELL = 8
  const cells = []

  // Use a dedicated offscreen canvas for hit testing (avoids DPR transform issues)
  const W = Math.ceil(hw * 2) + 4, H = Math.ceil(hh * 2) + 4
  const hc = document.createElement('canvas')
  hc.width = W; hc.height = H
  const hx = hc.getContext('2d')
  const ocx = hw + 2, ocy = hh + 2
  p.shape.path(hx, ocx, ocy, lo.size)

  const words = p.words
  const fontSizes = [7, 8, 9]

  for (let dy = -hh; dy <= hh; dy += CELL) {
    for (let dx = -hw; dx <= hw; dx += CELL) {
      if (hx.isPointInPath(ocx + dx, ocy + dy, 'evenodd')) {
        const nx = hw > 0 ? dx / hw : 0
        const ny = hh > 0 ? dy / hh : 0
        const hsl = p.colorAt(nx, ny)
        cells.push({
          // offset from pastry center — applied at draw time
          dx, dy,
          text: words[Math.floor(Math.random() * words.length)],
          fontSize: fontSizes[Math.floor(Math.random() * 3)],
          tilt: Math.random() * 2 - 1,
          rotation: (Math.random() * 10 - 5) * PI / 180,
          ...hsl,
        })
      }
    }
  }
  return cells
}

function buildRecipeGrid(pIdx, x, y, maxW, ctx) {
  const p = PASTRIES[pIdx]
  const BODY_SIZE = 11
  const HEADER_SIZE = 13
  const lineH = Math.round(BODY_SIZE * 1.72)
  const headerLineH = Math.round(HEADER_SIZE * 1.8)

  // Measure space width at body size
  ctx.font = `${BODY_SIZE}px Georgia, serif`
  const spaceW = ctx.measureText(' ').width

  // Build a flat list of segments from recipeCard
  const rc = p.recipeCard
  // Each segment: { kind: 'header'|'body'|'spacer', text, indent }
  const segments = []

  if (rc.meta) {
    segments.push({ kind: 'body', text: rc.meta, indent: 0 })
    segments.push({ kind: 'spacer' })
  }

  segments.push({ kind: 'header', text: 'Ingredients' })

  // Measure bullet indent at body size
  ctx.font = `${BODY_SIZE}px Georgia, serif`
  const bulletIndent = ctx.measureText('– ').width

  for (const ing of rc.ingredients) {
    segments.push({ kind: 'body', text: '– ' + ing, indent: bulletIndent })
  }

  segments.push({ kind: 'spacer' })
  segments.push({ kind: 'header', text: 'Instructions' })

  // Measure step number indent (use widest: '10. ')
  const stepIndent = ctx.measureText('10. ').width

  rc.steps.forEach((step, i) => {
    segments.push({ kind: 'body', text: (i + 1) + '. ' + step, indent: stepIndent })
  })

  // Word-wrap all segments into lines
  // Each emitted line: { text, x (start), fontWeight, fontSize, isFirstOfSegment }
  const lines = []

  function wrapSegment(seg) {
    if (seg.kind === 'spacer') {
      lines.push({ text: '', x, fontWeight: 'normal', fontSize: BODY_SIZE, lineH })
      return
    }

    const isHeader = seg.kind === 'header'
    const fSize = isHeader ? HEADER_SIZE : BODY_SIZE
    const fWeight = isHeader ? 'bold' : 'normal'
    const lH = isHeader ? headerLineH : lineH
    ctx.font = `${fWeight} ${fSize}px Georgia, serif`
    const sw = ctx.measureText(' ').width

    if (isHeader) {
      // Add a small gap before headers (half line)
      if (lines.length > 0) {
        lines.push({ text: '', x, fontWeight: 'normal', fontSize: BODY_SIZE, lineH: Math.round(lineH * 0.4) })
      }
      lines.push({ text: seg.text, x, fontWeight: fWeight, fontSize: fSize, lineH: lH })
      return
    }

    // Body: word-wrap with hanging indent for continuation lines
    const words = seg.text.split(' ')
    let curLine = ''
    let curW = 0
    let isFirst = true

    for (const w of words) {
      const ww = ctx.measureText(w).width
      const lineX = isFirst ? x : x + seg.indent
      const availW = isFirst ? maxW : maxW - seg.indent

      if (curLine && curW + sw + ww > availW) {
        lines.push({ text: curLine, x: lineX, fontWeight: fWeight, fontSize: fSize, lineH: lH })
        isFirst = false
        curLine = w
        curW = ww
      } else {
        curLine = curLine ? curLine + ' ' + w : w
        curW = curLine === w ? ww : curW + sw + ww
      }
    }
    if (curLine) {
      const lineX = isFirst ? x : x + seg.indent
      lines.push({ text: curLine, x: lineX, fontWeight: fWeight, fontSize: fSize, lineH: lH })
    }
  }

  for (const seg of segments) wrapSegment(seg)

  // Compute cumulative Y positions
  const cells = []
  let curY = y
  for (let li = 0; li < lines.length; li++) {
    const ln = lines[li]
    const ry = curY
    if (ln.text) {
      ctx.font = `${ln.fontWeight} ${ln.fontSize}px Georgia, serif`
      const sw = ctx.measureText(' ').width
      let rx = ln.x
      for (const w of ln.text.split(' ')) {
        const nx = clamp((rx - x) / maxW, 0, 1)
        const ny = clamp(li / Math.max(lines.length - 1, 1), 0, 1)
        const hsl = p.colorAt(nx * 2 - 1, ny * 2 - 1)
        cells.push({ x: rx, y: ry, text: w, fontSize: ln.fontSize, fontWeight: ln.fontWeight, rotation: 0, tilt: 0, ...hsl })
        rx += ctx.measureText(w).width + sw
      }
    }
    curY += ln.lineH
  }

  return { cells, totalH: curY - y }
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function drawCounter(ctx, lw, lh, dpr) {
  // Called with ctx already scaled by dpr — draw in logical coords
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalAlpha = 1

  // Dark background
  ctx.fillStyle = '#09090f'
  ctx.fillRect(0, 0, lw, lh)

  // Counter surface (warm brown band at bottom)
  const surfaceY = lh * 0.87
  const grad = ctx.createLinearGradient(0, surfaceY, 0, lh)
  grad.addColorStop(0, '#2e1a0a')
  grad.addColorStop(0.3, '#241408')
  grad.addColorStop(1, '#140c04')
  ctx.fillStyle = grad
  ctx.fillRect(0, surfaceY, lw, lh - surfaceY)

  // Counter edge highlight
  ctx.strokeStyle = 'rgba(200,155,70,0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, surfaceY)
  ctx.lineTo(lw, surfaceY)
  ctx.stroke()
}

function drawCell(ctx, x, y, cell, dpr, alpha) {
  const cos = Math.cos(cell.rotation)
  const sin = Math.sin(cell.rotation)
  ctx.setTransform(dpr*cos, dpr*sin, -dpr*sin, dpr*cos, dpr*x, dpr*y)
  ctx.font = `${cell.fontSize}px Georgia, serif`
  ctx.fillStyle = `hsl(${cell.h},${cell.s}%,${cell.l}%)`
  ctx.globalAlpha = alpha
  ctx.fillText(cell.text, 0, 0)
}

function drawPastryLabel(ctx, lo, p, alpha, dpr) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalAlpha = alpha
  ctx.font = '10px Georgia, serif'
  ctx.fillStyle = 'rgba(210,200,175,0.7)'
  ctx.textAlign = 'center'
  const { hh } = p.shape.bbox(lo.size)
  ctx.fillText(p.name, lo.cx, lo.cy + hh + 14)
  ctx.textAlign = 'left'
}

// ── Hit testing ───────────────────────────────────────────────────────────────
function hitTest(mx, my) {
  if (!hitCtx) return -1
  for (let i = PASTRIES.length - 1; i >= 0; i--) {
    const lo = layouts[i]
    const { hw, hh } = PASTRIES[i].shape.bbox(lo.size)
    if (Math.abs(mx - lo.cx) <= hw && Math.abs(my - lo.cy) <= hh) {
      PASTRIES[i].shape.path(hitCtx, lo.cx, lo.cy, lo.size)
      if (hitCtx.isPointInPath(mx, my, 'evenodd')) return i
    }
  }
  return -1
}

// ── Render ────────────────────────────────────────────────────────────────────
function render(ctx, lw, lh, dpr) {
  drawCounter(ctx, lw, lh, dpr)

  const ep = expandProgress  // 0–1

  if (expandedIdx === -1) {
    // Fully collapsed — draw all pastries normally
    for (let i = 0; i < PASTRIES.length; i++) {
      const lo = layouts[i]
      for (const cell of mosaicGrids[i]) {
        drawCell(ctx, lo.cx + cell.dx, lo.cy + cell.dy, cell, dpr, 1)
      }
      drawPastryLabel(ctx, lo, PASTRIES[i], 1, dpr)
    }
  } else {
    // Animating open/closed or fully expanded
    const ei = expandedIdx
    const SCALE = 1.9

    // Draw non-expanded pastries faded
    for (let i = 0; i < PASTRIES.length; i++) {
      if (i === ei) continue
      const lo = layouts[i]
      const alpha = 1 - ep * 0.85
      if (alpha <= 0) continue
      for (const cell of mosaicGrids[i]) {
        drawCell(ctx, lo.cx + cell.dx, lo.cy + cell.dy, cell, dpr, alpha)
      }
      drawPastryLabel(ctx, lo, PASTRIES[i], alpha, dpr)
    }

    if (ei < 0) return

    // Draw expanded pastry — left column on desktop, top-center on mobile
    const lo = layouts[ei]
    const mobile = lw < 550
    const ecx = mobile ? lw / 2 : lw * 0.27
    const ecy = mobile ? lh * 0.26 : lh * 0.42
    const eCells = mosaicGrids[ei]

    // Lerp position and scale
    const scale = 1 + (SCALE - 1) * ep
    const cx = lo.cx + (ecx - lo.cx) * ep
    const cy = lo.cy + (ecy - lo.cy) * ep

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    for (const cell of eCells) {
      const x = cx + cell.dx * scale
      const y = cy + cell.dy * scale
      const cos = Math.cos(cell.rotation)
      const sin = Math.sin(cell.rotation)
      ctx.setTransform(dpr*scale*cos, dpr*scale*sin, -dpr*scale*sin, dpr*scale*cos, dpr*x, dpr*y)
      ctx.font = `${cell.fontSize}px Georgia, serif`
      ctx.fillStyle = `hsl(${cell.h},${cell.s}%,${cell.l}%)`
      ctx.globalAlpha = 1
      ctx.fillText(cell.text, 0, 0)
    }

    // Pastry name label above
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = ep
    ctx.font = 'italic 13px Georgia, serif'
    ctx.fillStyle = 'rgba(220,210,185,0.88)'
    ctx.textAlign = 'center'
    const { hh } = PASTRIES[ei].shape.bbox(lo.size)
    ctx.fillText(PASTRIES[ei].name, ecx, cy - hh * scale - 14)
    ctx.textAlign = 'left'

    // Recipe text below
    if (ep > 0.5 && recipeGrids[ei]) {
      const { cells: rCells } = recipeGrids[ei]
      const recipeAlpha = (ep - 0.5) * 2
      for (const cell of rCells) {
        const cos = Math.cos(cell.rotation)
        const sin = Math.sin(cell.rotation)
        ctx.setTransform(dpr*cos, dpr*sin, -dpr*sin, dpr*cos, dpr*cell.x, dpr*cell.y)
        ctx.font = `${cell.fontWeight} ${cell.fontSize}px Georgia, serif`
        ctx.fillStyle = `hsl(${cell.h},${cell.s}%,${cell.l}%)`
        ctx.globalAlpha = recipeAlpha
        ctx.fillText(cell.text, 0, 0)
      }
    }

    // Hint to close
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = ep * 0.45
    ctx.font = '10px Georgia, serif'
    ctx.fillStyle = 'rgba(190,180,160,0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('click to close', mobile ? lw / 2 : lw * 0.27, mobile ? lh * 0.95 : lh * 0.78)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalAlpha = 1
}

// ── Main loop ─────────────────────────────────────────────────────────────────
export default {
  start(canvas) {
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const lw = canvas.width / dpr
    const lh = canvas.height / dpr
    ctx.scale(dpr, dpr)

    // Shared hit-test context (identity transform, logical coords)
    hitCtx = document.createElement('canvas').getContext('2d')
    hitCtx.canvas.width = Math.ceil(lw) + 4
    hitCtx.canvas.height = Math.ceil(lh) + 4

    // Reset state
    expandedIdx = -1
    expanding = false
    expandProgress = 0
    hoveredIdx = -1
    rafScheduled = false
    raf = null

    // Compute layouts and build grids
    layouts = computeLayouts(lw, lh)
    mosaicGrids = PASTRIES.map((_, i) => buildPastryGrid(i, layouts[i]))

    // Build recipe grids (needs ctx for measureText)
    // Recipe text area: centered, lw * 0.72 wide, starts at lh * 0.56
    const mobile = lw < 550
    const recipeMaxW = mobile ? lw * 0.88 : lw * 0.44
    const recipeX = mobile ? lw * 0.06 : lw * 0.52
    const recipeY = mobile ? lh * 0.48 : lh * 0.10
    recipeGrids = PASTRIES.map((_, i) => buildRecipeGrid(i, recipeX, recipeY, recipeMaxW, ctx))

    scheduleFrame = function() {
      if (!rafScheduled) {
        rafScheduled = true
        raf = requestAnimationFrame(tick)
      }
    }

    function tick() {
      rafScheduled = false
      let stillAnimating = false

      // Lerp expand progress
      const target = expanding ? 1 : 0
      const diff = target - expandProgress
      if (Math.abs(diff) > 0.002) {
        expandProgress += diff * 0.12
        stillAnimating = true
      } else {
        expandProgress = target
        if (!expanding) expandedIdx = -1  // fully collapsed — clear index
      }

      render(ctx, lw, lh, dpr)

      if (stillAnimating) scheduleFrame()
    }

    // Initial render
    scheduleFrame()

    // ── Event listeners ───────────────────────────────────────────────────────
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (lw / rect.width)
      const my = (e.clientY - rect.top) * (lh / rect.height)
      const hit = expandedIdx >= 0 ? -1 : hitTest(mx, my)
      if (hit !== hoveredIdx) {
        hoveredIdx = hit
        canvas.style.cursor = hit >= 0 ? 'pointer' : 'default'
      }
    }

    const onLeave = () => {
      hoveredIdx = -1
      canvas.style.cursor = 'default'
    }

    const onClick = e => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (lw / rect.width)
      const my = (e.clientY - rect.top) * (lh / rect.height)

      if (expanding && expandedIdx >= 0) {
        // Collapse
        expanding = false
        scheduleFrame()
        return
      }

      const hit = hitTest(mx, my)
      if (hit >= 0) {
        expandedIdx = hit
        expanding = true
        expandProgress = 0
        scheduleFrame()
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)

    cleanup = () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
      canvas.style.cursor = 'default'
    }
  },

  stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null }
    if (cleanup) { cleanup(); cleanup = null }
    scheduleFrame = null
    rafScheduled = false
    hitCtx = null
  },
}
