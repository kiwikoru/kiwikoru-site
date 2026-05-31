import ScrollReveal from './ScrollReveal'

interface SectionHeaderProps {
  label?: string
  headline: string
  body?: string
  dark?: boolean
  className?: string
  id?: string
}

export default function SectionHeader({ label, headline, body, dark = false, className = '', id }: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-[640px] mx-auto ${className}`}>
      {label && (
        <ScrollReveal variant="label">
          <span className={`inline-block text-xs font-semibold tracking-[0.12em] uppercase mb-3 ${dark ? 'text-gold' : 'text-forest'}`}>
            {label}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal variant="fadeUp" delay={label ? 0.2 : 0}>
        <h2 id={id} className={`text-[28px] md:text-[40px] font-bold leading-tight tracking-tight ${dark ? 'text-white' : 'text-charcoal'}`}>
          {headline}
        </h2>
      </ScrollReveal>
      {body && (
        <ScrollReveal variant="fadeUp" delay={label ? 0.35 : 0.15}>
          <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-white/60' : 'text-charcoal-light'}`}>
            {body}
          </p>
        </ScrollReveal>
      )}
    </div>
  )
}
