import { Link } from 'react-router-dom'
import {
  ArrowDown, ArrowLeft, ArrowRight, BookOpen, Brain, Check, CircleGauge,
  Factory, GraduationCap, Network, Search, Settings2, Sparkles, Users,
} from 'lucide-react'
import './WorkingSmarterConsulting.css'

const pillars = [
  { label: 'Process', title: 'Make work simpler and more consistent.', icon: Network, items: ['Map the real work', 'Clarify roles', 'Create practical standards'] },
  { label: 'Knowledge', title: 'Turn experience into organisational knowledge.', icon: BookOpen, items: ['Capture critical know-how', 'Build useful documentation', 'Make knowledge accessible'] },
  { label: 'Capability', title: 'Build teams that perform with confidence.', icon: GraduationCap, items: ['Strengthen onboarding', 'Transfer knowledge', 'Build internal capability'] },
]

const outcomes = ['Less dependence on key people', 'Faster onboarding', 'Fewer errors and less rework', 'More consistent delivery', 'Knowledge retained in the business', 'Systems ready to support growth']

const services = [
  { number: '01', title: 'Operational Health Check', description: 'See how work happens, where risk sits and what to improve first.', icon: Search },
  { number: '02', title: 'Process Improvement', description: 'Create clearer workflows that reduce friction, errors and wasted effort.', icon: Network },
  { number: '03', title: 'Knowledge Management', description: 'Capture critical know-how before it becomes a business risk.', icon: Brain },
  { number: '04', title: 'Capability Development', description: 'Give teams the tools, training and confidence to sustain improvements.', icon: GraduationCap },
  { number: '05', title: 'Operations Advisory', description: 'Ongoing, practical improvement support without a full-time specialist.', icon: Users },
]

const steps = [
  { number: '01', title: 'Understand', copy: 'Talk to the people doing the work and understand what actually happens.' },
  { number: '02', title: 'Map', copy: 'Make processes, dependencies, risks and knowledge visible.' },
  { number: '03', title: 'Improve', copy: 'Remove unnecessary friction and design practical improvements.' },
  { number: '04', title: 'Embed', copy: 'Document, train and transfer the improved way of working so the organisation can sustain it.' },
]

const engagements = [
  ['Operational Health Check', 'NZD $2,000 – $5,000'],
  ['Process Improvement Projects', 'NZD $5,000 – $20,000'],
  ['Knowledge Management Projects', 'NZD $3,000 – $15,000'],
  ['Business Operations Advisory', 'NZD $1,000 – $3,000 / month'],
]

