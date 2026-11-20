/**
 * Content for the home page, the knowledge hub for founders.
 *
 * EVERYTHING HERE IS SAMPLE CONTENT, written to show the layout. Names,
 * dates, amounts and stories are made up. Replace each list with real items
 * from Techzim and other media before launch, and remove SAMPLE_CONTENT (it
 * shows the "sample content" notice on the page).
 */

export const SAMPLE_CONTENT = true;

export type StageKey = 'idea' | 'register' | 'build' | 'customers' | 'funding' | 'grow';

export interface ResourceLink {
  kind: 'video' | 'guide' | 'tool';
  title: string;
  meta: string;
  href: string;
}

export interface Stage {
  key: StageKey;
  label: string;
  question: string;
  summary: string;
  resources: ResourceLink[];
}

export const STAGES: Stage[] = [
  {
    key: 'idea',
    label: 'Idea',
    question: 'Is my idea worth building?',
    summary:
      'Before you write code or register anything, check that people have the problem and would pay to solve it. Talk to ten potential customers this week.',
    resources: [
      { kind: 'video', title: 'Testing a startup idea without spending money', meta: 'Techzim · 12 min', href: '#videos' },
      { kind: 'guide', title: 'Ten questions to ask your first customers', meta: 'Guide · 6 min read', href: '#guides' },
      { kind: 'tool', title: 'Find a co-founder or your first hire', meta: 'Finder', href: '/tools/finder' },
    ],
  },
  {
    key: 'register',
    label: 'Register',
    question: 'What do I need to register, and when?',
    summary:
      'Registering a company and for tax brings real benefits, and some sectors need a licence before you start. Check what applies to your idea.',
    resources: [
      { kind: 'tool', title: 'Check the licences your idea needs', meta: 'Regulations', href: '/tools/regulations' },
      { kind: 'video', title: 'Registering a company in Zimbabwe, step by step', meta: 'Techzim · 15 min', href: '#videos' },
      { kind: 'guide', title: 'Private limited company or PBC?', meta: 'Guide · 5 min read', href: '#guides' },
    ],
  },
  {
    key: 'build',
    label: 'Build',
    question: 'How do I build it on a small budget?',
    summary:
      'Build the smallest version that solves the problem. Work from a co-working space with backup power, and take payments locally from day one.',
    resources: [
      { kind: 'tool', title: 'Find a workspace near you', meta: 'Spaces', href: '/tools/spaces' },
      { kind: 'guide', title: 'Taking EcoCash and card payments in your app', meta: 'Guide · 8 min read', href: '#guides' },
      { kind: 'video', title: 'Building on mobile data: tips from local developers', meta: 'Other media · 18 min', href: '#videos' },
    ],
  },
  {
    key: 'customers',
    label: 'First customers',
    question: 'How do I get my first 100 customers?',
    summary:
      'Your first customers come from people you can reach directly: WhatsApp groups, communities and partners. Learn what made them say yes.',
    resources: [
      { kind: 'video', title: 'How three Harare startups found their first users', meta: 'Techzim · 22 min', href: '#videos' },
      { kind: 'guide', title: 'Pricing in USD and ZiG', meta: 'Guide · 7 min read', href: '#guides' },
      { kind: 'tool', title: 'List your startup so people can find it', meta: 'Startups', href: '/submit' },
    ],
  },
  {
    key: 'funding',
    label: 'Funding',
    question: 'Where does early money come from?',
    summary:
      'Grants, competitions and accelerators fund most early Zimbabwean startups. Investors come later. Watch the deadlines and apply early.',
    resources: [
      { kind: 'tool', title: 'Opportunities closing soon', meta: 'Opportunities', href: '#opportunities' },
      { kind: 'video', title: 'What investors look for in a Zimbabwean startup', meta: 'Other media · 25 min', href: '#videos' },
      { kind: 'guide', title: 'Writing a grant application that gets read', meta: 'Guide · 9 min read', href: '#guides' },
    ],
  },
  {
    key: 'grow',
    label: 'Grow',
    question: 'How do I grow beyond Zimbabwe?',
    summary:
      'Growing means hiring well, getting paid from abroad and entering new markets. Learn from founders who have done it.',
    resources: [
      { kind: 'guide', title: 'Receiving payments from outside Zimbabwe', meta: 'Guide · 10 min read', href: '#guides' },
      { kind: 'video', title: 'Expanding into the region: lessons learned', meta: 'Techzim · 30 min', href: '#videos' },
      { kind: 'tool', title: 'Hire through Finder', meta: 'Finder', href: '/tools/finder' },
    ],
  },
];

export interface Opportunity {
  id: string;
  type: 'Grant' | 'Competition' | 'Accelerator' | 'Hackathon' | 'Fellowship';
  title: string;
  organiser: string;
  value: string;
  closes: string;
  daysLeft: number;
  forWho: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', type: 'Grant', title: 'Youth Innovation Grant', organiser: 'Sample Foundation', value: 'Up to US$10,000', closes: '28 Nov', daysLeft: 8, forWho: 'Founders aged 18–35' },
  { id: 'o2', type: 'Accelerator', title: 'Fintech Accelerator, Cohort 4', organiser: 'Sample Ventures', value: 'US$25,000 + mentorship', closes: '5 Dec', daysLeft: 15, forWho: 'Fintech startups with a live product' },
  { id: 'o3', type: 'Competition', title: 'National Pitch Challenge', organiser: 'Sample Hub', value: 'US$5,000 prize', closes: '12 Dec', daysLeft: 22, forWho: 'Any early-stage startup' },
  { id: 'o4', type: 'Hackathon', title: 'AgriTech Hackathon', organiser: 'Sample University', value: 'Prizes + incubation', closes: '15 Jan', daysLeft: 56, forWho: 'Student and graduate teams' },
  { id: 'o5', type: 'Fellowship', title: 'Women in Tech Fellowship', organiser: 'Sample Network', value: '6-month programme', closes: '31 Jan', daysLeft: 72, forWho: 'Women-led startups' },
];

