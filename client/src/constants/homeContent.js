export const contactLink = { label: 'Contact', path: '/contact', icon: 'MessageCircle' };

export const primaryNavLinks = [
  { label: 'Home', path: '/', icon: 'Home' },
  { label: 'Shop', path: '/shop', icon: 'ShoppingBag' },
];

export const navLinks = [...primaryNavLinks, contactLink];

export const learnDropdown = {
  label: 'Learn',
  items: [
    {
      label: 'Solar Buying Guide',
      path: '/learn/solar-buying-guide',
      description: 'Choose the right solar system for your needs',
    },
  ],
};

export const subsidyDropdown = {
  label: 'Subsidy',
  items: [
    {
      label: 'Subsidy Products',
      path: '/subsidy/products',
      description: 'Explore solar products eligible for government subsidies',
    },
    {
      label: 'PM Surya Ghar Yojana',
      path: '/subsidy/pm-surya-ghar',
      description: 'Residential rooftop solar subsidy scheme',
    },
  ],
};

export const navDropdowns = [learnDropdown, subsidyDropdown];

export const trustFeatures = [
  {
    title: 'Premium Solar Panels',
    description:
      'High-efficiency panels engineered for long-lasting performance and maximum energy output.',
    icon: 'Sun',
  },
  {
    title: 'Solar Inverters',
    description:
      'Reliable string and hybrid inverters for residential, commercial and industrial applications.',
    icon: 'Zap',
  },
  {
    title: 'Solar Batteries',
    description:
      'Advanced storage solutions for backup power, load shifting and energy independence.',
    icon: 'BatteryCharging',
  },
  {
    title: 'Complete Solar Solutions',
    description:
      'End-to-end system design, products and support for every scale of solar installation.',
    icon: 'Layers',
  },
];

export const whyChooseBenefits = [
  {
    title: 'High Quality Solar Products',
    description: 'Certified products from trusted manufacturers with proven durability.',
    icon: 'Award',
  },
  {
    title: 'Trusted Solar Solutions',
    description: 'Solutions built for Indian conditions with dependable long-term results.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Expert Technical Support',
    description: 'Guidance from experienced solar professionals at every stage.',
    icon: 'Headphones',
  },
  {
    title: 'Reliable Performance',
    description: 'Systems designed for consistent generation and operational efficiency.',
    icon: 'TrendingUp',
  },
  {
    title: 'Competitive Pricing',
    description: 'Premium quality solar products at transparent and competitive rates.',
    icon: 'IndianRupee',
  },
  {
    title: 'Professional Installation Support',
    description: 'Structured installation assistance for safe and compliant deployments.',
    icon: 'Wrench',
  },
];

export const learnCards = [
  {
    title: 'Solar Buying Guide',
    path: '/learn/solar-buying-guide',
    description:
      'Learn how to evaluate capacity, budget and product quality before buying solar.',
    icon: 'BookOpen',
  },
];

export const corporateOffice = {
  name: 'HANS SOLAR',
  address:
    '1st Floor, Balaji Complex, Near Purana Roadways Bus Stand, Bulandshahr - 203001, Uttar Pradesh',
  formattedLines: [
    '☀️ HANS SOLAR ♻️',
    '1st Floor, Balaji Complex,',
    'Near Purana Roadways Bus Stand,',
    'Bulandshahr 203001, UP 🇮🇳',
    'Bulandshahr, Uttar Pradesh 203001',
  ],
  mapsQuery:
    'HANS SOLAR, 1st Floor, Balaji Complex, Near Purana Roadways Bus Stand, Bulandshahr 203001, Uttar Pradesh',
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=HANS+SOLAR%2C+1st+Floor%2C+Balaji+Complex%2C+Near+Purana+Roadways+Bus+Stand%2C+Bulandshahr+203001%2C+Uttar+Pradesh',
  embedUrl:
    'https://www.google.com/maps?q=HANS+SOLAR%2C+1st+Floor%2C+Balaji+Complex%2C+Near+Purana+Roadways+Bus+Stand%2C+Bulandshahr+203001%2C+Uttar+Pradesh&output=embed',
};

export const contactInfo = {
  email: 'hanssolarenergy@gmail.com',
  phone: '9358622621',
  phoneDisplay: '+91 93586 22621',
  phoneNumbers: [
    { phone: '9358622621', display: '+91 93586 22621' },
    { phone: '9058936186', display: '+91 90589 36186' },
    { phone: '9058951234', display: '+91 90589 51234' },
  ],
};

export const aboutUsVideo = {
  youtubeId: 'A-RxdvNk2cE',
  url: 'https://youtu.be/A-RxdvNk2cE?si=j7wKNYcN7dcMYfhi',
  title: 'HANS Solar company overview',
  channelUrl: 'https://www.youtube.com/@Gajendra_Singh_Rana',
  sectionTitle: 'Watch HANS SOLAR in Action',
  sectionDescription:
    'Explore our solar installations, customer experiences, product insights and useful solar guidance.',
  ctaLabel: 'Watch on YouTube',
};

export const aboutUsContent = {
  title: 'About Us',
  paragraphs: [
    'HANS Solar is a trusted solar energy partner delivering premium panels, inverters, batteries and complete system solutions for homes, businesses and industries.',
    'From our corporate office in Bulandshahr, Uttar Pradesh, we support customers with quality products, subsidy guidance and professional installation assistance. Over 800 families have already benefited from eligible government solar subsidies through HANS Solar installations — helping more households switch to clean, reliable energy every day.',
  ],
};

export const installationGalleryImages = Array.from({ length: 11 }, (_, index) => {
  const localPath = `/s${index + 1}.webp`;

  return {
    src: localPath,
    alt: `HANS Solar subsidy installation ${index + 1}`,
  };
});
