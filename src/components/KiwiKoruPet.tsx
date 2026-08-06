import { useEffect, useRef, useState } from 'react'
import './KiwiKoruPet.css'

const IDLE_DURATIONS = [280, 110, 110, 140, 140, 320]
const TANTRUM = [
  { row: 5, column: 0, duration: 120 },
  { row: 5, column: 1, duration: 120 },
  { row: 5, column: 2, duration: 150 },
  { row: 0, column: 0, duration: 180 },
]

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

function makeCuteGrumble(context: AudioContext, variant: number) {
  const now = context.currentTime
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.11, now + 0.018)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.36)
  master.connect(context.destination)

  const notes = variant === 0 ? [185, 145] : variant === 1 ? [220, 310] : [275, 190, 235]
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const voice = context.createGain()
    const start = now + index * 0.085
    oscillator.type = variant === 1 ? 'triangle' : 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, start)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * (variant === 1 ? 1.16 : 0.82), start + 0.11)
    voice.gain.setValueAtTime(0.0001, start)
    voice.gain.exponentialRampToValueAtTime(0.42, start + 0.012)
    voice.gain.exponentialRampToValueAtTime(0.0001, start + 0.13)
    oscillator.connect(voice).connect(master)
    oscillator.start(start)
    oscillator.stop(start + 0.14)
  })

  const wobble = context.createOscillator()
  const wobbleGain = context.createGain()
  wobble.type = 'sine'
  wobble.frequency.setValueAtTime(variant === 2 ? 520 : 390, now)
  wobble.frequency.exponentialRampToValueAtTime(variant === 2 ? 330 : 470, now + 0.2)
  wobbleGain.gain.setValueAtTime(0.0001, now)
  wobbleGain.gain.exponentialRampToValueAtTime(0.12, now + 0.03)
  wobbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
  wobble.connect(wobbleGain).connect(master)
  wobble.start(now)
  wobble.stop(now + 0.25)
}

export default function KiwiKoruPet() {
  const petRef = useRef<HTMLDivElement>(null)
  const [idleFrame, setIdleFrame] = useState(0)
  const [lookDirection, setLookDirection] = useState<number | null>(null)
  const [tantrumFrame, setTantrumFrame] = useState<number | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const tantrumTimer = useRef<number | null>(null)
  const introTimer = useRef<number | null>(null)
  const isHovered = useRef(false)
  const reactionRun = useRef(0)
  const audioContext = useRef<AudioContext | null>(null)
  const soundIndex = useRef(0)

  useEffect(() => {
    let timeout = 0
    const advance = () => {
      setIdleFrame(frame => {
        const next = (frame + 1) % IDLE_DURATIONS.length
        timeout = window.setTimeout(advance, IDLE_DURATIONS[next])
        return next
      })
    }
    timeout = window.setTimeout(advance, IDLE_DURATIONS[0])
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => () => {
    if (tantrumTimer.current !== null) window.clearTimeout(tantrumTimer.current)
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    void audioContext.current?.close()
  }, [])

  const playNextSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext
      if (!AudioContextClass) return
      if (!audioContext.current) audioContext.current = new AudioContextClass()
      const context = audioContext.current
      const play = () => {
        makeCuteGrumble(context, soundIndex.current)
        soundIndex.current = (soundIndex.current + 1) % 3
      }
      if (context.state === 'suspended') void context.resume().then(play).catch(() => undefined)
      else play()
    } catch {
      // Sound is a playful enhancement; the mascot must still work when audio is blocked.
    }
  }

  const stopInteraction = (event: React.PointerEvent) => {
    if (event.pointerType === 'touch' || window.matchMedia('(max-width: 767px)').matches) return
    reactionRun.current += 1
    isHovered.current = false
    if (tantrumTimer.current !== null) window.clearTimeout(tantrumTimer.current)
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    tantrumTimer.current = null
    introTimer.current = null
    setTantrumFrame(null)
    setShowIntro(false)
  }

  const playReaction = () => {
    reactionRun.current += 1
    const run = reactionRun.current
    isHovered.current = true
    if (tantrumTimer.current !== null) window.clearTimeout(tantrumTimer.current)
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    tantrumTimer.current = null
    introTimer.current = null
    setShowIntro(false)
    setTantrumFrame(0)
    playNextSound()
    let frame = 0
    const advance = () => {
      if (run !== reactionRun.current || !isHovered.current) return
      if (frame >= TANTRUM.length - 1) {
        setTantrumFrame(null)
        tantrumTimer.current = null
        if (!isHovered.current) return
        setShowIntro(true)
        introTimer.current = window.setTimeout(() => {
          if (run !== reactionRun.current) return
          setShowIntro(false)
          introTimer.current = null
        }, 3200)
        return
      }
      frame += 1
      setTantrumFrame(frame)
      tantrumTimer.current = window.setTimeout(advance, TANTRUM[frame].duration)
    }
    tantrumTimer.current = window.setTimeout(advance, TANTRUM[0].duration)
  }

  const startTantrum = (event: React.PointerEvent) => {
    if (event.pointerType === 'touch' || window.matchMedia('(max-width: 767px)').matches) return
    playReaction()
  }

  const startTouchTantrum = (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch' && !window.matchMedia('(max-width: 767px)').matches) return
    playReaction()
  }

  useEffect(() => {
    let animationFrame = 0
    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        const rect = petRef.current?.getBoundingClientRect()
        if (!rect) return
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height * 0.42)
        if (Math.hypot(dx, dy) < 72) {
          setLookDirection(null)
          return
        }
        const clockwiseFromUp = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360
        setLookDirection(Math.round(clockwiseFromUp / 22.5) % 16)
      })
    }
    window.addEventListener('pointermove', followPointer, { passive: true })
    return () => {
      window.removeEventListener('pointermove', followPointer)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  const tantrumPose = tantrumFrame !== null ? TANTRUM[tantrumFrame] : null
  const row = tantrumPose ? tantrumPose.row : showIntro ? 0 : lookDirection === null ? 0 : lookDirection < 8 ? 9 : 10
  const column = tantrumPose ? tantrumPose.column : showIntro ? 0 : lookDirection === null ? idleFrame : lookDirection % 8

  return (
    <aside className={`kiwikoru-pet-float ${tantrumPose ? 'is-tantrum' : ''}`} aria-label="Kiwi Grumpy, the KiwiKoru mascot" onPointerEnter={startTantrum} onPointerLeave={stopInteraction}>
      {showIntro && <div className="kiwikoru-pet-bubble"><strong>I’m Kiwi Grumpy.</strong><span>Soon I’ll be your virtual assistant.</span><a href="https://wa.me/64274365339?text=Hi%20KiwiKoru!%20I%20have%20a%20project%20in%20mind.%20How%20can%20we%20get%20started%3F" target="_blank" rel="noopener noreferrer" aria-label="Message KiwiKoru 3D on WhatsApp">Message us on WhatsApp</a></div>}
      <div
        ref={petRef}
        className="kiwikoru-pet-sprite"
        role="img"
        aria-label="Kiwi Grumpy watching the pointer"
        title="Kiwi Grumpy · Your KiwiKoru helper is waking up"
        onPointerDown={startTouchTantrum}
        style={{
          backgroundPosition: `${(column / 7) * 100}% ${(row / 10) * 100}%`,
        }}
      />
    </aside>
  )
}