export interface Video {
  id: string;
  title: string;
  source: string;
  duration: string;
  topic: string;
  /** A written summary is available for viewers saving data. */
  hasSummary: boolean;
  /** 0–5, picks the thumbnail colours. */
  tone: number;
}

export const VIDEOS: Video[] = [
  { id: 'v1', title: 'How to register a company in Zimbabwe in 2026', source: 'Techzim', duration: '15:20', topic: 'Registering', hasSummary: true, tone: 0 },
  { id: 'v2', title: 'Taking EcoCash payments in your app', source: 'Techzim', duration: '11:05', topic: 'Payments', hasSummary: true, tone: 1 },
  { id: 'v3', title: 'What investors want to see before they write a cheque', source: 'Other media', duration: '24:48', topic: 'Funding', hasSummary: true, tone: 2 },
  { id: 'v4', title: 'From hackathon project to paying customers', source: 'Techzim', duration: '18:12', topic: 'Founder story', hasSummary: false, tone: 3 },
  { id: 'v5', title: 'Pricing your product in USD and ZiG', source: 'Other media', duration: '9:37', topic: 'Pricing', hasSummary: true, tone: 4 },
  { id: 'v6', title: 'Hiring your first developer without overpaying', source: 'Techzim', duration: '13:50', topic: 'Hiring', hasSummary: true, tone: 5 },
  { id: 'v7', title: 'Do you need a licence? Reading the regulations', source: 'Techzim', duration: '10:24', topic: 'Registering', hasSummary: true, tone: 1 },
];

export interface SceneGroup {
  key: string;
  label: string;
  description: string;
  count: number;
  examples: string[];
}

export const SCENE: SceneGroup[] = [
  { key: 'hubs', label: 'Hubs and co-working', description: 'Places to work, meet people and join programmes.', count: 24, examples: ['Sample Hub, Harare', 'Sample Space, Bulawayo', 'Sample Lab, Mutare'] },
  { key: 'accelerators', label: 'Incubators and accelerators', description: 'Structured programmes with mentors, and sometimes money.', count: 12, examples: ['Sample Accelerator', 'Sample Incubator', 'Sample Startup Factory'] },
  { key: 'funders', label: 'Investors and grant-makers', description: 'Angels, funds, banks and foundations that back startups.', count: 18, examples: ['Sample Angels', 'Sample Capital', 'Sample Foundation'] },
  { key: 'government', label: 'Government and regulators', description: 'Who registers, licenses and supports businesses.', count: 9, examples: ['Company registry', 'Tax authority', 'Telecoms regulator'] },
  { key: 'universities', label: 'University programmes', description: 'Innovation hubs and incubators at universities.', count: 7, examples: ['Sample University Hub', 'Sample Innovation Centre'] },
  { key: 'communities', label: 'Communities and meetups', description: 'Groups where founders and developers help each other.', count: 15, examples: ['Sample Dev Community', 'Sample Founders Circle'] },
];

export interface Story {
  id: string;
  kind: 'success' | 'lesson';
  founder: string;
  startup: string;
  quote: string;
  title: string;
  minutes: number;
}

export const STORIES: Story[] = [
  { id: 's1', kind: 'success', founder: 'Sample Founder', startup: 'Sample Pay', title: 'Reaching 10,000 users with no marketing budget', quote: 'We found our first users in WhatsApp groups, one conversation at a time.', minutes: 8 },
  { id: 's2', kind: 'lesson', founder: 'Sample Founder', startup: 'Sample Logistics', title: 'Why we shut down after two years, and what we would do differently', quote: 'We built for a market that loved the idea but would not pay for it.', minutes: 11 },
  { id: 's3', kind: 'success', founder: 'Sample Founder', startup: 'Sample Agri', title: 'From a university project to a regional business', quote: 'The hackathon gave us a deadline. Our first farmers gave us a business.', minutes: 9 },
];

export interface Guide {
  id: string;
  title: string;
  topic: string;
  minutes: number;
}

export const GUIDES: Guide[] = [
  { id: 'g1', title: 'Taking EcoCash, card and bank payments', topic: 'Payments', minutes: 8 },
  { id: 'g2', title: 'Receiving money from clients outside Zimbabwe', topic: 'Payments', minutes: 10 },
  { id: 'g3', title: 'What it really costs to start: registration, internet and power', topic: 'Costs', minutes: 7 },
  { id: 'g4', title: 'Contracts and payslips for your first employees', topic: 'Hiring', minutes: 9 },
  { id: 'g5', title: 'Data protection: what your app must do', topic: 'Compliance', minutes: 6 },
  { id: 'g6', title: 'Pricing in USD and ZiG without losing money', topic: 'Pricing', minutes: 7 },
];

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  town: string;
  kind: string;
}

export const EVENTS: EventItem[] = [
  { id: 'e1', day: '27', month: 'Nov', title: 'Founders breakfast', town: 'Harare', kind: 'Meetup' },
  { id: 'e2', day: '3', month: 'Dec', title: 'Pitch night: fintech', town: 'Harare', kind: 'Pitch night' },
  { id: 'e3', day: '6', month: 'Dec', title: 'Build weekend', town: 'Bulawayo', kind: 'Hackathon' },
  { id: 'e4', day: '11', month: 'Dec', title: 'Demo day', town: 'Mutare', kind: 'Demo day' },
];
