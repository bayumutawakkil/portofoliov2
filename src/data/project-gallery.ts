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
  { slug: 'atlas-of-ideas', title: 'ATLAS OF IDEAS', year: '2025', category: 'EDITORIAL SYSTEMS', image: '/bayu.jpg', position: 'center 18%', accent: 'blue' },
  { slug: 'signal-room', title: 'SIGNAL ROOM', year: '2025', category: 'DATA VISUALIZATION', image: '/architecture-cyan.jpg', position: '28% center', accent: 'cyan' },
  { slug: 'northstar', title: 'NORTHSTAR', year: '2025', category: 'PRODUCT STRATEGY', image: '/architecture-blue.jpg', position: '72% center', accent: 'violet' },
  { slug: 'common-ground', title: 'COMMON GROUND', year: '2024', category: 'CIVIC TECHNOLOGY', image: '/bg-hero.jpg', position: '72% center', accent: 'blue' },
  { slug: 'monumental', title: 'MONUMENTAL', year: '2024', category: 'DIGITAL ARCHIVE', image: '/bayu.jpg', position: 'center 72%', accent: 'cyan' },
  { slug: 'field-notes', title: 'FIELD NOTES', year: '2023', category: 'RESEARCH TOOL', image: '/architecture-cyan.jpg', position: '72% center', accent: 'violet' },
  { slug: 'afterlight', title: 'AFTERLIGHT', year: '2023', category: 'INTERFACE DESIGN', image: '/architecture-blue.jpg', position: '28% center', accent: 'blue' },
];
