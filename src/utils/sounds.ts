// Pure Web Audio API sound synthesis — no external files, no base64 blobs.
// All sounds are procedurally generated.

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext()
  }
  return ctx
}

function resume(): Promise<void> {
  const c = getCtx()
  return c.state === 'suspended' ? c.resume() : Promise.resolve()
}

// ─── Coin Drop ────────────────────────────────────────────────────────────────
export async function playDrop(): Promise<void> {
  await resume()
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.12)
  gain.gain.setValueAtTime(0.3, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.15)
}

// ─── Win Fanfare ──────────────────────────────────────────────────────────────
export async function playWin(): Promise<void> {
  await resume()
  const c = getCtx()
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'triangle'
    const t = c.currentTime + i * 0.12
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.start(t)
    osc.stop(t + 0.22)
  })
}

// ─── Draw / Loss ──────────────────────────────────────────────────────────────
export async function playDraw(): Promise<void> {
  await resume()
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.3)
  gain.gain.setValueAtTime(0.2, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.35)
}

// ─── Timer Tick ───────────────────────────────────────────────────────────────
export async function playTick(): Promise<void> {
  await resume()
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = 'square'
  osc.frequency.setValueAtTime(880, c.currentTime)
  gain.gain.setValueAtTime(0.05, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.05)
}

// ─── Power Token Used ─────────────────────────────────────────────────────────
export async function playPower(): Promise<void> {
  await resume()
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.1)
  osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.25)
  gain.gain.setValueAtTime(0.3, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.3)
}
