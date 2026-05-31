import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  path: string
  schema?: Record<string, unknown>
}

const SITE_URL = 'https://kiwikoru3d.com'

function getCanonicalUrl(path: string): string {
  // Use hash-based URLs for static hosting compatibility
  return `${SITE_URL}/#${path}`
}

export default function SEO({ title, description, path, schema }: SEOProps) {
  const canonicalUrl = getCanonicalUrl(path)
  const ogImage = `${SITE_URL}/images/og-image.jpg`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="KiwiKoru 3D" />
      <meta property="og:locale" content="en_NZ" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geo Tags */}
      <meta name="geo.region" content="NZ-NTL" />
      <meta name="geo.placename" content="Whangarei" />
      <meta name="geo.position" content="-35.7251;174.3236" />
      <meta name="ICBM" content="-35.7251, 174.3236" />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}

// Pre-defined schema generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KiwiKoru 3D',
    description: 'Professional 3D printing service in Whangārei, New Zealand. Custom 3D printing, rapid prototyping, and product development.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/og-image.jpg`,
    email: 'kiwikoru3d@gmail.com',
    telephone: '+64-27-260-2954',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Morningside',
      addressRegion: 'Whangārei',
      addressCountry: 'NZ',
    },
    sameAs: ['https://wa.me/640272602954'],
    knowsAbout: [
      '3D Printing',
      'Rapid Prototyping',
      'FDM 3D Printing',
      'Custom Manufacturing',
      'Product Development',
      'CAD Design',
      'STL File Printing',
    ],
  }
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'KiwiKoru 3D',
    image: `${SITE_URL}/images/og-image.jpg`,
    url: SITE_URL,
    telephone: '+64-27-260-2954',
    email: 'kiwikoru3d@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Morningside',
      addressLocality: 'Whangārei',
      addressRegion: 'Northland',
      addressCountry: 'NZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-35.7251',
      longitude: '174.3236',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    priceRange: '$',
    paymentAccepted: 'Bank Transfer',
    currenciesAccepted: 'NZD',
    areaServed: {
      '@type': 'Country',
      name: 'New Zealand',
    },
  }
}

export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What file types do you accept?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept STL, STEP, OBJ, 3MF, PDF, JPG, and PNG files. If you have a different format or just a sketch, send it through — we can usually work with it or convert it for you.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a 3D model to get started?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not at all. While having a 3D model speeds up the process, we also offer CAD design services. Send us sketches, photos, or even a description of your idea and we can create the 3D model for you.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help design my idea from scratch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, absolutely. Our design team can take your concept — whether it\'s a sketch on a napkin or a detailed brief — and turn it into a 3D model ready for printing. We handle everything from concept to final product.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a typical project take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard prints are ready within 24-48 hours. More complex projects, design work, or larger batches may take 3-7 days. We\'ll always give you a clear timeline when you request a quote.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you ship across New Zealand?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we ship nationwide via courier. We\'re based in Morningside, Whangārei, so local customers can also arrange pickup. All shipping costs are calculated and included in your quote.',
        },
      },
      {
        '@type': 'Question',
        name: 'What materials do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We primarily print in PLA, PETG, and ASA. PLA is great for prototypes and display items. PETG offers strength and durability for functional parts. ASA is UV-resistant and ideal for outdoor applications. We can advise on the best choice for your project.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you create replacement parts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, replacement parts are one of our specialties. Whether it\'s a broken appliance clip, an automotive bracket, or a discontinued component, we can often reverse-engineer and print a perfect replacement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you develop prototypes for my product idea?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Rapid prototyping is a core service. We can produce functional prototypes for fit-testing, presentation models for stakeholders, and iterative designs to refine your product before moving to production.',
        },
      },
    ],
  }
}

export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '3D Printing Services',
    provider: {
      '@type': 'LocalBusiness',
      name: 'KiwiKoru 3D',
    },
    areaServed: {
      '@type': 'Country',
      name: 'New Zealand',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '3D Printing Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'FDM 3D Printing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rapid Prototyping' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Manufacturing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CAD File Preparation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Material Consultation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Post-Processing' } },
      ],
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
