import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { WhatsAppLogo, WHATSAPP_URL } from './WhatsAppFloat'
import { CART_UPDATED_EVENT, getPrintCartCount } from '../lib/printCart'

const pageLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Materials', path: '/materials' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  const scrollToProjects = () => {
    const scroll = () => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (location.pathname === '/') { scroll(); return }
    navigate('/#projects-section')
    window.setTimeout(scroll, 350)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#projects-section') {
      window.setTimeout(() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const refresh = () => void getPrintCartCount().then(setCartCount).catch(() => setCartCount(0))
    refresh()
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-500 ${
          scrolled
            ? 'bg-[#253126] shadow-[0_4px_30px_rgba(0,0,0,0.18)]'
            : 'bg-[#34412f] shadow-[0_2px_18px_rgba(0,0,0,0.12)]'
        }`}
        style={{ borderBottom: '1px solid rgba(212,184,150,0.18)' }}
      >
        <nav className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 focus-gold shrink-0" aria-label="KiwiKoru 3D Home">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#17231c]/75 p-1.5 shadow-inner ring-1 ring-white/5">
              <img src="/images/kiwikoru-logo-moss.png" alt="" width="36" height="36" className="h-full w-full object-contain" />
            </span>
            <span className="text-gold font-bold text-lg tracking-tight hidden sm:inline">KiwiKoru 3D</span>
          </Link>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:hidden whitespace-nowrap font-bold text-[17px] tracking-tight focus-gold" aria-label="KiwiKoru 3D Home">
            <span className="text-white">Kiwi</span><span className="text-gold">Koru</span><span className="ml-1 text-gold-light text-[13px]">3D</span>
          </Link>

          {/* Desktop Nav: Home, Services, Projects, Materials, Contact */}
          <div className="hidden md:flex items-center gap-7" role="menubar">
            <Link to="/youshie-me" role="menuitem" className="group inline-flex items-center gap-1.5 rounded-full border border-[#c9a8ff]/45 bg-[#7c3aed]/20 px-3 py-1.5 text-sm font-bold tracking-wide text-[#eadcff] transition-all hover:-translate-y-0.5 hover:bg-[#7c3aed]/35 hover:text-white">
              <span aria-hidden="true">✦</span> Youshies
            </Link>
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

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart" aria-label={`Open shopping cart with ${cartCount} items`} title="Shopping cart" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-white/10 text-white shadow-md transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-white/15 hover:text-gold focus-gold">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-black text-forest-dark">{cartCount}</span>}
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat with KiwiKoru on WhatsApp" className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md transition-colors hover:bg-[#20bd5a] focus-gold">
              <WhatsAppLogo className="w-5 h-5" />
            </a>
            <Link to="/quote" className="inline-flex items-center px-5 py-2.5 bg-gold/90 text-forest font-semibold text-sm rounded-pill transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 focus-gold backdrop-blur-sm">
              Get Instant Estimate
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <Link to="/cart" aria-label={`Open shopping cart with ${cartCount} items`} className="relative grid h-10 w-10 place-items-center rounded-full text-gold transition-colors hover:bg-white/10 focus-gold">
              <ShoppingCart size={21} />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-black text-forest-dark">{cartCount}</span>}
            </Link>
            <button className="text-gold p-2 focus-gold" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileOpen}>
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#253126]/95 backdrop-blur-xl flex flex-col items-center justify-center" role="dialog" aria-label="Mobile navigation">
          <button className="absolute top-5 right-6 text-gold p-2 focus-gold" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
            <X size={28} />
          </button>
          <div className="flex flex-col items-center gap-8" role="menubar">
            <Link to="/youshie-me" role="menuitem" className="rounded-full border border-[#c9a8ff]/50 bg-[#7c3aed]/25 px-6 py-2 text-2xl font-bold text-[#eadcff]" onClick={() => setMobileOpen(false)}>
              ✦ Youshies
            </Link>
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
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-3 px-7 py-3 bg-[#25D366] text-white font-semibold rounded-pill focus-gold" onClick={() => setMobileOpen(false)}>
            <WhatsAppLogo className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>
      )}
    </>
  )
}
