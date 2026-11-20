/**
 * The home page's content model, the founder stages, and the starter items
 * shown in a section until an admin posts the first item there.
 *
 * Real items are posted from the admin panel (Home page section) and stored
 * in the Firestore `homeContent` collection. See src/lib/homeData.ts.
 */

export type HomeKind = 'video' | 'opportunity' | 'guide' | 'story' | 'event' | 'scene';

export type StageKey = 'idea' | 'register' | 'build' | 'customers' | 'funding' | 'grow';

export type SceneGroup = 'hubs' | 'programmes' | 'funders' | 'government' | 'universities' | 'communities';

/**
 * One piece of home page content. Every kind uses title and url; the other
 * fields are used by some kinds and left empty by the rest.
 */
export interface HomeItem {
  id: string;
  kind: HomeKind;
  title: string;
  /** Where the item links: the video, article, application page or event page. */
  url: string;
  /** Video: who published it, e.g. Techzim. */
  source: string;
  /** Video and guide: the subject, e.g. Payments. */
  topic: string;
  /** Video: running time, e.g. 12:30. */
  duration: string;
  /** Video: a short written summary, for people saving data. */
  summary: string;
  /** Video and guide: the stage it belongs to in "Start here", or ''. */
  stage: StageKey | '';
  /** Opportunity: Grant, Competition, Accelerator, Hackathon, Fellowship. Event: Meetup, Pitch night… */
  type: string;
  /** Opportunity: who runs it. */
  organiser: string;
  /** Opportunity: what it's worth, e.g. Up to US$10,000. */
  value: string;
  /** Opportunity: who can apply. */
  forWho: string;
  /** Opportunity: closing date. Event: event date. Guide and story: published. YYYY-MM-DD. */
  date: string;
  /** Story: founder's name and startup. */
  founder: string;
  startup: string;
  /** Story: one line in the founder's words. */
  quote: string;
  /** Story: success or lesson (from a shutdown or a hard year). */
  storyType: 'success' | 'lesson' | '';
  /** Guide and story: reading time in minutes. */
  minutes: number;
  /** Event: town. */
  town: string;
  /** Who's who: which group it belongs to. */
  group: SceneGroup | '';
  /** Who's who: one line about what they do. */
  description: string;
  createdAt: string;
}

export const HOME_KINDS: { key: HomeKind; label: string; singular: string }[] = [
  { key: 'video', label: 'Videos', singular: 'video' },
  { key: 'opportunity', label: 'Opportunities', singular: 'opportunity' },
  { key: 'guide', label: 'Guides', singular: 'guide' },
  { key: 'story', label: 'Founder stories', singular: 'story' },
  { key: 'event', label: 'Events', singular: 'event' },
  { key: 'scene', label: "Who's who", singular: 'entry' },
];

/** The kinds the home page shows right now. The others can still be posted and are kept for later. */
export const HOME_VISIBLE_KINDS: HomeKind[] = ['video', 'guide'];

export const OPPORTUNITY_TYPES = ['Grant', 'Competition', 'Accelerator', 'Hackathon', 'Fellowship', 'Other'];
export const EVENT_TYPES = ['Meetup', 'Pitch night', 'Workshop', 'Hackathon', 'Demo day', 'Conference', 'Other'];

export const SCENE_GROUPS: { key: SceneGroup; label: string }[] = [
  { key: 'hubs', label: 'Hubs and co-working spaces' },
  { key: 'programmes', label: 'Incubators and accelerators' },
  { key: 'funders', label: 'Investors and grant-makers' },
  { key: 'government', label: 'Government and regulators' },
  { key: 'universities', label: 'University programmes' },
  { key: 'communities', label: 'Communities' },
];

export interface Stage {
  key: StageKey;
  label: string;
  question: string;
  summary: string;
  /** Always shown with this stage, after any videos and guides posted for it. */
  tool: { title: string; href: string };
}

