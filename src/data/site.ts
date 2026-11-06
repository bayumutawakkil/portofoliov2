export type ProjectAccent = 'blue' | 'cyan' | 'violet';

export type SiteProject = {
  number: string;
  category: string;
  title: string;
  description: string;
  stack: string[];
  status: string;
  year: string;
  accent: ProjectAccent;
  slug: string;
  href: string;
};

export type Capability = {
  id: string;
  title: string;
  desc: string;
  tags: string;
};

export const profile = {
  name: 'Bayu Mutawakkil',
  role: 'Information Systems Student · Software Developer',
  location: 'Padang, Indonesia',
  email: 'hello@bayumutawakkil.dev',
  github: 'https://github.com/bayumutawakkil',
  linkedin: 'https://linkedin.com/in/bayumutawakkil',
  instagram: 'https://instagram.com/bayumutawakkil',
  availability: 'Open to meaningful collaborations',
} as const;

export const projects: SiteProject[] = [
  {
    number: '01',
    category: 'CAMPUS SYSTEM · FULL-STACK',
    title: 'SIMAS UNAND',
    description: 'Sistem informasi manajemen aktivitas dan presensi dengan validasi sesi, geofencing, unggah bukti, serta kontrol akses berbasis peran.',
    stack: ['Python', 'Flask', 'MySQL', 'Next.js'],
    status: 'IN DEVELOPMENT',
    year: '2026',
    accent: 'blue',
    slug: 'simas-unand',
    href: 'https://github.com/bayumutawakkil',
  },
  {
    number: '02',
    category: 'MACHINE LEARNING · NLP',
    title: 'MBG SENTIMENT INTELLIGENCE',
    description: 'Eksplorasi analisis sentimen terhadap program Makan Bergizi Gratis untuk membantu pemangku kebijakan membaca opini publik berbasis data.',
    stack: ['Python', 'NLP', 'Naive Bayes', 'BiLSTM'],
    status: 'RESEARCH',
    year: '2026',
    accent: 'cyan',
    slug: 'mbg-sentiment-intelligence',
    href: 'https://github.com/bayumutawakkil',
  },
  {
    number: '03',
    category: 'WEB ENGINEERING · OPEN SOURCE',
    title: 'KASTRAT DIGITAL',
    description: 'Eksplorasi pengembangan platform digital untuk mendukung dokumentasi kajian, publikasi, dan kerja kolaboratif organisasi mahasiswa.',
    stack: ['TypeScript', 'React', 'Web Architecture'],
    status: 'EXPLORATION',
    year: '2026',
    accent: 'violet',
    slug: 'kastrat-digital',
    href: 'https://github.com/bayumutawakkil',
  },
];

export const capabilities: Capability[] = [
  { id: '01', title: 'Software Engineering', desc: 'Merancang aplikasi dengan struktur yang terukur, maintainable, dan berorientasi pada kebutuhan pengguna.', tags: 'Web Development / API / Architecture' },
  { id: '02', title: 'Information Systems', desc: 'Menerjemahkan proses bisnis menjadi alur sistem, model data, dan solusi digital yang relevan.', tags: 'Business Process / Database / Analysis' },
  { id: '03', title: 'Data & Intelligence', desc: 'Mengeksplorasi data dan machine learning untuk menghasilkan insight yang dapat ditindaklanjuti.', tags: 'Python / Analytics / Machine Learning' },
  { id: '04', title: 'Interface Engineering', desc: 'Membangun antarmuka yang jelas, accessible, responsif, dan memiliki detail interaksi yang dipikirkan.', tags: 'UI Engineering / Interaction / UX' },
];

export const experience = [
  {
    period: 'CURRENT',
    title: 'Information Systems Student',
    organization: 'Universitas Andalas',
    detail: 'Mempelajari bagaimana teknologi, proses bisnis, data, dan organisasi bekerja sebagai satu sistem.',
  },
  {
    period: 'ONGOING',
    title: 'Software Development Practice',
    organization: 'Personal and academic projects',
    detail: 'Membangun dan mengeksplorasi aplikasi web, sistem informasi, analitik data, serta interface engineering.',
  },
] as const;
