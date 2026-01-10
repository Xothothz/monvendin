import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Ma ville Vendin-les-Bethune",
  description: "Informations institutionnelles et vie municipale de Vendin-les-Bethune."
};

const sections = [
  {
    title: "Institution",
    items: [
      { label: "Conseil municipal", href: "/ma-ville/conseil-municipal" },
      { label: "Delegues de quartier", href: "/ma-ville/delegues-quartier" },
      { label: "Quelques chiffres", href: "/ma-ville/chiffres" },
      { label: "Fiscalite et budget", href: "/ma-ville/fiscalite" }
    ]
  },
  {
    title: "Se reperer",
    items: [
      { label: "Plan et quartiers", href: "/ma-ville/plan-quartiers" },
      { label: "Ville nature", href: "/ma-ville/ville-nature" }
    ]
  }
];

export default function MaVillePage() {
  return (
    <div className="space-y-8 section-stack">
      <header className="space-y-3">
        <PageTitle title="Ma ville" />
        <p className="text-slate max-w-2xl">
          Informations institutionnelles et vie municipale de Vendin-les-Bethune (Pas-de-Calais, 62).
        </p>
        <p className="text-sm text-slate max-w-2xl">
          Pour une vue d'ensemble de la commune, consultez{" "}
          <Link href="/vendin-les-bethune" className="text-accent no-link-underline">
            Vendin-les-Bethune
          </Link>
          .
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title} className="p-6 space-y-4">
            <h2 className="text-lg font-display text-ink">{section.title}</h2>
            <ul className="space-y-2 text-sm text-ink/80">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-3 py-2 hover:bg-goldSoft/70"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