export default function WorkingSmarterConsulting() {
  return (
    <div className="working-smarter-page">
      <Link to="/" className="wsc-back" aria-label="Back to KiwiKoru"><ArrowLeft size={19} /></Link>
      <img src="/images/working-smarter-logo.png" alt="Working Smarter Consulting — Strategy that moves you forward" className="wsc-brand" />
      <section className="h-screen w-full overflow-hidden relative flex items-end" aria-labelledby="wsc-hero-title">
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline aria-hidden="true">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260703_053131_1ec3dd1c-d627-44fb-ab20-6e1fce41b0d5.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 wsc-hero-shade" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-14 pt-28 sm:px-10 md:pb-20 lg:px-14">
          <p className="wsc-eyebrow text-white/80">Working Smarter Consulting</p>
          <h1 id="wsc-hero-title" className="mt-5 max-w-5xl text-3xl font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Less chaos.<br /><span className="text-white/60">Smarter systems.</span><br />Better business.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">We help growing New Zealand businesses simplify processes, capture critical knowledge and build the internal capability they need to grow without creating more complexity.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="wsc-button bg-white text-[#17211c] hover:bg-white/90">Book an Operational Health Check <ArrowRight size={17} /></Link>
            <a href="#the-problem" className="wsc-button liquid-glass text-white">See how we help <ArrowDown size={17} /></a>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[.18em] text-white/55">Business Process, Knowledge & Capability Consulting</p>
        </div>
      </section>

      <section id="the-problem" className="wsc-section bg-[#f2f1ec] text-[#18231d]">
        <div className="wsc-shell grid gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="wsc-kicker">The problem</p>
            <h2 className="wsc-heading">Growing businesses often outgrow the way they work.</h2>
            <p className="wsc-copy mt-6">Growth exposes informal processes. Knowledge sits with a few people, training varies and managers get pulled into daily firefighting.</p>
          </div>
          <div className="space-y-4">
            {['Everything depends on a few people.', "We're growing faster than our systems.", 'We know things need to improve, but nobody has time to fix them.'].map((quote, index) => (
              <blockquote key={quote} className={`wsc-quote ${index === 1 ? 'lg:translate-x-8' : ''}`}>“{quote}”</blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="wsc-section bg-[#122019] text-white">
        <div className="wsc-shell">
          <p className="wsc-kicker text-[#c6d5c8]">Three connected pillars</p>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 className="wsc-heading max-w-3xl">Build the operating system behind the business.</h2>
            <p className="max-w-md text-white/60">Processes create consistency. Knowledge makes experience reusable. Capability lets the team carry it forward.</p>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {pillars.map(({ label, title, icon: Icon, items }, index) => (
              <article key={label} className={`wsc-pillar wsc-pillar-${index + 1}`}>
                <div className="flex items-center justify-between"><span className="wsc-eyebrow">{label}</span><Icon size={23} /></div>
                <h3 className="mt-10 text-2xl font-medium leading-tight">{title}</h3>
                <ul className="mt-8 space-y-3 text-sm text-white/70">{items.map(item => <li key={item} className="flex gap-3"><Check size={15} className="mt-0.5 shrink-0" />{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[.04] px-6 py-9 text-center sm:flex-row sm:justify-center">
            <strong>Processes</strong><span className="text-white/30">+</span><strong>Knowledge</strong><span className="text-white/30">+</span><strong>Capability</strong><ArrowRight className="rotate-90 text-[#d4b896] sm:rotate-0" /><span className="text-white/70">A business that can grow with less chaos.</span>
          </div>
        </div>
      </section>

      <section className="wsc-section bg-white text-[#18231d]">
        <div className="wsc-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start"><p className="wsc-kicker">Business outcomes</p><h2 className="wsc-heading">Build a business that works beyond the people who built it.</h2></div>
          <div className="grid sm:grid-cols-2">
            {outcomes.map((outcome, index) => <div key={outcome} className="wsc-outcome"><span>{String(index + 1).padStart(2, '0')}</span><p>{outcome}</p></div>)}
          </div>
        </div>
      </section>

      <section className="wsc-section bg-[#e9ece5] text-[#18231d]">
        <div className="wsc-shell">
          <p className="wsc-kicker">Services</p><h2 className="wsc-heading max-w-3xl">Practical support, from first diagnosis to lasting capability.</h2>
          <div className="mt-14 border-t border-[#18231d]/15">
            {services.map(({ number, title, description, icon: Icon }) => <article key={number} className="wsc-service"><span className="wsc-service-icon"><Icon size={21} /></span><div><span className="text-xs text-[#7c8980]">{number}</span><h3 className="mt-2 text-2xl font-semibold">{title}</h3><p className="mt-3 max-w-xl text-[#5b695f]">{description}</p></div><ArrowRight className="self-center text-[#88968d]" /></article>)}
          </div>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline decoration-[#9daa9f] underline-offset-8">Start with a Health Check <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="wsc-section bg-[#203129] text-white">
        <div className="wsc-shell"><p className="wsc-kicker text-[#b8c8bc]">How we work</p><h2 className="wsc-heading">Clear, practical and built around the real work.</h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 md:grid-cols-4">{steps.map(step => <article key={step.number} className="bg-[#203129] p-7 lg:p-9"><span className="text-xs text-white/40">{step.number}</span><h3 className="mt-12 text-2xl">{step.title}</h3><p className="mt-4 text-sm leading-relaxed text-white/60">{step.copy}</p></article>)}</div>
          <p className="mt-7 text-center text-sm tracking-[.12em] text-white/50">Understand → Map → Improve → Embed</p>
        </div>
      </section>

      <section className="wsc-section bg-[#f4f2ed] text-[#18231d]">
        <div className="wsc-shell grid gap-14 lg:grid-cols-2">
          <div><p className="wsc-kicker">Ideal clients</p><h2 className="wsc-heading">Built for growing organisations.</h2><div className="mt-8 inline-flex items-baseline gap-3 rounded-full border border-[#18231d]/15 px-6 py-3"><strong className="text-3xl">20–200</strong><span className="text-sm text-[#617066]">employees</span></div></div>
          <div className="space-y-8"><div><h3 className="text-sm font-semibold uppercase tracking-[.14em]">Typical decision makers</h3><p className="mt-3 leading-8 text-[#56645b]">Managing Director · Business Owner · General Manager · Operations Manager · People & Capability Leader</p></div><div><h3 className="text-sm font-semibold uppercase tracking-[.14em]">Common sectors</h3><p className="mt-3 leading-8 text-[#56645b]">Construction · Engineering · Professional services · Light manufacturing · Logistics · Growing not-for-profit organisations</p></div><p className="text-sm text-[#718078]">These are common contexts, not limits. The work is shaped around the organisation.</p></div>
        </div>
      </section>

      <section className="border-y border-[#18231d]/10 bg-white py-20 text-[#18231d]">
        <div className="wsc-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="rounded-full bg-[#e9eee9] p-4"><Sparkles size={24} /></div><div><p className="wsc-kicker">Technology & automation</p><h2 className="mt-2 text-3xl font-medium">Technology where it actually helps.</h2></div></div><p className="max-w-xl leading-relaxed text-[#59675e]">Automation, AI and digital tools can support better processes, but technology is not the starting point. We first understand the work, then use the right tools where they create measurable value.</p></div>
      </section>

      <section className="wsc-section bg-[#17231c] text-white">
        <div className="wsc-shell grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div><p className="wsc-kicker text-[#bfccbf]">Connected capability</p><h2 className="wsc-heading">Sometimes the process problem needs a physical solution.</h2><p className="mt-6 max-w-2xl leading-relaxed text-white/65">Working Smarter Consulting focuses on how organisations operate. Through KiwiKoru 3D, we can also design, prototype and manufacture practical physical solutions when an operational improvement requires one.</p><p className="mt-6 text-sm leading-7 text-white/50">Assembly jigs · Fixtures · Tooling aids · Custom brackets · Replacement components · Workstation aids · Prototypes · Custom production tools</p><Link to="/services" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#e8c9a0]">Explore KiwiKoru 3D <ArrowRight size={16} /></Link></div>
          <div className="wsc-flow"><div><Network /> <span><b>Working Smarter</b><small>Analyse the operation</small></span></div><ArrowDown /><div><Search /><span><b>Identify the friction</b><small>Find what constrains the work</small></span></div><ArrowDown /><div><Settings2 /><span><b>Improve the process</b><small>Make the better way practical</small></span></div><ArrowDown /><div className="border-[#d4b896]/50 bg-[#d4b896]/10"><Factory /><span><b>KiwiKoru 3D</b><small>Design · Prototype · Manufacture</small></span></div></div>
        </div>
      </section>

      <section className="wsc-section bg-[#f2f1ec] text-[#18231d]">
        <div className="wsc-shell"><p className="wsc-kicker">Engagement options</p><h2 className="wsc-heading">Typical engagements</h2><div className="mt-12 divide-y divide-[#18231d]/15 border-y border-[#18231d]/15">{engagements.map(([name, price]) => <div key={name} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between"><span className="text-lg">{name}</span><strong className="text-xl font-medium">{price}</strong></div>)}</div><p className="mt-5 text-sm text-[#68766e]">Every organisation is different. Scope and investment are confirmed after an initial discussion.</p></div>
      </section>

      <section className="wsc-section bg-white text-[#18231d]">
        <div className="wsc-shell grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="wsc-kicker">Why Working Smarter</p><h2 className="wsc-heading">Not another report that sits on a shelf.</h2><p className="mt-6 leading-relaxed text-[#56645b]">Working Smarter combines process improvement, knowledge management and capability development with a practical understanding of how businesses actually operate.</p></div><div className="rounded-[2rem] bg-[#edf0ea] p-8 sm:p-10"><p className="text-2xl leading-snug">We don't just design a better process.</p><p className="mt-3 text-2xl leading-snug text-[#69776e]">We help make it usable, teachable and sustainable.</p><div className="mt-8 flex flex-wrap gap-2">{['Practical', 'People-centred', 'Clear documentation', 'Real implementation', 'Knowledge transfer', 'Sustainable capability'].map(item => <span key={item} className="rounded-full border border-[#18231d]/15 bg-white px-4 py-2 text-xs">{item}</span>)}</div></div></div>
      </section>

      <section className="wsc-final relative overflow-hidden bg-[#0e1813] py-28 text-white sm:py-36">
        <div className="wsc-shell relative z-10 text-center"><CircleGauge className="mx-auto text-[#d4b896]" size={32} /><h2 className="mx-auto mt-8 max-w-4xl text-4xl font-medium leading-tight tracking-[-.025em] sm:text-5xl lg:text-6xl">Your business shouldn't become harder to run as it grows.</h2><p className="mt-6 text-lg text-white/60">Let's identify where the friction is and what to fix first.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/contact" className="wsc-button bg-white text-[#17211c]">Book an Operational Health Check <ArrowRight size={17} /></Link><Link to="/contact" className="wsc-button liquid-glass text-white">Talk to us</Link></div></div>
      </section>
    </div>
  )
}
