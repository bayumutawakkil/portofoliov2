import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "1y7lg3um",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-09-29",
  // Astro builds should read the newest published content from Sanity.
  useCdn: false,
  perspective: "published",
});
