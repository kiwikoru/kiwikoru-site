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

function makePocketPetChirp(context: AudioContext, variant: number) {
  const now = context.currentTime
  const melodies = [
    [{ note: 587, length: .075 }, { note: 784, length: .08 }, { note: 698, length: .11 }],
    [{ note: 494, length: .07 }, { note: 622, length: .07 }, { note: 831, length: .085 }, { note: 622, length: .11 }],
    [{ note: 880, length: .065 }, { note: 740, length: .075 }, { note: 988, length: .08 }, { note: 831, length: .12 }],
  ]
  const melody = melodies[variant % melodies.length]
  const master = context.createGain()
  const filter = context.createBiquadFilter()
  master.gain.value = .075
  filter.type = 'lowpass'
  filter.frequency.value = 2200
  filter.Q.value = .7
  master.connect(filter).connect(context.destination)

  let offset = 0
  melody.forEach(({ note, length }, index) => {
    const voice = context.createOscillator()
    const envelope = context.createGain()
    voice.type = index % 2 === 0 ? 'square' : 'triangle'
    voice.frequency.setValueAtTime(note, now + offset)
    voice.frequency.exponentialRampToValueAtTime(note * (variant === 1 ? 1.035 : .975), now + offset + length)
    envelope.gain.setValueAtTime(.0001, now + offset)
    envelope.gain.exponentialRampToValueAtTime(index === 0 ? .9 : .66, now + offset + .009)
    envelope.gain.exponentialRampToValueAtTime(.0001, now + offset + length)
    voice.connect(envelope).connect(master)
    voice.start(now + offset)
    voice.stop(now + offset + length + .012)
    offset += length + .018
  })
}

export default function KiwiKoruPet() {
  const petRef = useRef<HTMLDivElement>(null)
  const [idleFrame, setIdleFrame] = useState(0)
  const [lookDirection, setLookDirection] = useState<number | null>(null)
  const [tantrumFrame, setTantrumFrame] = useState<number | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const [showArmsJoke, setShowArmsJoke] = useState(false)
  const tantrumTimer = useRef<number | null>(null)
  const introTimer = useRef<number | null>(null)
  const isHovered = useRef(false)
  const reactionRun = useRef(0)
  const audioContext = useRef<AudioContext | null>(null)
  const soundIndex = useRef(0)
  const soundInteractions = useRef(0)

  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext
        if (!AudioContextClass) return
        if (!audioContext.current) audioContext.current = new AudioContextClass()
        if (audioContext.current.state === 'suspended') void audioContext.current.resume().catch(() => undefined)
      } catch { /* Audio remains an optional enhancement. */ }
    }
    window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

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
        makePocketPetChirp(context, soundIndex.current)
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

  const playReaction = (withSound = false) => {
    reactionRun.current += 1
    const run = reactionRun.current
    isHovered.current = true
    if (tantrumTimer.current !== null) window.clearTimeout(tantrumTimer.current)
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    tantrumTimer.current = null
    introTimer.current = null
    setShowIntro(false)
    if (withSound) {
      soundInteractions.current += 1
      setShowArmsJoke(soundInteractions.current === 3)
    } else {
      setShowArmsJoke(false)
    }
    setTantrumFrame(0)
    if (withSound) playNextSound()
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
    playReaction(false)
  }

  const startTouchTantrum = (event: React.PointerEvent) => {
    event.stopPropagation()
    playReaction(true)
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
      {showIntro && <div className="kiwikoru-pet-bubble" role="status"><strong>{showArmsJoke ? 'They’re not wings. They’re arms.' : 'I’m Kiwi Grumpy.'}</strong><span>{showArmsJoke ? 'Kiwis can’t fly — but I evolved. I’m a maker kiwi.' : 'Soon I’ll be your virtual assistant.'}</span><a href="https://wa.me/64274365339?text=Hi%20KiwiKoru!%20I%20have%20a%20project%20in%20mind.%20How%20can%20we%20get%20started%3F" target="_blank" rel="noopener noreferrer" aria-label="Message KiwiKoru 3D on WhatsApp">Message us on WhatsApp</a></div>}
      <div
        ref={petRef}
        className="kiwikoru-pet-sprite"
        role="button"
        tabIndex={0}
        aria-label="Play a little Kiwi Grumpy sound"
        title="Kiwi Grumpy · Click for a tiny surprise"
        onPointerDown={startTouchTantrum}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); playReaction(true) } }}
        style={{
          backgroundPosition: `${(column / 7) * 100}% ${(row / 10) * 100}%`,
        }}
      />
    </aside>
  )
}
