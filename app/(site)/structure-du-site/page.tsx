import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";
import { siteNav } from "@/lib/site-nav";

export const metadata = {
  title: "Structure du site"
};

export default function StructureDuSitePage() {
  const filteredNav = siteNav
    .map((item) => ({
      ...item,
      sections: item.sections
        .map((section) => ({
          ...section,
          links: section.links.filter((link) => !link.adminOnly)
        }))
        .filter((section) => section.links.length > 0)
    }))
    .filter((item) => item.sections.length > 0);

  return (
    <div className="space-y-8 section-stack">
      <header className="space-y-3">
        <PageTitle title="Structure du site" watermark="Navigation" />
        <p className="text-slate max-w-2xl">
          Retrouvez l'ensemble des rubriques et sous-rubriques du site.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredNav.map((menu) => (
          <Card key={menu.href} className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-display text-ink">{menu.label}</h2>
              <Link href={menu.href} className="text-xs font-semibold text-accent">
                Voir la page
              </Link>
            </div>
            <div className="space-y-4">
              {menu.sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">
                    {section.title}
                  </p>
                  <ul className="space-y-1 text-sm text-ink/80">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target={link.newTab ? "_blank" : undefined}
                            rel={link.newTab ? "noreferrer" : undefined}
                            className="block rounded-lg px-2 py-1 hover:bg-goldSoft/70"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="block rounded-lg px-2 py-1 hover:bg-goldSoft/70"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
