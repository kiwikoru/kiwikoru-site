import { useEffect, useRef, useState } from 'react'
import './KiwiKoruPet.css'

const IDLE_DURATIONS = [280, 110, 110, 140, 140, 320]
const TANTRUM = [
  { row: 5, column: 0, duration: 120 },
  { row: 5, column: 1, duration: 120 },
  { row: 5, column: 2, duration: 150 },
  { row: 0, column: 0, duration: 180 },
]

export default function KiwiKoruPet() {
  const petRef = useRef<HTMLDivElement>(null)
  const [idleFrame, setIdleFrame] = useState(0)
  const [lookDirection, setLookDirection] = useState<number | null>(null)
  const [tantrumFrame, setTantrumFrame] = useState<number | null>(null)
  const [showIntro, setShowIntro] = useState(false)
  const tantrumTimer = useRef<number | null>(null)
  const introTimer = useRef<number | null>(null)
  const isHovered = useRef(false)

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
  }, [])

  const stopInteraction = () => {
    isHovered.current = false
    if (tantrumTimer.current !== null) window.clearTimeout(tantrumTimer.current)
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    tantrumTimer.current = null
    introTimer.current = null
    setTantrumFrame(null)
    setShowIntro(false)
  }

  const startTantrum = (event: React.PointerEvent) => {
    if (event.pointerType === 'touch' || window.matchMedia('(max-width: 767px)').matches) return
    isHovered.current = true
    if (tantrumTimer.current !== null) return
    if (introTimer.current !== null) window.clearTimeout(introTimer.current)
    setShowIntro(false)
    setTantrumFrame(0)
    let frame = 0
    const advance = () => {
      if (frame >= TANTRUM.length - 1) {
        setTantrumFrame(null)
        tantrumTimer.current = null
        if (!isHovered.current) return
        setShowIntro(true)
        introTimer.current = window.setTimeout(() => {
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
    <aside className={`kiwikoru-pet-float ${tantrumPose ? 'is-tantrum' : ''}`} aria-label="Kiwi Grumpy, the KiwiKoru mascot">
      {showIntro && <div className="kiwikoru-pet-bubble"><strong>I’m Kiwi Grumpy.</strong><span>Soon I’ll be your virtual assistant.</span></div>}
      <div
        ref={petRef}
        className="kiwikoru-pet-sprite"
        role="img"
        aria-label="Kiwi Grumpy watching the pointer"
        title="Kiwi Grumpy · Your KiwiKoru helper is waking up"
        onPointerEnter={startTantrum}
        onPointerLeave={stopInteraction}
        style={{
          backgroundPosition: `${(column / 7) * 100}% ${(row / 10) * 100}%`,
        }}
      />
    </aside>
  )
}
