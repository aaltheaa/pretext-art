import wordPool from './word-pool.js'
import dragon from './dragon.js'
import museum from './museum.js'
import bakery from './bakery.js'

const canvas = document.getElementById('canvas')
const tabs = document.querySelectorAll('.tab')
const experiments = { 'word-pool': wordPool, 'dragon': dragon, 'museum': museum, 'bakery': bakery }
let currentName = 'word-pool'
let current = null

function resize() {
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
}

function launch(name) {
  if (current) current.stop()
  currentName = name
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name))
  resize()
  current = experiments[name]
  current.start(canvas)
}

tabs.forEach(t => t.addEventListener('click', () => launch(t.dataset.tab)))

let resizeTimer
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => launch(currentName), 200)
})

launch('museum')
