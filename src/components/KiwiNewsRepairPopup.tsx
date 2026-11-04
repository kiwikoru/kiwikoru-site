import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ScanLine, Sparkles, Wrench, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const SESSION_KEY = 'kiwikoru-repair-news-dismissed-v2'

const steps = [
  {
    image: '/images/repair-process-capture.png',
    icon: Wrench,
    number: '01',
    title: 'Assess the damage',
    copy: 'We inspect the surviving part, the break and the mounting features to define what needs rebuilding.',
  },
  {
    image: '/images/repair-process-rebuild.png',
    icon: ScanLine,
    number: '02',
    title: 'Capture the geometry',
    copy: '3D capture or scanning where suitable, supported by precision measurements, creates the digital reference.',
  },
  {
    image: '/images/repair-process-print.png',
    icon: Check,
    number: '03',
    title: 'Print & fit-check',
    copy: 'We manufacture the replacement in an appropriate material and check the critical fit before handover.',
  },
]

export default function KiwiNewsRepairPopup() {
  const [open, setOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch { /* The popup can still work if storage is unavailable. */ }
    const timer = window.setTimeout(() => setOpen(true), 650)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss() }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Closing must never depend on storage. */ }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101a14]/80 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) dismiss() }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="kiwi-news-repair-title"
        className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] border border-white/15 bg-[#f7f5ef] shadow-[0_30px_100px_rgba(0,0,0,.5)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-[#17231c]/90 text-white shadow-lg ring-1 ring-white/20 transition hover:scale-105 hover:bg-[#314336] focus:outline-none focus:ring-2 focus:ring-gold sm:right-5 sm:top-5"
          aria-label="Close Kiwi News"
        >
          <X size={20} />
        </button>

        <header className="overflow-hidden rounded-t-[1.75rem] bg-[#203027] px-5 pb-6 pt-5 text-white sm:px-7 sm:pb-7 sm:pt-6">
          <div className="flex items-center gap-3 pr-12">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#17231c] p-2 ring-1 ring-white/10">
              <img src="/images/kiwikoru-logo-moss.png" alt="" className="h-full w-full object-contain" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[9px] font-black uppercase tracking-[.2em] text-gold-light ring-1 ring-gold/30"><Sparkles size={11}/> Kiwi News · Reverse engineering</span>
              <p className="mt-1 text-xs text-white/55">Practical replacements for hard-to-find parts</p>
            </div>
          </div>
          <div className="mt-5 max-w-3xl">
            <h2 id="kiwi-news-repair-title" className="text-2xl font-semibold leading-tight sm:text-4xl">When the part is gone, we rebuild the geometry.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">From the damaged original to a practical replacement, KiwiKoru combines careful assessment, digital reconstruction and local 3D printing.</p>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(step => (
              <article key={step.number} className="group flex overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm md:block">
                <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden sm:w-36 md:w-full">
                  <img src={step.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17231c]/75 via-transparent to-transparent" />
                  <span className="absolute left-2 top-2 rounded-full bg-[#17231c]/80 px-2 py-1 text-[7px] font-black uppercase tracking-[.12em] text-white/85 ring-1 ring-white/20">Illustrative process</span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-black tracking-[.18em] text-gold-light">STEP {step.number}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5 md:p-4">
                  <div className="flex items-center gap-2 text-forest-dark"><step.icon size={17} className="shrink-0 text-gold-dark"/><h3 className="font-bold leading-tight">{step.title}</h3></div>
                  <p className="mt-2 text-xs leading-relaxed text-forest/65">{step.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-forest/10 bg-[#e9eadf] p-4 sm:flex-row sm:p-5">
            <div className="max-w-xl text-center sm:text-left">
              <strong className="text-base text-forest-dark sm:text-lg">Have a broken cover, clip or bracket?</strong>
              <p className="mt-1 text-sm leading-relaxed text-forest/65">Send clear photos, show where it fits and include a ruler or measurements. We will assess whether reconstruction is practical before quoting.</p>
            </div>
            <Link to="/contact" onClick={dismiss} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-black text-forest-dark shadow-[0_8px_24px_rgba(161,120,68,.22)] transition hover:-translate-y-0.5 hover:bg-gold-light sm:w-auto">Show us your part <ArrowRight size={17}/></Link>
          </div>
          <p className="mt-3 text-center text-[10px] leading-relaxed text-forest/45">Illustrative process. Suitability depends on the part, material, heat, load and safety requirements; every project is assessed individually.</p>
        </div>
      </section>
    </div>
  )
}
