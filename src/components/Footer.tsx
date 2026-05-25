import { Link } from 'react-router';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-kiwi-dark border-t border-white/10">
      {/* CTA Banner */}
      <div className="bg-kiwi-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-white">
                Proudly <span className="text-kiwi-gold">Northland</span> Owned.
              </h3>
              <p className="text-white/70 mt-2">
                Based in Morningside, Whangārei for fast local service.
              </p>
            </div>
            <Link
              to="/quote"
              className="flex items-center gap-2 bg-white text-kiwi-base px-6 py-3 rounded-lg font-medium hover:bg-kiwi-gold transition-colors"
            >
              Start Your Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Kiwi Koru 3D" className="h-12 w-auto" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Northland's precision 3D printing studio. Turning digital designs into physical reality with local reliability.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-kiwi-gold"></span>
              <span className="text-xs text-white/70 font-medium tracking-wide">PROUDLY NZ OWNED & OPERATED</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-white/50 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Services Capabilities' },
                { to: '/materials', label: 'Materials Guide' },
                { to: '/contact', label: 'Contact & Collection' },
                { to: '/quote', label: 'Instant Quote' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-kiwi-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-white/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:kiwikoru3d@gmail.com"
                  className="flex items-center gap-3 text-white/70 hover:text-kiwi-gold transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  kiwikoru3d@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+640272602954"
                  className="flex items-center gap-3 text-white/70 hover:text-kiwi-gold transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  +64 027 260 2954
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/640272602954"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Morningside, Whangārei, New Zealand</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <span>&copy; {new Date().getFullYear()} KiwiKoru3D.com. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>TERMS OF SERVICE</span>
              <span>PRIVACY POLICY</span>
              <span>ALL PRICES IN NZD</span>
              <span>WHANGĀREI, NEW ZEALAND</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
