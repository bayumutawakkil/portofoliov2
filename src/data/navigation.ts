export type NavItem = {
  /** Section id (for in-page anchors) or route slug. */
  id: string;
  label: string;
  /** Two-digit index shown in the mobile menu. */
  index: string;
  /** Absolute route (e.g. "/projects"). When set, the item is a route link. */
  href?: string;
};

/** Single source of truth for primary navigation (desktop + mobile). */
export const navigation: NavItem[] = [
  { id: 'about', label: 'About Me', index: '01' },
  { id: 'projects', label: 'Works', index: '02', href: '/projects' },
  { id: 'expertise', label: 'Expertise', index: '03' },
  { id: 'experience', label: 'Experience', index: '04' },
  { id: 'principles', label: 'Manifesto', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
];