import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { agenda, associations, demarches } from "@/lib/data";

const baseUrl = "https://vendin-citoyen.local";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/actualites",
    "/agenda",
    "/demarches",
    "/associations",
    "/vie-municipale",
    "/enfance-scolaire",
    "/menus-cantine",
    "/vie-pratique",
    "/contact",
    "/a-propos",
    "/recherche",
    "/structure-du-site"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  let actualiteRoutes: string[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "actualites",
      depth: 0,
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    actualiteRoutes = (response.docs ?? [])
      .map((item) => `/actualites/${item.slug}`)
      .filter(Boolean);
  } catch {
    actualiteRoutes = [];
  }

  const dynamicRoutes = [
    ...actualiteRoutes,
    ...agenda.map((item) => `/agenda/${item.slug}`),
    ...demarches.map((item) => `/demarches/${item.slug}`),
    ...associations.map((item) => `/associations/${item.slug}`)
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
