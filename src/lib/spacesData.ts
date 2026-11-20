import type { Space, SpaceSource, SpaceType } from './types';

/**
 * Workspaces researched for Spaces (November 2026). Every detail comes from
 * the sources listed on the entry, and the card shows them with their date,
 * because many listings are a few years old. Nothing is guessed: a detail no
 * source states is null.
 *
 * Left out on purpose: Impact Hub Harare (the Civic Tech Field Guide says the
 * project "has been put to rest"), The HUB at Travel Plaza (only one article,
 * with estimated prices, mentions it), Shinga Hub in Mutare and Inside Out
 * Business Hub (both marked closed by Techzim in 2022). Add them back once
 * someone confirms they are open.
 */

const TECHZIM_2022: SpaceSource = {
  label: 'Techzim, Jan 2022',
  url: 'https://techzim.co.zw/2022/01/co-working-spaces-in-zimbabwe-prices-compared',
};

const coworker = (path: string): SpaceSource => ({
  label: 'coworker.com listing',
  url: `https://www.coworker.com/zimbabwe/${path}`,
});

/**
 * How many photos each space has in public/spaces: {id}.jpg, then {id}-2.jpg,
 * {id}-3.jpg and so on. Resized to at most 1200px wide.
 */
const LOCAL_PHOTOS: Record<string, number> = {
  'afrotopia': 1, 'the-business-hub': 1, 'space-station': 1, 'location47': 1,
  'the-creative-factory-hub': 1, 'kubasa': 1, 'lamar-hub': 1, 'linkspot': 1, 'the-oasis': 1,
  'the-techvillage': 1, 'mybizspace': 1, 'africa-university-i5hub': 1,
  'b2c-coworking': 2, 'cyrex-business-centre': 2, 'eight-to-five-hub': 3, 'flexiwork': 2,
  'gbi-business-hub': 1, 'moto-republik': 1, 'tech-hub-harare': 2, 'techworld-internet-cafe': 2,
};

function localPhotos(id: string): string[] {
  const count = LOCAL_PHOTOS[id] ?? 0;
  return Array.from({ length: count }, (_, i) => (i === 0 ? `/spaces/${id}.jpg` : `/spaces/${id}-${i + 1}.jpg`));
}

function space(
  id: string,
  name: string,
  town: string,
  details: Partial<Omit<Space, 'id' | 'name' | 'town'>> & { sources: SpaceSource[] },
  type: SpaceType = 'coworking',
): Space {
  return {
    id,
    name,
    town,
    type,
    area: null,
    address: null,
    offers: [],
    price: null,
    hours: null,
    phone: null,
    whatsapp: null,
    email: null,
    website: null,
    contact: null,
    photos: localPhotos(id),
    photoCredit: null,
    ...details,
  };
}

