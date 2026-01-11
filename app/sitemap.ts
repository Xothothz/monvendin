import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { agenda, associations, demarches } from "@/lib/data";
import { siteNav, siteUtilities } from "@/lib/site-nav";

const baseUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://monvendin.fr").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseStaticRoutes = [
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
    "/vendin-les-bethune",
    "/structure-du-site"
  ];
  const navRoutes = siteNav.flatMap((item) => {
    const sectionLinks = item.sections.flatMap((section) =>
      section.links
        .filter((link) => !link.external && !link.adminOnly)
        .map((link) => link.href)
    );
    return [item.href, ...sectionLinks];
  });
  const utilityRoutes = siteUtilities.map((item) => item.href);
  const extraRoutes = [
    "/ma-ville/commissions",
    "/ma-ville/ordres-du-jour",
    "/ma-ville/ville-nature",
    "/tourisme/infos-pratiques"
  ];

  const normalizeRoute = (route: string) => (route === "/" ? "" : route);
  const staticRoutes = Array.from(
    new Set(
      [...baseStaticRoutes, ...navRoutes, ...utilityRoutes, ...extraRoutes].map(normalizeRoute)
    )
  ).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  let actualiteRoutes: MetadataRoute.Sitemap = [];
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
      .filter((item) => Boolean(item.slug))
      .map((item) => ({
        url: `${baseUrl}/actualites/${item.slug}`,
        lastModified: new Date(item.updatedAt ?? item.date ?? item.createdAt ?? Date.now())
      }));
  } catch {
    actualiteRoutes = [];
  }

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "events",
      depth: 0,
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    eventRoutes = (response.docs ?? [])
      .filter((item) => Boolean(item.slug))
      .map((item) => ({
        url: `${baseUrl}/agenda/${item.slug}`,
        lastModified: new Date(
          item.updatedAt ?? item.endDate ?? item.startDate ?? item.createdAt ?? Date.now()
        )
      }));
  } catch {
    eventRoutes = agenda.map((item) => ({
      url: `${baseUrl}/agenda/${item.slug}`,
      lastModified: new Date()
    }));
  }

  const dynamicRoutes = [
    ...actualiteRoutes,
    ...eventRoutes,
    ...demarches.map((item) => ({
      url: `${baseUrl}/demarches/${item.slug}`,
      lastModified: new Date()
    })),
    ...associations.map((item) => ({
      url: `${baseUrl}/associations/${item.slug}`,
      lastModified: new Date()
    }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
