import { useEffect, useRef, useState } from 'react'
import './KiwiKoruPet.css'

const IDLE_DURATIONS = [280, 110, 110, 140, 140, 320]

export default function KiwiKoruPet() {
  const petRef = useRef<HTMLDivElement>(null)
  const [idleFrame, setIdleFrame] = useState(0)
  const [lookDirection, setLookDirection] = useState<number | null>(null)
  const [tantrumFrame, setTantrumFrame] = useState<number | null>(null)
  const tantrumTimer = useRef<number | null>(null)

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
  }, [])

  const startTantrum = () => {
    if (tantrumTimer.current !== null) return
    setTantrumFrame(0)
    let frame = 0
    const advance = () => {
      frame += 1
      if (frame >= 8) {
        setTantrumFrame(null)
        tantrumTimer.current = null
        return
      }
      setTantrumFrame(frame)
      tantrumTimer.current = window.setTimeout(advance, frame === 7 ? 240 : 140)
    }
    tantrumTimer.current = window.setTimeout(advance, 140)
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

  const row = tantrumFrame !== null ? 5 : lookDirection === null ? 0 : lookDirection < 8 ? 9 : 10
  const column = tantrumFrame !== null ? tantrumFrame : lookDirection === null ? idleFrame : lookDirection % 8

  return (
    <aside className="kiwikoru-pet-float" aria-label="Kiwi Grumpy, the KiwiKoru mascot">
      <div
        ref={petRef}
        className="kiwikoru-pet-sprite"
        role="img"
        aria-label="Kiwi Grumpy watching the pointer"
        title="Kiwi Grumpy · Your KiwiKoru helper is waking up"
        onPointerEnter={startTantrum}
        style={{
          backgroundPosition: `${(column / 7) * 100}% ${(row / 10) * 100}%`,
        }}
      />
    </aside>
  )
}