export const SEED_SPACES: Space[] = [
  /* ── Harare ── */
  space('digital-two-hub', 'Digital Two Hub', 'Harare', {
    area: 'Belgravia',
    address: 'Cecilia Business Centre, Office 35, 6 Chelmsford Road',
    offers: ['Hot desks', 'Dedicated desks', 'Private offices', 'Boardroom', 'Fast internet', 'Backup power', 'Printing', 'Parking'],
    price: 'Hot desk $10 a day · desk $150 a month · office from $400 a month',
    hours: '8am–5pm',
    phone: '+263 783 156 194',
    email: 'hello@digitaltwo.net',
    website: 'https://digitaltwo.net/digital-two-hub/',
    photos: ['https://digitaltwo.net/wp-content/uploads/2025/03/5.jpeg'],
    photoCredit: 'Digital Two website',
    sources: [
      { label: 'Digital Two website, 2026', url: 'https://digitaltwo.net/digital-two-hub/' },
      { label: 'Digital Two blog, Apr 2025', url: 'https://digitaltwo.net/8-reasons-why-co-working-spaces-in-harare-are-transforming-the-way-we-work/' },
    ],
  }),
  space('moto-republik', 'Moto Republik', 'Harare', {
    area: 'Belgravia',
    address: '3 Allan Wilson Avenue',
    offers: ['Co-working for creatives', 'Startup offices', 'Training and event space', 'Rooftop canteen'],
    phone: '+263 78 400 9241',
    sources: [
      { label: 'Pindula', url: 'https://pindula.co.zw/Moto_Republik' },
      { label: 'Music In Africa, 2026', url: 'https://www.musicinafrica.net/node/381634' },
    ],
  }),
  space('afrotopia', 'Afrotopia', 'Harare', {
    address: '1st Floor, Construction House, 110 Leopold Takawira Avenue',
    offers: ['Hot desks', 'Maker space', 'Meeting rooms', 'Café', 'Parking', 'Mentorship'],
    price: '$2 a day · from $25 a month',
    hours: '24-hour plan available',
    whatsapp: '+263 77 950 2546',
    sources: [
      TECHZIM_2022,
      { label: 'Greedy South, May 2021', url: 'https://www.greedysouth.co.zw/2021/05/a-closer-look-afrotopia-is-new-digital.html' },
    ],
  }),
  space('the-business-hub', 'The Business Hub', 'Harare', {
    address: '12 Stuart Avenue',
    offers: ['Private offices', 'Co-working', 'Fibre internet', 'Printing', 'Secretarial services'],
    price: '$8 a day · $130 a month',
    phone: '08677 102 780',
    sources: [TECHZIM_2022, coworker('harare/the-business-hub')],
  }),
  space('eight-to-five-hub', 'Eight to Five Hub', 'Harare', {
    address: 'Three Anchor House, Jason Moyo Avenue',
    offers: ['Internet', 'Power'],
    price: '$5 a day · $58 a month',
    phone: '08677 007 487',
    sources: [TECHZIM_2022],
  }),
  space('tech-hub-harare', 'Tech Hub Harare', 'Harare', {
    address: 'Shop 1, SSC Building (NSSA), cnr Sam Nujoma St & Julius Nyerere Way',
    offers: ['Internet', 'Power', 'Mentorship', 'Startup events'],
    price: '$5 a day · $40 a month',
    phone: '071 892 4393',
    sources: [TECHZIM_2022],
  }),
  space('cyrex-business-centre', 'Cyrex Business Centre', 'Harare', {
    address: '12th Floor, Joina City',
    offers: ['Reception service', 'Boardroom', 'Internet', 'Power'],
    price: '$2 an hour · $145 a month',
    phone: '077 328 6570',
    sources: [TECHZIM_2022],
  }),
  space('gbi-business-hub', 'GBI Business Hub', 'Harare', {
    address: '6th Floor, Angwa City Building, Angwa Street',
    offers: ['Internet', 'Power'],
    sources: [TECHZIM_2022],
  }),
  space('b2c-coworking', 'B2C Coworking', 'Harare', {
    address: 'Batanai Gardens, cnr Jason Moyo Avenue & First Street',
    offers: ['Co-working', 'Incubation and acceleration'],
    sources: [TECHZIM_2022, coworker('harare/b2c-coworking/review')],
  }),
  space('space-station', 'Space Station (Karimapondo)', 'Harare', {
    address: '1st Floor, 78 Leopold Takawira Street',
    offers: ['WiFi', 'Printing', 'Standing desks', 'Lounge', 'Tea room'],
    price: 'From $10 a day',
    hours: 'Every day, 8am–5pm',
    sources: [
      coworker('harare/space-station'),
      { label: 'coworkbooking.com listing', url: 'https://www.coworkbooking.com/africa/zimbabwe/harare/karimapondo-space-station1' },
    ],
  }),
  space('location47', 'Location47', 'Harare', {
    area: 'Edge of the CBD',
    address: '47 Herbert Chitepo Avenue',
    offers: ['WiFi', 'Meeting rooms', 'Printing', 'Garden', 'Pool', 'Kitchen', 'Parking'],
    hours: 'Mon–Fri 8:30am–6:30pm · Sat–Sun 9:30am–6:30pm',
    sources: [
      coworker('harare/location47'),
      { label: 'coworkbooking.com listing', url: 'https://www.coworkbooking.com/africa/zimbabwe/harare/location47hre' },
    ],
  }),
  space('the-creative-factory-hub', 'The Creative Factory Hub', 'Harare', {
    address: '30 Saint Dominic Road',
    offers: ['WiFi', 'Standing desks', 'Printing', 'Event space', 'Kitchen', 'Parking'],
    price: 'From $20 a day',
    sources: [coworker('harare/the-creative-factory-hub')],
  }),
  space('kubasa', 'Kubasa Co-Working Space', 'Harare', {
    address: '76 Ridgeway North',
    offers: ['WiFi', 'Terrace', 'Kitchen', 'Event space', 'Restaurant', 'Printing', 'Parking'],
    sources: [coworker('harare/kubasa-co-working-space')],
  }),
  space('lamar-hub', 'Lamar Hub', 'Harare', {
    address: 'Merchant House',
    offers: ['WiFi', 'Air conditioning', 'Printing', 'Coffee and snacks'],
    price: '$5 a day · $65 a month · desk $85 a month',
    hours: '24-hour access',
    sources: [coworker('harare/lamar-hub-coworking-space')],
  }),
  space('linkspot', 'LinkSpot', 'Harare', {
    address: '63 Speke Avenue',
    offers: ['WiFi', 'Air conditioning', 'Standing desks', 'Lockers', 'Printing', 'Restaurant'],
    sources: [coworker('harare/linkspot')],
  }),
  space('techworld-internet-cafe', 'Techworld Internet Cafe', 'Harare', {
    address: 'Shop 15a, Chiyedza House, Kwame Nkrumah Avenue',
    offers: ['Internet', 'Printing'],
    hours: 'Mon–Fri 7:30am–7pm · Sat 8am–6pm',
    phone: '+263 772 924 393',
    sources: [{ label: 'Zimbabwe Yellow Pages, 2017', url: 'https://www.zimbabweyp.com/company/103530/Techworld_Internet_Cafe' }],
  }, 'cafe'),

  /* ── Bulawayo ── */
  space('bulawayo-tech-hub', 'Bulawayo Tech Hub', 'Bulawayo', {
    offers: ['Co-working', 'Incubation', 'Meeting rooms', 'Events and workshops'],
    price: '$5 a day · $75 a month',
    sources: [{ label: 'CITE, May 2024', url: 'https://cite.org.zw/bulawayo-tech-hub-open-day-connects-budding-entrepreneurs/' }],
  }),
  space('flexiwork', 'FlexiWork', 'Bulawayo', {
    area: 'City centre',
    address: 'Near the Rainbow Hotel',
    offers: ['Hot desks', 'Private desks', 'Meeting rooms', 'Zoom rooms', 'Event space', 'Garden workspace'],
    price: 'Meeting rooms from $10 an hour',
    whatsapp: 'https://wa.me/message/MRDKS2SLXVTXN1',
    website: 'https://flexiwork.co.zw/',
    sources: [{ label: 'FlexiWork website, 2026', url: 'https://flexiwork.co.zw/' }],
  }),
  space('the-oasis', 'The Oasis', 'Bulawayo', {
    address: '19 Falcon Street',
    offers: ['WiFi', 'Meeting rooms', 'Open-plan desks', 'Kitchen', 'Creative studio'],
    price: '$3 a day · $30 a month',
    phone: '078 636 5024',
    sources: [TECHZIM_2022, coworker('bulawayo/the-oasis')],
  }),
  space('the-techvillage', 'The TechVillage', 'Bulawayo', {
    address: 'First Floor, NetOne Building, Leopold Takawira Ave (between Fife St & J Moyo St)',
    offers: ['Incubation', 'WiFi', 'Phone booth', 'Event space', 'Printing', 'Terrace'],
    hours: '24-hour access',
    sources: [TECHZIM_2022, coworker('bulawayo/the-techvillage')],
  }),
  space('mybizspace', 'MybizSpace', 'Bulawayo', {
    address: 'Salamaat Heights Building',
    offers: ['WiFi', 'Air conditioning', 'Standing desks', 'Lounge', 'Printing'],
    price: 'From $7 a day',
    sources: [coworker('bulawayo/mybizspace')],
  }),
  space('clocknet-internet-cafe', 'Clocknet Internet Cafe', 'Bulawayo', {
    address: 'Shop 5, Ascot Piazza',
    offers: ['Internet', 'Printing'],
    hours: 'Mon–Fri 8am–6pm · Sat 8am–2pm',
    phone: '029 225 8967',
    sources: [{ label: 'Zimbabwe Yellow Pages, 2018', url: 'https://www.zimbabweyp.com/company/104312/Clocknet_Internet_Cafe' }],
  }, 'cafe'),

  /* ── Mutare ── */
  space('africa-university-i5hub', 'Africa University i5Hub', 'Mutare', {
    address: 'Africa University campus, about 17 km from Mutare',
    offers: ['Incubation', 'Acceleration', 'Mentorship', 'Skills seminars'],
    website: 'https://i5hub.africau.edu/',
    sources: [{ label: 'i5Hub website, 2025', url: 'https://i5hub.africau.edu/' }],
  }),
  space('bytron-internet-cafe', 'Bytron Internet Cafe', 'Mutare', {
    address: '123 Herbert Chitepo Street, Old SASU Building',
    offers: ['Internet'],
    sources: [{ label: 'Petit Futé (undated)', url: 'https://www.petitfute.co.uk/v60964-mutare/c1169-s-amuser-sortir/c182-bar-cafe/564132-bytron-internet-cafe.html' }],
  }, 'cafe'),
];
