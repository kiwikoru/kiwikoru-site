import { Link } from 'react-router';
import { Layers, Target, Printer, ShieldCheck, Cog, Boxes, Sun, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const specs = [
  { icon: Boxes, label: 'Build Volume', value: '256 x 256 x 256 mm', desc: 'Maximum single-part dimensions.' },
  { icon: Layers, label: 'Print Standard', value: 'Optimized 0.2mm', desc: 'Tuned balance of strength & detail.' },
  { icon: Target, label: 'Accuracy', value: '\u00B1 0.2 mm', desc: 'Typical dimensional tolerance.' },
  { icon: Cog, label: 'Capacity', value: 'Multi-Printer Farm', desc: 'Reliable throughput for batch orders.' },
];

const workflow = [
  { num: '1', icon: ShieldCheck, title: 'Digital Audit', desc: 'Analysis of STL files for structural integrity.' },
  { num: '2', icon: Layers, title: 'Industrial Slicing', desc: 'Custom pathing tuned for material strength.' },
  { num: '3', icon: Printer, title: 'The Print', desc: 'High-uptime production monitored for consistency.' },
  { num: '4', icon: ShieldCheck, title: 'Quality Check', desc: 'Final inspection and post-processing of every unit.' },
];

const tailored = [
  { icon: Cog, title: 'Functional Prototyping', desc: 'Rapid iterations using high-strength polymers.' },
  { icon: Boxes, title: 'Small Batch Production', desc: 'Bridge the gap before injection molding runs.' },
  { icon: Sun, title: 'End-Use Parts', desc: 'UV-resistant parts for outdoor or automotive use.' },
];

export default function Services() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.animate-in').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          opacity: 0, y: 30, duration: 0.6, delay: i * 0.08, ease: 'power2.out'
        });
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-in mb-16">
          <h1 className="text-4xl lg:text-5xl font-heading font-semibold text-kiwi-dark">
            Industrial Grade<br />
            <span className="text-kiwi-base">FDM Production</span>
          </h1>
          <p className="mt-6 text-lg text-kiwi-base/70 max-w-2xl">
            We operate a dedicated farm of high-reliability printers, optimized for engineering-grade materials and consistent production at scale.
          </p>
        </div>

        {/* Technical Specs */}
        <div className="animate-in mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium tracking-widest uppercase text-kiwi-base/50">
              Technical Specifications
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-kiwi-base/30 hover:shadow-md transition-all">
                <spec.icon className="w-5 h-5 text-kiwi-base/60 mb-3" />
                <p className="text-xs font-medium tracking-wider uppercase text-kiwi-base/50 mb-1">{spec.label}</p>
                <p className="text-lg font-heading font-semibold text-kiwi-dark mb-1">{spec.value}</p>
                <p className="text-xs text-kiwi-base/50">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Production Workflow */}
        <div className="animate-in mb-20 bg-kiwi-light rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-kiwi-dark">
              Our Production Workflow
            </h2>
            <p className="mt-2 text-kiwi-base/60 text-sm">
              How your project moves from digital file to physical part.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step) => (
              <div key={step.num} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-5xl font-heading font-bold text-gray-200 mr-2">{step.num}</span>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm">
                    <step.icon className="w-6 h-6 text-kiwi-base" />
                  </div>
                </div>
                <h4 className="font-heading font-semibold text-kiwi-dark text-sm mb-1">{step.title}</h4>
                <p className="text-kiwi-base/50 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tailored Requirements */}
        <div className="animate-in mb-20">
          <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-kiwi-dark mb-8">
            Tailored Requirements
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tailored.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-kiwi-base/30 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-kiwi-base/10 mb-4">
                  <item.icon className="w-5 h-5 text-kiwi-base" />
                </div>
                <h4 className="font-heading font-semibold text-kiwi-dark mb-2">{item.title}</h4>
                <p className="text-kiwi-base/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Local Advantage CTA */}
        <div className="animate-in bg-kiwi-base rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                Whangārei Click & Collect
              </h3>
              <p className="text-white/70 mb-6">
                Skip courier delays. Collect your parts from our Morningside studio as soon as they're finished.
              </p>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 bg-white text-kiwi-base px-6 py-3 rounded-lg font-medium hover:bg-kiwi-gold transition-colors"
              >
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src="/images/hero-3d.jpg"
                alt="Our 3D Printing Studio"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
