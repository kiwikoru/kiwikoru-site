import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, MessageCircle, Zap } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/materials', label: 'Materials' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-kiwi-base/90 backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo.png"
                alt="Kiwi Koru 3D"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
              <span className="text-white font-heading font-semibold text-lg hidden sm:block">
                Kiwi Koru <span className="text-kiwi-gold">3D</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                    isActive(link.to)
                      ? 'text-kiwi-gold'
                      : 'text-white/80 hover:text-kiwi-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/quote"
                className="hidden sm:flex items-center gap-2 bg-kiwi-gold hover:bg-kiwi-goldDark text-kiwi-dark px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4" />
                Instant Quote
              </Link>
              <a
                href="https://wa.me/640272602954"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-green-600 text-white transition-colors"
                title="Contact via WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-kiwi-dark/98 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-2xl font-heading font-medium text-white hover:text-kiwi-gold transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/quote"
              className="mt-4 flex items-center gap-2 bg-kiwi-gold text-kiwi-dark px-8 py-3 rounded-lg font-medium"
            >
              <Zap className="w-5 h-5" />
              Instant Quote
            </Link>
            <a
              href="https://wa.me/640272602954"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </>
  );
}