export const STAGES: Stage[] = [
  {
    key: 'idea',
    label: 'Idea',
    question: 'Is the idea worth building?',
    summary: 'Talk to ten people who have the problem before you build anything. If none of them would pay to fix it, change the idea.',
    tool: { title: 'Find a co-founder in the Talent Directory', href: '/tools/talent' },
  },
  {
    key: 'register',
    label: 'Register',
    question: 'What do I register, and when?',
    summary: 'Registering a company and for tax opens doors to banks, tenders and investors. Some sectors also need a licence before you launch.',
    tool: { title: 'Check which licences your idea needs', href: '/tools/regulations' },
  },
  {
    key: 'build',
    label: 'Build',
    question: 'How do I build it on a small budget?',
    summary: 'Build the smallest version that solves the problem, and take payments from the first day.',
    tool: { title: 'Find a workspace with power and internet', href: '/tools/spaces' },
  },
  {
    key: 'customers',
    label: 'First customers',
    question: 'Where do the first customers come from?',
    summary: 'Usually from people you can reach directly: WhatsApp groups, communities, past employers and partners.',
    tool: { title: 'List your startup on Techzim Startups', href: '/submit' },
  },
  {
    key: 'funding',
    label: 'Funding',
    question: 'Where does early money come from?',
    summary: 'Most early Zimbabwean startups are funded by grants, competitions and accelerators before any investor.',
    tool: { title: 'See opportunities closing soon', href: '#opportunities' },
  },
  {
    key: 'grow',
    label: 'Grow',
    question: 'How do I grow past the first market?',
    summary: 'Hiring well, getting paid from abroad and choosing the next market decide how far you go.',
    tool: { title: 'Hire from the Talent Directory', href: '/tools/talent' },
  },
];

/* ─── Starter content ─────────────────────────────────────────
 * Real Techzim articles and videos, current opportunities and events, and
 * the organisations founders deal with, researched in November 2026. A
 * section shows these until an admin posts its first item there. Video
 * lengths and summaries are left empty because they couldn't be checked.
 * Opportunities and events drop off after their dates. */

function item(id: string, kind: HomeKind, title: string, extra: Partial<HomeItem>): HomeItem {
  return {
    id: `starter-${id}`,
    kind,
    title,
    url: '',
    source: '',
    topic: '',
    duration: '',
    summary: '',
    stage: '',
    type: '',
    organiser: '',
    value: '',
    forWho: '',
    date: '',
    founder: '',
    startup: '',
    quote: '',
    storyType: '',
    minutes: 0,
    town: '',
    group: '',
    description: '',
    createdAt: '',
    ...extra,
  };
}

