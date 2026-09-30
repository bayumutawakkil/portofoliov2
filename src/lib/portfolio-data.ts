import { defineQuery } from "groq";
import { sanityClient } from "./sanity";

export type CreativeProject = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  stack?: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
};

export type CreativeProfile = {
  name: string;
  role: string;
  shortBio?: string;
  socialLinks?: { _key: string; platform: string; url: string }[];
};

const CREATIVE_PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]
  | order(featured desc, sortOrder asc, title asc) {
    _id, title, "slug": slug.current, "summary": coalesce(description, summary),
    "stack": coalesce(techStack, stack), githubUrl, liveUrl, featured
  }
`);

export async function getCreativeProjects(): Promise<CreativeProject[]> {
  return sanityClient.fetch(CREATIVE_PROJECTS_QUERY);
}

const PROFILE_QUERY = defineQuery(`
  *[_type == "profile"][0]{
    name, role, shortBio, socialLinks[]{_key, platform, url}
  }
`);

export async function getCreativeProfile(): Promise<CreativeProfile | null> {
  return sanityClient.fetch(PROFILE_QUERY);
}
