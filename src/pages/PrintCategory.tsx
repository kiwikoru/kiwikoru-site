import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Gamepad2, HomeIcon, Lightbulb, Package, Ruler, Shapes } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getPrintCategory } from '../data/whatWePrint'

const iconByCategory = { games: Gamepad2, home: HomeIcon, prototype: Lightbulb, business: BriefcaseBusiness }

export default function PrintCategory() {
  const { category: slug } = useParams()
  const category = getPrintCategory(slug)
  if (!category) return <Navigate to="/" replace />
  const CategoryIcon = iconByCategory[category.icon]

  return <main className="min-h-screen bg-off-white pb-24 pt-24">
    <section className="relative overflow-hidden bg-forest-dark text-white">
      <div className="absolute inset-0 opacity-20"><img src={category.heroImage} alt="" className="h-full w-full object-cover blur-[2px]" /></div>
      <div className="absolute inset-0 bg-gradient-to-r from-forest-dark via-forest-dark/95 to-forest-dark/65" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:py-24">
        <div>
          <Link to="/#projects-section" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light hover:text-white"><ArrowLeft size={17}/> Back to what we print</Link>
          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10"><CategoryIcon className="text-gold-light" /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-gold-light">What we print</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{category.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{category.introduction}</p>
        </div>
        <img src={category.heroImage} alt={`${category.title} workshop case study`} className="aspect-[3/2] w-full rounded-3xl border border-white/20 object-cover shadow-2xl" />
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Representative project profiles</p><h2 className="mt-3 text-3xl font-semibold text-forest-dark sm:text-4xl">From requirement to finished part</h2><p className="mt-4 leading-relaxed text-forest/65">These profiles show realistic ways we approach this type of work. Final material, quantity and construction are always selected around your actual requirement.</p></div>
      <div className="mt-12 space-y-10">
        {category.cases.map((study, index) => <article key={study.title} className="grid overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm lg:grid-cols-2">
          <div className={index % 2 ? 'lg:order-2' : ''}><img src={study.image} alt={study.title} className="h-full min-h-72 w-full object-cover" /></div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <span className="text-xs font-bold uppercase tracking-[.16em] text-gold">Case {String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 text-2xl font-semibold text-forest-dark sm:text-3xl">{study.title}</h3>
            <p className="mt-4 leading-relaxed text-forest/65">{study.summary}</p>
            <dl className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-[#f1f5ed] p-4"><dt className="flex items-center gap-2 font-bold text-forest-dark"><Package size={16}/> Quantity</dt><dd className="mt-1 text-forest/65">{study.quantity}</dd></div>
              <div className="rounded-xl bg-[#edf3e8] p-4"><dt className="flex items-center gap-2 font-bold text-forest-dark"><Shapes size={16}/> Material</dt><dd className="mt-1 text-forest/65">{study.material}</dd></div>
              <div className="rounded-xl bg-[#e8f0e3] p-4"><dt className="flex items-center gap-2 font-bold text-forest-dark"><Ruler size={16}/> Build detail</dt><dd className="mt-1 text-forest/65">{study.detail}</dd></div>
              <div className="rounded-xl bg-[#e3eddd] p-4"><dt className="flex items-center gap-2 font-bold text-forest-dark"><CheckCircle2 size={16}/> Outcome</dt><dd className="mt-1 text-forest/65">{study.outcome}</dd></div>
            </dl>
          </div>
        </article>)}
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-4 sm:px-6"><div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-forest-dark p-8 text-center text-white sm:p-10 md:flex-row md:text-left"><div><h2 className="text-2xl font-semibold">Have something different in mind?</h2><p className="mt-2 text-white/65">Show us the problem, the file or even a rough idea. We’ll help define the practical next step.</p></div><Link to="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-bold text-forest-dark transition hover:-translate-y-0.5 hover:bg-gold-light">Discuss your project <ArrowRight size={17}/></Link></div></section>
  </main>
}
