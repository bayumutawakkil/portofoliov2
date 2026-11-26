export type Capability = {
  id: string;
  title: string;
  desc: string;
  tags: string;
};

export const profile = {
  name: 'Bayu Mutawakkil',
  role: 'Information Systems Student & Full-Stack / Frontend Developer',
  location: 'Padang, West Sumatra, Indonesia',
  email: 'hello@bayumutawakkil.dev',
  github: 'https://github.com/bayumutawakkil',
  linkedin: '',
  instagram: '',
  cvUrl: '',
  availability: 'Open to meaningful collaborations',
} as const;

export const capabilities: Capability[] = [
  {
    id: '01',
    title: 'Software Engineering',
    desc: 'Designing scalable, maintainable applications built around real user workflows and long-term reliability.',
    tags: 'Web Development / API / Architecture',
  },
  {
    id: '02',
    title: 'Information Systems',
    desc: 'Translating business processes into structured system flows, data models, and practical digital solutions.',
    tags: 'Business Process / Database / Analysis',
  },
  {
    id: '03',
    title: 'Data & Intelligence',
    desc: 'Exploring data pipelines and machine learning to surface clear, actionable operational insights.',
    tags: 'Python / Analytics / Machine Learning',
  },
  {
    id: '04',
    title: 'Interface Engineering',
    desc: 'Crafting clear, accessible, and responsive interfaces with considered interaction details.',
    tags: 'UI Engineering / Interaction / UX',
  },
];

export const experience = [
  {
    period: 'CURRENT',
    title: 'Information Systems Student',
    organization: 'Universitas Andalas',
    detail: 'Studying how technology, business processes, data, and organizations operate as one connected system.',
  },
  {
    period: 'ONGOING',
    title: 'Software Development Practice',
    organization: 'Personal & academic projects',
    detail: 'Building web applications, information systems, data analytics tools, and interface engineering from real-world problems.',
  },
  {
    period: '2025',
    title: 'Systems & Process Exploration',
    organization: 'Campus initiatives',
    detail: 'Translating operational needs into structured workflows, relational data models, and maintainable software architecture.',
  },
  {
    period: 'EXPLORING',
    title: 'Data & Interface Engineering',
    organization: 'Independent learning',
    detail: 'Deepening expertise in machine learning, insight visualization, and interaction design for clear digital products.',
  },
] as const;
