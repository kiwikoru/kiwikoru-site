import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Check, ScanLine, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const SESSION_KEY = 'kiwikoru-repair-news-dismissed'

const steps = [
  {
    image: '/images/repair-process-capture.png',
    icon: ScanLine,
    number: '01',
    title: 'Capture & measure',
    copy: 'We assess the surviving shape using 3D capture or scanning where suitable, plus precision measurements.',
  },
  {
    image: '/images/repair-process-rebuild.png',
    icon: Camera,
    number: '02',
    title: 'Rebuild or mirror',
    copy: 'We can mirror the intact side or reconstruct missing geometry in CAD from the broken original.',
  },
  {
    image: '/images/repair-process-print.png',
    icon: Check,
    number: '03',
    title: 'Print & test',
    copy: 'We manufacture a practical replacement and check its fit before collection or dispatch.',
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
        className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-white/15 bg-[#f7f5ef] shadow-[0_30px_100px_rgba(0,0,0,.5)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-[#17231c]/90 text-white shadow-lg ring-1 ring-white/20 transition hover:scale-105 hover:bg-[#253126] focus:outline-none focus:ring-2 focus:ring-gold sm:right-5 sm:top-5"
          aria-label="Close Kiwi News"
        >
          <X size={21} />
        </button>

        <div className="overflow-hidden rounded-t-[1.75rem] bg-[#253126] px-5 pb-7 pt-6 text-white sm:px-8 sm:pb-9 sm:pt-8">
          <div className="flex items-center gap-3 pr-12">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#17231c] p-2 ring-1 ring-white/10">
              <img src="/images/kiwikoru-logo-moss.png" alt="" className="h-full w-full object-contain" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] text-gold-light ring-1 ring-gold/30"><Sparkles size={12}/> Kiwi News · Repair service</span>
              <p className="mt-1 text-xs text-white/55">A practical second life for hard-to-find parts</p>
            </div>
          </div>
          <div className="mt-6 max-w-3xl">
            <h2 id="kiwi-news-repair-title" className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Does your part no longer exist?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">A broken clip, cover, knob or bracket does not always mean replacing the whole product. KiwiKoru can assess the original part, rebuild what is missing and manufacture a functional replacement.</p>
          </div>
        </div>

        <div className="p-4 sm:p-7 lg:p-8">
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(step => (
              <article key={step.number} className="group overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm">
                <div className="relative h-32 overflow-hidden sm:h-40">
                  <img src={step.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17231c]/75 via-transparent to-transparent" />
                  <span className="absolute right-2 top-2 rounded-full bg-[#17231c]/80 px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] text-white/85 ring-1 ring-white/20">Illustrative 3D process</span>
                  <span className="absolute bottom-3 left-3 text-xs font-black tracking-[.18em] text-gold-light">STEP {step.number}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-forest-dark"><step.icon size={18} className="text-gold-dark"/><h3 className="font-bold">{step.title}</h3></div>
                  <p className="mt-2 text-xs leading-relaxed text-forest/65 sm:text-sm">{step.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#e9eadf] p-5 sm:flex-row sm:p-6">
            <div className="max-w-xl text-center sm:text-left">
              <strong className="text-lg text-forest-dark">Send us clear photos of the broken part.</strong>
              <p className="mt-1 text-sm leading-relaxed text-forest/65">Include the product, where the part fits and a ruler or measurements if possible. We will tell you whether reconstruction is practical before quoting.</p>
            </div>
            <Link to="/contact" onClick={dismiss} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-black text-forest-dark shadow-[0_8px_24px_rgba(161,120,68,.25)] transition hover:-translate-y-0.5 hover:bg-gold-light sm:w-auto">Show us the broken part <ArrowRight size={18}/></Link>
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-forest/45">Illustrative repair process. Suitability depends on the part, material, heat, load and safety requirements; every repair is assessed individually.</p>
        </div>
      </section>
    </div>
  )
}
