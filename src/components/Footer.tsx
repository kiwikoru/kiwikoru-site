import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 focus-gold">
              <img src="/images/logo.png" alt="KiwiKoru 3D" width="28" height="28" className="rounded-md" />
              <span className="text-gold font-bold text-base">KiwiKoru 3D</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Northland's precision 3D printing studio. Turning digital designs into physical reality with local reliability.
            </p>
            <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 border border-white/20 rounded-pill text-[11px] font-medium tracking-[0.1em] text-white/70 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Proudly New Zealand Service
            </span>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] text-white uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5" role="list">
              {[
                { label: 'Home', path: '/' },
                { label: 'Services', path: '/services' },
                { label: 'Materials', path: '/materials' },
                { label: 'Contact', path: '/contact' },
                { label: 'Get a Quote', path: '/quote' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-white/50 hover:text-white transition-colors duration-200 focus-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] text-white uppercase mb-4">Services</h4>
            <ul className="space-y-2.5" role="list">
              {['3D Printing', 'Product Development', 'CAD Design', 'Prototyping', 'Replacement Parts', 'Custom Manufacturing'].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-white/50 hover:text-white transition-colors duration-200 focus-gold">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] text-white uppercase mb-4">Contact</h4>
            <ul className="space-y-3" role="list">
              <li>
                <a href="mailto:kiwikoru3d@gmail.com" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200 focus-gold">
                  <Mail size={16} className="text-gold shrink-0" />kiwikoru3d@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+640272602954" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200 focus-gold">
                  <Phone size={16} className="text-gold shrink-0" />+64 027 260 2954
                </a>
              </li>
              <li>
                <a href="https://wa.me/640272602954" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors duration-200 focus-gold">
                  <MessageCircle size={16} className="shrink-0" />WhatsApp
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin size={16} className="text-gold shrink-0" />Morningside, Whangārei, New Zealand
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-white/40 tracking-wide">© {new Date().getFullYear()} KiwiKoru3D.com. All rights reserved.</p>
          <p className="text-[11px] text-white/40 tracking-wide uppercase">Terms of Service · Privacy Policy · All Prices in NZD · Whangārei, New Zealand</p>
        </div>
      </div>
    </footer>
  )
}
