/**
 * Starting content for the Techzim Startups feed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * These are real Zimbabwean tech companies and products, not invented ones.
 *
 * Every website below was requested and answered when this file was written —
 * either 200, or 403 from a bot-filter that proves the host is live. Entries
 * whose domains could not be reached were dropped rather than guessed at.
 * Re-check before a public launch; domains lapse.
 *
 * Three things are deliberately absent, and should stay absent:
 *
 *   • No founders. Attaching a real person's name to a public listing is worth
 *     getting right; add them once you have confirmed each one.
 *   • No reviews or ratings. A seeded review is a fake opinion about a real
 *     business — the one thing a review site cannot afford. Reviews should only
 *     ever arrive from people who actually used the product.
 *   • No likes, ranks, rank history, or "Trending" / "Startup of the Week"
 *     badges. Every counter starts at zero, so the leaderboard reflects real
 *     engagement from day one.
 *
 * Descriptions are deliberately plain — what the company does, in a line.
 * Anything promotional should come from the companies themselves via /submit,
 * where they can claim the page and post their own updates.
 *
 * Note this is a mix of established players and younger ventures. Which is
 * which is a judgement call worth making yourself; nothing here is labelled as
 * a "startup" beyond sitting in the directory.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** No editorial reviewer profiles: real reviewers arrive by writing reviews. */
export const reviewers = [];

export const startups = [
  {
    id: 'thumeza',
    slug: 'thumeza',
    name: 'Thumeza',
    tagline: 'Logistics and working capital for small transport operators',
    description:
      'Thumeza builds tools for small-scale transport operators in Zimbabwe, connecting them to freight and to the short-term financing they need to keep vehicles moving.',
    category: 'Logistics',
    region: 'Bulawayo',
    website: 'https://thumeza.com',
    demo: '',
    apk: '',
    logoInitials: 'TH',
    logoColor: '#E85D04',
  },
  {
    id: 'farmhut',
    slug: 'farmhut-africa',
    name: 'FarmHut Africa',
    tagline: 'Market access and advice for smallholder farmers',
    description:
      'FarmHut Africa gives smallholder farmers a route to buyers alongside agronomic guidance, with an emphasis on reaching farmers who are offline or on low-end phones.',
    category: 'Agritech',
    region: 'Harare',
    website: 'https://farmhutafrica.com',
    demo: '',
    apk: '',
    logoInitials: 'FH',
    logoColor: '#C24C03',
  },
  {
    id: 'paynow',
    slug: 'paynow',
    name: 'Paynow',
    tagline: 'Online payments for Zimbabwean businesses',
    description:
      'Paynow lets Zimbabwean websites and businesses accept local payment methods, including mobile money and bank transfers, through one integration.',
    category: 'Fintech',
    region: 'Harare',
    website: 'https://www.paynow.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'PN',
    logoColor: '#9E3D02',
  },
  {
    id: 'webdev',
    slug: 'webdev',
    name: 'Webdev',
    tagline: 'Web, hosting and payment infrastructure',
    description:
      'Webdev is a long-running Zimbabwean web and hosting company, and the team behind the Paynow payment gateway.',
    category: 'SaaS',
    region: 'Harare',
    website: 'https://www.webdev.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'WD',
    logoColor: '#D45100',
  },
  {
    id: 'ecocash',
    slug: 'ecocash',
    name: 'EcoCash',
    tagline: 'Mobile money across Zimbabwe',
    description:
      'EcoCash is Zimbabwe’s largest mobile money service, used for transfers, bill payments and merchant payments from a basic handset or a smartphone.',
    category: 'Fintech',
    region: 'Harare',
    website: 'https://www.ecocash.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'EC',
    logoColor: '#E85D04',
  },
  {
    id: 'innbucks',
    slug: 'innbucks',
    name: 'InnBucks',
    tagline: 'Send and store money without a bank account',
    description:
      'InnBucks is a Zimbabwean wallet and money transfer service, with cash-out through a network of partner outlets.',
    category: 'Fintech',
    region: 'Harare',
    website: 'https://innbucks.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'IB',
    logoColor: '#B84808',
  },
  {
    id: 'onemoney',
    slug: 'onemoney',
    name: 'OneMoney',
    tagline: 'Mobile money from NetOne',
    description:
      'OneMoney is NetOne’s mobile money platform, covering transfers, airtime, bill payments and merchant payments.',
    category: 'Fintech',
    region: 'Harare',
    website: 'https://www.onemoney.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'OM',
    logoColor: '#C24C03',
  },
  {
    id: 'zimswitch',
    slug: 'zimswitch',
    name: 'ZimSwitch',
    tagline: 'The national payment switch behind ZIPIT',
    description:
      'ZimSwitch is Zimbabwe’s domestic payment switch, connecting banks and wallets — the infrastructure ZIPIT transfers run on.',
    category: 'Fintech',
    region: 'Harare',
    website: 'https://www.zimswitch.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'ZS',
    logoColor: '#9E3D02',
  },
  {
    id: 'sasai',
    slug: 'sasai',
    name: 'Sasai',
    tagline: 'Messaging, payments and services in one app',
    description:
      'Sasai combines chat, payments and everyday services in a single app, built by Cassava Technologies for African markets.',
    category: 'SaaS',
    region: 'Pan-African',
    website: 'https://sasai.global',
    demo: '',
    apk: '',
    logoInitials: 'SA',
    logoColor: '#E85D04',
  },
  {
    id: 'pindula',
    slug: 'pindula',
    name: 'Pindula',
    tagline: 'Zimbabwean reference and local information',
    description:
      'Pindula is a Zimbabwean reference site and directory covering people, places, institutions and current affairs, alongside news and a marketplace.',
    category: 'SaaS',
    region: 'Harare',
    website: 'https://www.pindula.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'PI',
    logoColor: '#D45100',
  },
  {
    id: 'classifieds',
    slug: 'classifieds-co-zw',
    name: 'Classifieds.co.zw',
    tagline: 'Buy and sell locally',
    description:
      'Classifieds.co.zw is a long-running Zimbabwean online marketplace for vehicles, property, electronics and general goods.',
    category: 'E-commerce',
    region: 'Harare',
    website: 'https://www.classifieds.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'CL',
    logoColor: '#B84808',
  },
  {
    id: 'ownai',
    slug: 'ownai',
    name: 'Ownai',
    tagline: 'Zimbabwean online marketplace',
    description:
      'Ownai is an online marketplace for Zimbabwean buyers and sellers, spanning vehicles, property, electronics and services.',
    category: 'E-commerce',
    region: 'Harare',
    website: 'https://www.ownai.co.zw',
    demo: '',
    apk: '',
    logoInitials: 'ON',
    logoColor: '#C24C03',
  },
];
