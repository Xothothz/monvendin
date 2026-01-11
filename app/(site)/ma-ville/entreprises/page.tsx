import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { AnnuaireTable } from "@/components/AnnuaireTable";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Annuaire des entreprises a Vendin-les-Bethune",
  description:
    "Annuaire des entreprises et services locaux a Vendin-les-Bethune. Coordonnees, activites et contacts utiles."
};

export default async function EntreprisesPage() {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "annuaire",
    depth: 0,
    page: 1,
    limit: 10,
      sort: "denomination"
  });
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://monvendin.fr"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ma ville",
        item: "https://monvendin.fr/ma-ville"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Annuaire des entreprises",
        item: "https://monvendin.fr/ma-ville/entreprises"
      }
    ]
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Annuaire des entreprises a Vendin-les-Bethune",
    description:
      "Annuaire des entreprises, artisans et services locaux a Vendin-les-Bethune.",
    url: "https://monvendin.fr/ma-ville/entreprises",
    isPartOf: {
      "@type": "WebSite",
      name: "monvendin.fr",
      url: "https://monvendin.fr"
    },
    about: {
      "@type": "Place",
      name: "Vendin-les-Bethune",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Vendin-les-Bethune",
        postalCode: "62232",
        addressCountry: "FR"
      }
    }
  };

  return (
    <div className="space-y-8 section-stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CenteredPageHeader
        label="Economie"
        title="Annuaire des entreprises"
        description="Consultez les entreprises et services locaux a Vendin-les-Bethune. Les mises a jour sont faites directement sur cette page par l'administration."
      />
      <p className="text-sm text-slate max-w-3xl">
        Annuaire local des entreprises, artisans et services de Vendin-les-Bethune. Utilisez la
        recherche et les filtres pour trouver un commerce ou un service pres de chez vous.
      </p>
      <nav
        aria-label="Liens utiles"
        className="flex flex-wrap items-center gap-2 text-xs text-slate/80"
      >
        <Link href="/vendin-les-bethune" className="no-link-underline hover:text-ink">
          Vendin-les-Bethune
        </Link>
        <span className="text-ink/20">|</span>
        <Link href="/ma-ville" className="no-link-underline hover:text-ink">
          Ma ville
        </Link>
        <span className="text-ink/20">|</span>
        <Link href="/vie-pratique" className="no-link-underline hover:text-ink">
          Vie pratique
        </Link>
        <span className="text-ink/20">|</span>
        <Link href="/nous-contacter" className="no-link-underline hover:text-ink">
          Contact
        </Link>
      </nav>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <AnnuaireTable
            initialData={{
              docs: result.docs,
              totalDocs: result.totalDocs,
              totalPages: result.totalPages,
              page: result.page ?? 1,
              limit: result.limit ?? 20
            }}
          />
        </div>
      </div>
    </div>
  );
}