export function starterItems(): HomeItem[] {
  return [
    /* Videos */
    item('v1', 'video', 'Victor Chaitezvi: Fireside chat on entrepreneurship & investment in the African tech ecosystem', { url: 'https://www.youtube.com/watch?v=4ok1e8aGqtI', source: 'Techzim', topic: 'Funding', stage: 'funding' }),
    item('v2', 'video', 'MINT: Building Zimbabwe’s Startup Ecosystem: From Ideas To Investment', { url: 'https://www.youtube.com/watch?v=yU4RBWkEvEo', source: 'ZTNPRIME', topic: 'Ecosystem' }),
    item('v3', 'video', 'Garth Drummond fireside chat: Running a successful online business in Zim', { url: 'https://www.youtube.com/watch?v=ybTcWs902Zk', source: 'Techzim', topic: 'Founder story', stage: 'customers' }),
    item('v4', 'video', 'EcoCash Scams, Digital Tax Confusion & Zim Tech in 2026', { url: 'https://www.youtube.com/watch?v=Az3KSfON0L4', source: 'Techzim', topic: 'Payments and tax', stage: 'build' }),
    item('v5', 'video', 'EcoCash Scam Explained: How Wallets Are Being Taken Over', { url: 'https://www.youtube.com/watch?v=Zpy6b2WM5L4', source: 'Techzim', topic: 'Security' }),
    item('v6', 'video', 'Zimbabwe’s ISP Battle: SmartBiz vs Dolphin Tech', { url: 'https://www.youtube.com/watch?v=ygFwkpdePtY', source: 'Techzim', topic: 'Connectivity' }),
    item('v7', 'video', 'Online Doctors Africa launches: Healthcare on credit and a digital doctor directory in Zim', { url: 'https://www.youtube.com/shorts/t1lCkJPMoSg', source: 'Techzim', topic: 'Startup launch' }),

    /* Opportunities */
    item('o1', 'opportunity', 'Hello Tomorrow Global Challenge', { type: 'Competition', organiser: 'Hello Tomorrow', value: '€200,000 investment for the winner', forWho: 'Deep-tech startups anywhere, teams of two or more', date: '2026-11-30', url: 'https://apply.hello-tomorrow.org/' }),
    item('o2', 'opportunity', 'AI Founder Sprint 2027', { type: 'Accelerator', organiser: 'INSEAD AI Venture Lab', value: 'Free 10-week virtual programme, no equity', forWho: 'Early-stage founders aged 18 and over', date: '2026-12-01', url: 'https://venture-lab.ai/apply/founder' }),
    item('o3', 'opportunity', 'Founder Institute South Africa 2027 (virtual)', { type: 'Accelerator', organiser: 'Founder Institute', value: 'Pre-seed programme, US$599 to apply', forWho: 'Pre-seed founders; check eligibility for Zimbabwe', date: '2026-12-15', url: 'https://fi.co/join' }),

    /* Guides */
    item('g1', 'guide', 'Here is why Zimbabwean startups struggle to raise capital from international investors', { url: 'https://www.techzim.co.zw/2024/01/why-zim-startups-struggle-to-raise-capital-from-international-investors/', topic: 'Funding', minutes: 5, stage: 'funding', date: '2024-01-18' }),
    item('g2', 'guide', 'What the 2027 budget means for tech', { url: 'https://www.techzim.co.zw/2026/11/what-the-2027-budget-means-for-tech/', topic: 'Tax and policy', minutes: 2, date: '2026-11-19' }),
    item('g3', 'guide', 'ZB launches “free-to-use” payment gateway', { url: 'https://www.techzim.co.zw/2025/05/zb-launches-payment-gateway/', topic: 'Payments', minutes: 3, stage: 'build', date: '2025-05-16' }),
    item('g4', 'guide', 'Zimbabwe Data Protection Act: summary, guide and downloads', { url: 'https://www.techzim.co.zw/zimbabwe-cyber-and-data-protection-act/', topic: 'Data protection', minutes: 2, stage: 'register', date: '2024-11-26' }),
    item('g5', 'guide', 'Wait… so we could receive money via PayPal in Zim all along?!', { url: 'https://www.techzim.co.zw/2021/05/wait-so-we-could-receive-money-via-paypal-in-zim-all-along/', topic: 'Getting paid from abroad', minutes: 3, stage: 'grow', date: '2021-05-07' }),
    item('g6', 'guide', 'Here’s how to get your tax clearance online in Zimbabwe', { url: 'https://www.techzim.co.zw/2019/01/heres-how-to-get-your-tax-clearance-online-in-zimbabwe/', topic: 'Tax', minutes: 3, stage: 'register', date: '2019-01-08' }),
    item('g7', 'guide', 'Check out ZIMRA’s tax credit for employing under-30s', { url: 'https://www.techzim.co.zw/2022/01/check-out-zimras-180000-a-year-tax-credit-for-employing-under-30s/', topic: 'Hiring', minutes: 2, stage: 'grow', date: '2022-01-04' }),
    item('g8', 'guide', 'The step-by-step process for registering your startup as a private business corporation', { url: 'https://www.techzim.co.zw/2016/08/heres-step-step-process-registering-startup-private-business-corporation/', topic: 'Registering', minutes: 2, stage: 'register', date: '2016-08-12' }),

    /* Founder stories */
    item('s1', 'story', 'This Zimbabwean/Zambian startup was accepted into Y Combinator', { url: 'https://www.techzim.co.zw/2024/02/zimbabwean-zambian-startup-accepted-into-y-combinator-prestigious-amreican-accelerator/', founder: 'Louis Murerwa and Michael Moyo', startup: 'Ocular AI', quote: 'At Google and Microsoft, it was very difficult to know what was happening, when, where and how it affected other teams.', storyType: 'success', date: '2024-02-22' }),
    item('s2', 'story', 'This startup made ZIMRA fiscalisation painless, for $10 a month', { url: 'https://www.techzim.co.zw/2025/05/this-startup-just-made-zimra-fiscalisation-painless-and-for-only-10-a-month/', founder: 'Thamsanqa Bhala', startup: 'RoundIHMP', quote: 'We’d like to offload some of the work like customer acquisition to others like Accountants.', storyType: 'success', date: '2025-05-05' }),
    item('s3', 'story', 'Why Tengesa failed: a startup founder shares with us', { url: 'https://techzim.co.zw/2013/06/why-tengesa-failed-startup-founder-shares-with-us', founder: 'Colin Pringlewood', startup: 'Tengesa', quote: 'So don’t give up your day job.', storyType: 'lesson', date: '2013-06-18' }),

    /* Events */
    item('e1', 'event', 'ZCICT 2026: Zimbabwe Conference on ICT', { type: 'Conference', town: 'Harare', date: '2026-11-26', url: 'https://zcict.co.zw/' }),
    item('e2', 'event', 'Computer Society of Zimbabwe annual ICT cocktail', { type: 'Networking', town: 'Harare', date: '2026-11-27', url: 'https://discoverzim.com/events/csz-annual-ict-cocktail-c4115491-fc5c-4739-be45-47c60e205f18' }),
    item('e3', 'event', 'Next Africa EBL Conference, Zimbabwe edition', { type: 'Conference', town: 'Harare', date: '2027-07-06', url: 'https://ebl.thenextafrica.com/' }),

    /* Who's who */
    item('c1', 'scene', 'Tech Hub Harare', { group: 'hubs', description: 'Co-working, incubation and pitch nights.', url: 'https://cowork.co.zw/' }),
    item('c2', 'scene', 'Eight2Five Innovation Hub', { group: 'hubs', description: 'Old Mutual-backed hub running the Value Creation Challenge.', url: 'http://www.eight2five.co.zw' }),
    item('c3', 'scene', 'Founder Institute', { group: 'programmes', description: 'Pre-seed accelerator; Zimbabwe joins the virtual South Africa chapter.', url: 'https://fi.co/zimbabwe' }),
    item('c4', 'scene', 'Tech Hub Harare Angels', { group: 'funders', description: 'Angel investor network that backs early-stage startups.', url: 'https://cowork.co.zw/Angels/' }),
    item('c5', 'scene', 'ZIMRA', { group: 'government', description: 'Tax registration, VAT, PAYE and tax clearance.', url: 'https://www.zimra.co.zw/domestic-taxes/corporate/new-businesses' }),
    item('c6', 'scene', 'ZIDA', { group: 'government', description: 'Investment licences and help setting up a business.', url: 'http://www.zidainvest.com/' }),
    item('c7', 'scene', 'POTRAZ', { group: 'government', description: 'Telecoms regulator and data protection authority.', url: 'http://www.potraz.gov.zw' }),
    item('c8', 'scene', 'UZ Innovation Hub', { group: 'universities', description: 'University of Zimbabwe spin-offs and IP.', url: 'https://www.uz.ac.zw/index.php/innov-hub' }),
    item('c9', 'scene', 'NUST Innovation Hub', { group: 'universities', description: 'Start-up support and technology licensing in Bulawayo.', url: 'https://www.nust.ac.zw/index.php/home/vice-chancellors-office/innovation-hub.html' }),
    item('c10', 'scene', 'GDG Harare', { group: 'communities', description: 'Google Developer Group; runs DevFest every year.', url: 'https://gdg.community.dev/gdg-harare/' }),
  ];
}
