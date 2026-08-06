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
  const profiles = [
    { pitch: 155, end: 112, duration: 0.34, formant: 720, wobble: 17 },
    { pitch: 205, end: 255, duration: 0.29, formant: 930, wobble: 22 },
    { pitch: 178, end: 132, duration: 0.42, formant: 610, wobble: 14 },
  ]
  const profile = profiles[variant % profiles.length]
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.025)
  master.gain.setValueAtTime(0.22, now + profile.duration * 0.52)
  master.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration)
  master.connect(context.destination)

  // A rounded, pitch-bending little voice. Sine waves avoid the electronic
  // buzz of the old sawtooth sound, while a quiet breath layer adds warmth.
  const voice = context.createOscillator()
  const harmonic = context.createOscillator()
  const vibrato = context.createOscillator()
  const vibratoDepth = context.createGain()
  const formant = context.createBiquadFilter()
  const voiceGain = context.createGain()
  voice.type = 'sine'
  harmonic.type = 'sine'
  voice.frequency.setValueAtTime(profile.pitch, now)
  voice.frequency.exponentialRampToValueAtTime(profile.end, now + profile.duration)
  harmonic.frequency.setValueAtTime(profile.pitch * 2.02, now)
  harmonic.frequency.exponentialRampToValueAtTime(profile.end * 2, now + profile.duration)
  vibrato.frequency.value = profile.wobble
  vibratoDepth.gain.value = variant === 1 ? 8 : 5
  vibrato.connect(vibratoDepth)
  vibratoDepth.connect(voice.frequency)
  vibratoDepth.connect(harmonic.frequency)
  formant.type = 'bandpass'
  formant.frequency.value = profile.formant
  formant.Q.value = 0.75
  voiceGain.gain.value = 0.85
  voice.connect(voiceGain)
  harmonic.connect(voiceGain)
  voiceGain.connect(formant).connect(master)

  const noiseLength = Math.ceil(context.sampleRate * profile.duration)
  const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let i = 0; i < noiseLength; i += 1) noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength)
  const breath = context.createBufferSource()
  const breathFilter = context.createBiquadFilter()
  const breathGain = context.createGain()
  breath.buffer = noiseBuffer
  breathFilter.type = 'lowpass'
  breathFilter.frequency.value = 520
  breathGain.gain.value = 0.075
  breath.connect(breathFilter).connect(breathGain).connect(master)

  ;[voice, harmonic, vibrato, breath].forEach(source => source.start(now))
  ;[voice, harmonic, vibrato].forEach(source => source.stop(now + profile.duration))
  breath.stop(now + profile.duration)
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
