export type PrintCaseStudy = {
  title: string
  summary: string
  image: string
  quantity: string
  material: string
  detail: string
  outcome: string
}

export type PrintCategory = {
  slug: string
  icon: 'games' | 'home' | 'prototype' | 'business'
  title: string
  shortDescription: string
  introduction: string
  heroImage: string
  cases: PrintCaseStudy[]
}

export const printCategories: PrintCategory[] = [
  {
    slug: 'hobbies-cosplay-games', icon: 'games', title: 'Hobbies, Cosplay & Games',
    shortDescription: 'Cosplay builds, tabletop pieces, display models and clever gaming accessories.',
    introduction: 'From a one-off wearable prop to a complete tabletop set, 3D printing makes ambitious personal projects achievable without industrial tooling.',
    heroImage: '/images/case-cosplay-helmet.webp',
    cases: [
      { title: 'Full-size cosplay helmet', summary: 'A multi-part wearable shell designed to be assembled, filled, sanded and painted by the maker.', image: '/images/case-cosplay-helmet.webp', quantity: '1 complete helmet · 6 sections', material: 'PLA+ for easy finishing', detail: '0.20 mm layers · reinforced seams', outcome: 'Lightweight wearable structure ready for hand finishing' },
      { title: 'Tabletop terrain collection', summary: 'Modular scenery and character pieces produced as a consistent set for repeat game nights.', image: '/images/hobbies-games.jpg', quantity: '42 individual pieces', material: 'PLA in four coordinated colours', detail: '0.12–0.16 mm layers', outcome: 'Durable pieces with crisp, paint-ready surface detail' },
      { title: 'Custom gaming accessories', summary: 'Controller stands, token trays and compact organisers sized around the customer’s setup.', image: '/images/hobbies.jpg', quantity: '6 matched accessories', material: 'PETG for everyday handling', detail: '0.20 mm layers · 25% infill', outcome: 'A tidy, personalised desk setup without mass-production minimums' },
    ],
  },
  {
    slug: 'home-repairs-diy', icon: 'home', title: 'Home, Repairs & DIY',
    shortDescription: 'Replacement parts, brackets, organisers and practical fixes for everyday life.',
    introduction: 'Home hacks and repairs belong together: measure the problem, test the fit, then make a strong final part that keeps a useful object working.',
    heroImage: '/images/case-home-repair.webp',
    cases: [
      { title: 'Replacement appliance control', summary: 'A broken discontinued knob recreated from measurements, with a quick test fit before the final part.', image: '/images/case-home-repair.webp', quantity: '2 prototypes · 1 final part', material: 'PETG for improved temperature resistance', detail: '0.16 mm layers · reinforced hub', outcome: 'A repairable appliance returned to daily use' },
      { title: 'Made-to-fit storage system', summary: 'Small brackets, cable clips and containers adapted to the exact wall and devices available.', image: '/images/home-hacks.jpg', quantity: '14 coordinated parts', material: 'PLA and PETG by function', detail: '0.20 mm layers', outcome: 'Useful storage without modifying the surrounding furniture' },
      { title: 'Workshop and vehicle repair pieces', summary: 'Clips, covers and mounting pieces recreated when the original spare is no longer readily available.', image: '/images/repairs-diy.jpg', quantity: '4 fit-check parts · 2 finals', material: 'PETG for toughness', detail: '0.20 mm layers · 40% infill', outcome: 'Low-volume replacement parts without expensive tooling' },
    ],
  },
  {
    slug: 'prototypes-industry', icon: 'prototype', title: 'Prototypes & Industry',
    shortDescription: 'Fit checks, functional prototypes, tooling and low-volume production support.',
    introduction: 'Fast physical iterations help engineering teams identify fit, assembly and usability issues before committing to expensive production methods.',
    heroImage: '/images/case-industrial-prototype.webp',
    cases: [
      { title: 'Automotive duct development', summary: 'Three functional iterations used to refine flange position, wall strength and access for installation.', image: '/images/case-industrial-prototype.webp', quantity: '3 design iterations', material: 'PLA fit checks · reinforced PETG final', detail: '0.20 mm layers · measured interfaces', outcome: 'Assembly risks identified before production tooling' },
      { title: 'Production assembly jig', summary: 'A repeatable holding fixture that locates a component consistently during a manual operation.', image: '/images/project-engineering.jpg', quantity: '2 trials · 4 production jigs', material: 'PETG with captured hardware', detail: '0.20 mm layers · 45% infill', outcome: 'Faster setup and more consistent positioning' },
      { title: 'Product enclosure prototype', summary: 'A physical housing used to review internal clearances, fasteners, service access and user handling.', image: '/images/project-prototype.jpg', quantity: '2 complete enclosures', material: 'Matte PETG', detail: '0.16 mm outer surfaces', outcome: 'Design feedback gathered before the next manufacturing stage' },
    ],
  },
  {
    slug: 'business-branded-products', icon: 'business', title: 'Business & Branded Products',
    shortDescription: 'Custom keyrings, desk products, displays, event pieces and useful branded batches.',
    introduction: 'Useful, distinctive branded objects can be produced in small or medium batches without the minimum quantities associated with conventional tooling.',
    heroImage: '/images/case-business-merch.webp',
    cases: [
      { title: 'Two-colour branded keyrings', summary: 'A practical event giveaway produced as a consistent batch and packed locally for distribution.', image: '/images/case-business-merch.webp', quantity: '60 keyrings', material: 'Two-colour PLA', detail: '0.16 mm face detail · integrated loop', outcome: 'A memorable branded object with a manageable batch size' },
      { title: 'Personalised desk organisers', summary: 'Pen holders and compact phone stands coordinated in company colours for a small team.', image: '/images/project-gifts.jpg', quantity: '18 desk sets', material: 'Matte PLA', detail: '0.20 mm layers · two colour regions', outcome: 'Functional staff gifts personalised without stickers' },
      { title: 'Countertop display holders', summary: 'Reusable holders sized around cards, QR panels and small printed information pieces.', image: '/images/business-branding.jpg', quantity: '12 display pieces', material: 'PETG for repeated public handling', detail: '0.20 mm layers · weighted geometry', outcome: 'Compact displays that can be revised between campaigns' },
    ],
  },
]

export function getPrintCategory(slug?: string) {
  return printCategories.find(category => category.slug === slug)
}
