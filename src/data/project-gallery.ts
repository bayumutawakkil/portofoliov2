import { getCollection, type CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

/**
 * Single source of truth: reads all projects from src/content/projects/*.md
 * ordered by frontmatter `order` ascending.
 */
export async function getOrderedProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return entries.sort((a, b) => a.data.order - b.data.order);
}
