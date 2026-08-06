import { Link } from 'react-router';
import {
  Upload, Clock, MapPin, Zap, ArrowRight, ChevronRight,
  Gamepad2, HomeIcon, Wrench, Lightbulb, CheckCircle, Info, HelpCircle, PencilRuler, MessageCircle
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────── HERO SECTION ─────────── */
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 1, delay: 0.4, ease: 'power3.out' });
      gsap.from('.hero-cta', { opacity: 0, y: 20, duration: 1, delay: 0.6, ease: 'power3.out' });
      gsap.from('.hero-card', { opacity: 0, scale: 0.9, duration: 1, delay: 0.5, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen gradient-hero flex items-center pt-20">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-kiwi-gold/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-semibold text-white leading-tight">
              Your Parts.<br />
              Printed Fast.<br />
              <span className="text-kiwi-gold">Made in NZ.</span>
            </h1>
            <p className="hero-desc mt-6 text-lg text-white/70 max-w-lg mx-auto lg:mx-0">
              Got a 3D model? We'll bring it to life. Whether you designed it yourself or found it online, simply upload your STL and we'll handle the rest — from digital file to finished part.
            </p>
            <div className="hero-cta mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white hover:border-kiwi-gold hover:text-kiwi-gold transition-colors"
              >
                How We Print
              </Link>
            </div>
          </div>

          {/* Right - Quote Card */}
          <div className="hero-card flex justify-center lg:justify-end">
            <Link
              to="/quote"
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-sm hover:border-kiwi-gold/50 transition-all hover:shadow-glow"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-kiwi-gold/20 mb-6">
                <Upload className="w-8 h-8 text-kiwi-gold" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2">
                Get an Instant Quote
              </h3>
              <p className="text-white/60 text-sm mb-6">
                Click here to upload your STL files and calculate price immediately.
              </p>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-kiwi-gold text-kiwi-dark mx-auto group-hover:scale-110 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Features Bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'Instant Pricing', desc: 'Real-time quotes 24/7' },
            { icon: MapPin, title: 'NZ Made & Owned', desc: 'Printed locally in Whangārei' },
            { icon: Clock, title: 'Click & Collect', desc: 'Pickup or Courier' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-4"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-kiwi-gold/20 flex-shrink-0">
                <feature.icon className="w-5 h-5 text-kiwi-gold" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                <p className="text-white/50 text-xs">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── STEPS SECTION ─────────── */
function StepsSection() {
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          opacity: 0, y: 40, duration: 0.6, delay: i * 0.15, ease: 'power2.out'
        });
      });
    }, stepsRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: '1',
      icon: Upload,
      title: 'Upload Design',
      desc: 'Created it yourself or found it on Thingiverse? Just drag & drop your STL file.',
    },
    {
      num: '2',
      icon: Zap,
      title: 'Get Instant Price',
      desc: 'Select your material (PLA, PETG, ASA) and see the cost immediately.',
    },
    {
      num: '3',
      icon: MapPin,
      title: 'We Print & Ship',
      desc: 'Our Whangārei studio prints your part. Collect in Morningside or we courier it.',
    },
  ];

  return (
    <section ref={stepsRef} className="bg-kiwi-light py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-kiwi-dark">
            From File to Physical in 3 Steps
          </h2>
          <p className="mt-4 text-kiwi-base/70 max-w-xl mx-auto">
            Our automated system makes it easier than ever to get custom parts manufactured locally.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="step-card text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mx-auto mb-6">
                <step.icon className="w-7 h-7 text-kiwi-base" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-kiwi-dark mb-2">
                {step.num}. {step.title}
              </h3>
              <p className="text-kiwi-base/60 text-sm max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── FIND MODELS SECTION ─────────── */
function FindModelsSection() {
  return (
    <section className="gradient-hero py-20 lg:py-28 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <Info className="w-4 h-4 text-gold-light" />
              <span className="text-xs text-gold-light font-semibold tracking-wide">Need a design?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white mb-5">
              Find the right model.<br /><span className="text-gold-light">We’ll bring it to life.</span>
            </h2>
            <p className="text-white/75 text-base leading-relaxed max-w-xl mb-8">
              You don’t need to be a CAD expert. Choose a ready-made design, create your own, or talk to us about developing it—then send us the STL file for printing.
            </p>
            <ul className="space-y-4 text-sm sm:text-base">
              <li className="flex items-center gap-3 text-white/80"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 shrink-0"><CheckCircle className="w-4 h-4 text-gold-light" /></span><span>Browse models on <a className="text-gold-light font-semibold hover:underline" href="https://www.thingiverse.com" target="_blank" rel="noopener noreferrer">Thingiverse</a> or <a className="text-gold-light font-semibold hover:underline" href="https://www.printables.com" target="_blank" rel="noopener noreferrer">Printables</a></span></li>
              <li className="flex items-center gap-3 text-white/80"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 shrink-0"><CheckCircle className="w-4 h-4 text-gold-light" /></span><span>Create or adapt a custom model using AI tools</span></li>
              <li className="flex items-center gap-3 text-white/80"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 shrink-0"><CheckCircle className="w-4 h-4 text-gold-light" /></span><span>Need an original design? <Link className="text-gold-light font-semibold hover:underline" to="/contact">Discuss it with KiwiKoru</Link></span></li>
            </ul>
            <Link to="/quote" className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-forest-dark font-bold shadow-lg transition hover:bg-gold-light hover:-translate-y-0.5">Upload your STL & get a quote <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 p-2">
              <img
                src="/images/printer-workshop-real.jpg"
                alt="Professional KiwiKoru 3D printing workshop with varied printers and filament"
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
            </div>
            <p className="mt-3 text-center text-xs text-white/45">Professional FDM printing · Whangārei, New Zealand</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── WHAT WE PRINT SECTION ─────────── */
function WhatWePrintSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.print-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          opacity: 0, y: 30, duration: 0.5, delay: i * 0.1, ease: 'power2.out'
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const categories = [
    { icon: Gamepad2, title: 'Hobbies & Games', desc: 'Minis, fidget toys, terrain, and custom gaming accessories.', img: '/images/hobbies.jpg' },
    { icon: HomeIcon, title: 'Home Hacks', desc: 'Custom brackets, storage solutions, and gadgets.', img: '/images/homehacks.jpg' },
    { icon: Wrench, title: 'Repairs & DIY', desc: 'Replacement parts for appliances and cars.', img: '/images/repairs.jpg' },
    { icon: Lightbulb, title: 'Prototypes', desc: 'Rapid prototyping for engineers and inventors.', img: '/images/prototypes.jpg' },
  ];

  return (
    <section ref={sectionRef} className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-kiwi-dark">
            What We Print
          </h2>
          <p className="mt-4 text-kiwi-base/70 max-w-xl mx-auto">
            High-quality parts for every use case. If you have the file, we can print it.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="print-card group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:border-kiwi-base/30"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-kiwi-base/10">
                    <cat.icon className="w-4 h-4 text-kiwi-base" />
                  </div>
                  <h3 className="font-heading font-semibold text-kiwi-dark text-sm">{cat.title}</h3>
                </div>
                <p className="text-kiwi-base/60 text-xs leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── MATERIALS SECTION ─────────── */
function MaterialsSection() {
  return (
    <section className="bg-off-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-forest-dark">
            Materials at a Glance
          </h2>
          <p className="mt-4 text-forest/70 max-w-xl mx-auto">
            Choosing the right material is key to a successful print.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* PLA Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition hover:-translate-y-1 hover:shadow-card">
            <span className="inline-block px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-wide mb-4">
              MOST POPULAR
            </span>
            <h3 className="text-xl font-semibold text-forest-dark mb-3">PLA - Standard</h3>
            <p className="text-forest/65 text-sm">
              Best value. Perfect for display models and indoor items.
            </p>
          </div>
          {/* PETG Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition hover:-translate-y-1 hover:shadow-card">
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium tracking-wide mb-4">
              IMPACT RESISTANT
            </span>
            <h3 className="text-xl font-semibold text-forest-dark mb-3">PETG - Durable</h3>
            <p className="text-forest/65 text-sm">
              Strong and snap-resistant. Great for functional clips.
            </p>
          </div>
          {/* TPU Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition hover:-translate-y-1 hover:shadow-card">
            <span className="inline-block px-3 py-1 rounded-full bg-gold/25 text-forest-dark text-xs font-semibold tracking-wide mb-4">
              FLEXIBLE
            </span>
            <h3 className="text-xl font-semibold text-forest-dark mb-3">TPU - Flexible</h3>
            <p className="text-forest/65 text-sm">
              Tough and elastic. Ideal for grips, protective parts, seals and flexible components.
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/materials" className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3.5 text-white font-semibold text-sm shadow-md transition hover:bg-forest-dark hover:-translate-y-0.5 hover:shadow-lg">
            Compare all materials <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FAQ SECTION ─────────── */
function FAQSection() {
  const faqs = [
    {
      icon: MapPin,
      q: 'Where is pickup located?',
      a: 'We are located in Morningside, Whangārei. You\'ll receive the exact address via email once your print is ready for collection.',
    },
    {
      icon: Clock,
      q: 'How long does it take?',
      a: 'Standard prints typically ship or are ready for collection in 24-48 hours. Larger batches or highly complex parts may take longer.',
    },
    {
      icon: PencilRuler,
      q: 'Do you do design work?',
      a: 'Yes. Send us your idea through the contact form and we can discuss the design, requirements and best path to production.',
    },
  ];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-forest/10 bg-off-white p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-xs font-bold tracking-wider uppercase text-forest"><HelpCircle className="w-4 h-4" /> Quick answers</span>
          <h2 className="mt-5 text-3xl lg:text-4xl font-semibold text-forest-dark">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-forest/70">
            Everything you need to know about our local Whangārei service.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {faqs.map((faq) => (
            <article key={faq.q} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-card">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-forest/10 text-forest mb-5 transition group-hover:bg-gold/30">
                <faq.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-forest-dark mb-3">{faq.q}</h3>
              <p className="text-forest/65 text-sm leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-forest-dark px-6 py-5 text-center sm:text-left">
          <div><strong className="block text-white">Still have a question?</strong><span className="text-sm text-white/65">Tell us about your print or design project.</span></div>
          <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-forest-dark transition hover:bg-gold-light hover:-translate-y-0.5"><MessageCircle className="w-4 h-4" /> Contact KiwiKoru</Link>
        </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── HOME PAGE ─────────── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <StepsSection />
      <FindModelsSection />
      <WhatWePrintSection />
      <MaterialsSection />
      <FAQSection />
    </main>
  );
}
