import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const pageLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Materials', path: '/materials' },
  { label: 'Contact', path: '/contact' },
]

function scrollToProjects() {
  if (window.location.hash === '#/' || window.location.hash === '') {
    const el = document.getElementById('projects-section')
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
  }
  window.location.hash = '/'
  setTimeout(() => {
    const el = document.getElementById('projects-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, 300)
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-500 ${
          scrolled
            ? 'bg-[#1e3329]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.15)]'
            : 'bg-[#2d4a3e]/60 backdrop-blur-md'
        }`}
        style={{ borderBottom: scrolled ? '1px solid rgba(212,184,150,0.08)' : '1px solid transparent' }}
      >
        <nav className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 focus-gold shrink-0" aria-label="KiwiKoru 3D Home">
            <img src="/images/logo.png" alt="" width="36" height="36" className="rounded-lg" style={{ objectFit: 'contain' }} />
            <span className="text-gold font-bold text-lg tracking-tight hidden sm:inline">KiwiKoru 3D</span>
          </Link>

          {/* Desktop Nav: Home, Services, Projects, Materials, Contact */}
          <div className="hidden md:flex items-center gap-7" role="menubar">
            <Link to="/" role="menuitem" className={`relative text-sm font-medium tracking-[0.06em] transition-colors duration-300 focus-gold py-1 ${location.pathname === '/' ? 'text-gold' : 'text-white/80 hover:text-gold'}`}>
              Home
              {location.pathname === '/' && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </Link>
            <Link to="/services" role="menuitem" className={`relative text-sm font-medium tracking-[0.06em] transition-colors duration-300 focus-gold py-1 ${location.pathname === '/services' ? 'text-gold' : 'text-white/80 hover:text-gold'}`}>
              Services
              {location.pathname === '/services' && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </Link>
            <button onClick={scrollToProjects} role="menuitem" className="relative text-sm font-medium tracking-[0.06em] text-white/80 hover:text-gold transition-colors duration-300 focus-gold py-1">
              Projects
            </button>
            <Link to="/materials" role="menuitem" className={`relative text-sm font-medium tracking-[0.06em] transition-colors duration-300 focus-gold py-1 ${location.pathname === '/materials' ? 'text-gold' : 'text-white/80 hover:text-gold'}`}>
              Materials
              {location.pathname === '/materials' && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </Link>
            <Link to="/contact" role="menuitem" className={`relative text-sm font-medium tracking-[0.06em] transition-colors duration-300 focus-gold py-1 ${location.pathname === '/contact' ? 'text-gold' : 'text-white/80 hover:text-gold'}`}>
              Contact
              {location.pathname === '/contact' && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gold rounded-full" />}
            </Link>
          </div>

          {/* Desktop CTA */}
          <Link to="/quote" className="hidden md:inline-flex items-center px-5 py-2.5 bg-gold/90 text-forest font-semibold text-sm rounded-pill transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 focus-gold backdrop-blur-sm">
            Get Instant Estimate
          </Link>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-gold p-2 focus-gold" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileOpen}>
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1e3329]/95 backdrop-blur-xl flex flex-col items-center justify-center" role="dialog" aria-label="Mobile navigation">
          <button className="absolute top-5 right-6 text-gold p-2 focus-gold" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
            <X size={28} />
          </button>
          <div className="flex flex-col items-center gap-8" role="menubar">
            {pageLinks.map((link) => (
              <Link key={link.path} to={link.path} role="menuitem"
                className={`text-2xl font-semibold transition-colors duration-200 focus-gold ${location.pathname === link.path ? 'text-gold' : 'text-white hover:text-gold'}`}
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button onClick={() => { scrollToProjects(); setMobileOpen(false) }} role="menuitem" className="text-2xl font-semibold text-white hover:text-gold transition-colors duration-200 focus-gold">
              Projects
            </button>
          </div>
          <Link to="/quote" className="mt-10 px-8 py-3 bg-gold text-forest font-semibold rounded-pill transition-all duration-200 hover:bg-gold-light focus-gold" onClick={() => setMobileOpen(false)}>
            Get Instant Estimate
          </Link>
        </div>
      )}
    </>
  )
}
