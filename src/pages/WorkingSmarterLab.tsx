import { ArrowUpRight, FlaskConical, LockKeyhole } from 'lucide-react'

const concepts = [
  {
    number: '01',
    title: 'Editorial clarity',
    influence: 'Kononenko direction',
    description: 'Quiet authority, generous space and a restrained consulting tone.',
    url: 'https://bsmarter-kononenko-concept.rodrigocastagnodecol.chatgpt.site',
    surface: 'bg-[#f0ede6]',
    ink: 'text-[#171714]',
    accent: 'bg-[#c7d3be]',
  },
  {
    number: '02',
    title: 'Signal system',
    influence: 'Aspen direction',
    description: 'A sharp editorial grid with focused pixel interaction around AI.',
    url: 'https://bsmarter-aspen-concept.rodrigocastagnodecol.chatgpt.site',
    surface: 'bg-[#f6f6f3]',
    ink: 'text-[#191a18]',
    accent: 'bg-[#98f3ca]',
  },
  {
    number: '03',
    title: 'Polished systems',
    influence: 'ORGNZM direction',
    description: 'Warm, tactile and conceptual: the stone is polished into a useful system.',
    url: 'https://bsmarter-orgnzm-concept.rodrigocastagnodecol.chatgpt.site',
    surface: 'bg-[#d8ccb9]',
    ink: 'text-[#302a24]',
    accent: 'bg-[#a8b695]',
  },
  {
    number: '04',
    title: 'Dream smart',
    influence: 'Interactive product direction',
    description: 'A vivid, agile experience with practical tools, assistant demos and colour.',
    url: 'https://bsmarter-dream-concept.rodrigocastagnodecol.chatgpt.site',
    surface: 'bg-[#0b0c13]',
    ink: 'text-white',
    accent: 'bg-[#bcff74]',
  },
  {
    number: '05',
    title: 'Architecture of work',
    influence: 'Aircenter direction',
    description: 'Monumental typography and a layered sculpture built around B.Smarter’s identity.',
    url: 'https://bsmarter-air-concept.rodrigocastagnodecol.chatgpt.site',
    surface: 'bg-[#f7f7f4]',
    ink: 'text-[#090a09]',
    accent: 'bg-[#a8c58b]',
  },
]

export default function WorkingSmarterLab() {
  return (
    <main className="min-h-screen bg-[#f3f1eb] pb-24 pt-[72px] text-[#17231c]">
      <section className="border-b border-[#17231c]/20 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#17231c]/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em]">
              <FlaskConical className="h-3.5 w-3.5" /> Temporary review space
            </span>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#66705f]">B.Smarter / Design explorations</p>
            <h1 className="max-w-5xl font-heading text-5xl font-semibold leading-[.9] tracking-[-.06em] sm:text-7xl lg:text-[8.5rem]">
              Five ways to make work feel smarter.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#445044] sm:text-lg">
              Each concept contains the same business idea—clearer processes, practical AI assistants and more time for owners to lead—expressed through a different visual system.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-8 flex items-center justify-between gap-5 border-b border-[#17231c]/25 pb-5">
          <p className="text-xs font-bold uppercase tracking-[.14em]">Select a direction</p>
          <p className="flex items-center gap-2 text-xs text-[#66705f]"><LockKeyhole className="h-3.5 w-3.5" /> Private concept links</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {concepts.map((concept, index) => (
            <a
              key={concept.number}
              href={concept.url}
              target="_blank"
              rel="noreferrer"
              className={`group relative min-h-[440px] overflow-hidden rounded-[2rem] border border-[#17231c]/20 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${concept.surface} ${concept.ink} ${index === concepts.length - 1 ? 'lg:col-span-2 lg:min-h-[520px]' : ''}`}
            >
              <div className="relative z-10 flex items-start justify-between">
                <span className="text-xs font-bold tracking-[.12em]">{concept.number} / 05</span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-current/30 transition group-hover:rotate-45 group-hover:bg-current group-hover:text-[#f3f1eb]">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-[22%] flex items-center justify-center" aria-hidden="true">
                <span className={`h-52 w-52 rounded-full opacity-80 blur-[1px] transition duration-500 group-hover:scale-110 ${concept.accent}`} />
                <span className="absolute text-[10rem] font-black leading-none tracking-[-.12em] opacity-90 sm:text-[13rem]">B.</span>
              </div>

              <div className="relative z-10 mt-56 max-w-xl sm:mt-64">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] opacity-60">{concept.influence}</p>
                <h2 className="font-heading text-4xl font-semibold leading-none tracking-[-.05em] sm:text-5xl">{concept.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">{concept.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-[#d7c6a4] bg-[#eee4d2] px-6 py-8 sm:px-9">
          <p className="text-xs leading-relaxed text-[#5e513f]">
            This page is a temporary design-review space. It does not change KiwiKoru’s products, services, ordering experience or customer journeys.
          </p>
        </div>
      </section>
    </main>
  )
}
