export type GalleryProject = {
  slug: string;
  title: string;
  year: string;
  category: string;
  image: string;
  position: string;
  accent: 'blue' | 'cyan' | 'violet';
};

export const galleryProjects: GalleryProject[] = [
  { slug: 'simas-unand', title: 'SIMAS UNAND', year: '2026', category: 'CAMPUS SYSTEM', image: '/architecture-blue.jpg', position: 'center', accent: 'blue' },
  { slug: 'mbg-sentiment-intelligence', title: 'MBG SENTIMENT', year: '2026', category: 'MACHINE LEARNING', image: '/architecture-cyan.jpg', position: 'center', accent: 'cyan' },
  { slug: 'kastrat-digital', title: 'KASTRAT DIGITAL', year: '2026', category: 'WEB ENGINEERING', image: '/bg-hero.jpg', position: 'center', accent: 'violet' },
  { slug: 'simpatik', title: 'SIMPATIK', year: '2026', category: 'ACADEMIC GRADING SYSTEM', image: '/architecture-cyan.jpg', position: '20% center', accent: 'blue' },
  { slug: 'cuanku', title: 'CUANKU', year: '2026', category: 'MSME FINANCIAL PLATFORM', image: '/bg-hero.jpg', position: '72% center', accent: 'cyan' },
];
