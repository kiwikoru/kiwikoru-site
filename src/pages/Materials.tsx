import { Link } from 'react-router';
import { CheckCircle, Info, ArrowRight } from 'lucide-react';

const materials = [
  {
    tag: 'MOST POPULAR',
    tagColor: 'bg-kiwi-base/10 text-kiwi-base',
    name: 'PLA - Standard',
    desc: 'Our most popular material. Excellent for high-detail models, prototypes, and decorative pieces.',
    bestFor: 'Prototypes, Architectural models, Intricate decor.',
    notes: 'Low heat resistance (warps above 50\u00B0C). Not for outdoor use.',
    specs: [
      'Easy to print',
      'Great surface finish',
      'Biodegradable',
      'Wide colour range',
    ],
  },
  {
    tag: 'IMPACT RESISTANT',
    tagColor: 'bg-green-100 text-green-700',
    name: 'PETG - Durable',
    desc: 'A durable, impact-resistant material that bridges the gap between PLA and ABS. Great all-rounder.',
    bestFor: 'Mechanical parts, Brackets, Clips, Outdoor enclosures.',
    notes: 'Heat resistant up to 75\u00B0C. Slightly glossier finish than PLA.',
    specs: [
      'High impact resistance',
      'Chemical resistant',
      'Good layer adhesion',
      'Food safe options',
    ],
  },
  {
    tag: 'WEATHER RESISTANT',
    tagColor: 'bg-blue-100 text-blue-700',
    name: 'ASA - Outdoor',
    desc: 'UV-stable material perfect for outdoor applications. Maintains colour and strength in sunlight.',
    bestFor: 'Outdoor fixtures, Automotive parts, Marine applications.',
    notes: 'Excellent weather resistance. Higher printing temp required.',
    specs: [
      'UV stable',
      'Weather proof',
      'High temperature resistance',
      'Automotive grade',
    ],
  },
  {
    tag: 'FLEXIBLE',
    tagColor: 'bg-purple-100 text-purple-700',
    name: 'TPU - Flexible',
    desc: 'Rubber-like flexible filament for parts that need to bend, compress, or absorb impact.',
    bestFor: 'Phone cases, Gaskets, Wearables, Shock dampeners.',
    notes: 'Requires slow print speeds. Excellent abrasion resistance.',
    specs: [
      'Shore 95A hardness',
      'Abrasion resistant',
      'High elasticity',
      'Vibration damping',
    ],
  },
];

export default function Materials() {
  return (
    <main className="min-h-screen bg-kiwi-light pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiwi-base/10 mb-4">
            <Info className="w-3 h-3 text-kiwi-base" />
            <span className="text-xs text-kiwi-base font-medium tracking-wide">MATERIAL SELECTION</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-kiwi-dark mb-4">
            The Right Tool for the Job
          </h1>
          <p className="text-lg text-kiwi-base/70 max-w-2xl">
            Choosing the right material is key to a successful project. We stock high-quality polymers for every application.
          </p>
        </div>

        {/* Material Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {materials.map((mat) => (
            <div key={mat.name} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-kiwi-base/30 hover:shadow-lg transition-all">
              <span className={`inline-block px-3 py-1 rounded-full ${mat.tagColor} text-xs font-medium tracking-wide mb-4`}>
                {mat.tag}
              </span>
              <h3 className="text-xl font-heading font-semibold text-kiwi-dark mb-3">{mat.name}</h3>
              <p className="text-kiwi-base/60 text-sm mb-6">{mat.desc}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium tracking-wider uppercase text-kiwi-base/70">Best For</span>
                  </div>
                  <p className="text-sm text-kiwi-base/60 ml-6">{mat.bestFor}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-kiwi-base/50" />
                    <span className="text-xs font-medium tracking-wider uppercase text-kiwi-base/70">Important Notes</span>
                  </div>
                  <p className="text-sm text-kiwi-base/60 ml-6 italic">{mat.notes}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mat.specs.map((spec) => (
                  <span key={spec} className="px-3 py-1 rounded-full bg-kiwi-light text-xs text-kiwi-base/70">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Material CTA */}
        <div className="bg-kiwi-dark rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                Need a custom material?
              </h3>
              <p className="text-white/60 mb-6">
                We can source specialty filaments like Carbon Fiber, Wood, or Glow-in-the-dark for bulk orders.
              </p>
            </div>
            <div className="lg:text-right">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-kiwi-dark px-6 py-3 rounded-lg font-medium hover:bg-kiwi-gold transition-colors"
              >
                Enquire about materials
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
