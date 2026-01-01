import { getPayload } from "payload";
import configPromise from "@payload-config";
import { OfficialsClient } from "./OfficialsClient";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Liste des elus"
};

export const dynamic = "force-dynamic";

type Official = {
  id: string;
  firstName: string;
  lastName?: string;
  role: string;
  politicalGroup?: string | null;
  group: "executive" | "council";
  order?: number | null;
  photo?: { url?: string; alt?: string } | string | null;
};

export default async function ListeDesElusPage() {
  const fallbackOfficials: Official[] = [
    {
      id: "maire-sylvie",
      firstName: "Sylvie",
      role: "Maire",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 1,
      photo: { url: "/media/officials/Maire/Sylvie_.jpg", alt: "Sylvie" }
    },
    {
      id: "adjoint-christine-saber",
      firstName: "Christine",
      lastName: "SABER",
      role: "Adjoint",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 2,
      photo: { url: "/media/officials/ADJOINT/Christine SABER.jpg", alt: "Christine SABER" }
    },
    {
      id: "adjoint-jacky-duflot",
      firstName: "Jacky",
      lastName: "DUFLOT",
      role: "Adjoint",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 3,
      photo: { url: "/media/officials/ADJOINT/Jacky DUFLOT.jpg", alt: "Jacky DUFLOT" }
    },
    {
      id: "adjoint-didier-brismail",
      firstName: "Didier",
      lastName: "BRISMAIL",
      role: "Adjoint",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 4,
      photo: { url: "/media/officials/ADJOINT/Didier BRISMAIL.jpg", alt: "Didier BRISMAIL" }
    },
    {
      id: "adjoint-monique-wrzeszcz",
      firstName: "Monique",
      lastName: "WRZESZCZ",
      role: "Adjoint",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 5,
      photo: { url: "/media/officials/ADJOINT/Monique WRZESZCZ.jpg", alt: "Monique WRZESZCZ" }
    },
    {
      id: "adjoint-patrice-florczyk",
      firstName: "Patrice",
      lastName: "FLORCZYK",
      role: "Adjoint",
      politicalGroup: "Liste municipale",
      group: "executive",
      order: 6,
      photo: { url: "/media/officials/ADJOINT/Patrice FLORCZYK.jpg", alt: "Patrice FLORCZYK" }
    },
    {
      id: "conseiller-catherine-nieuwjaer",
      firstName: "Catherine",
      lastName: "NIEUWJAER",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 10,
      photo: { url: "/media/officials/Conseillers/Catherine NIEUWJAER.jpg", alt: "Catherine NIEUWJAER" }
    },
    {
      id: "conseiller-christophe-fardel",
      firstName: "Christophe",
      lastName: "FARDEL",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 11,
      photo: { url: "/media/officials/Conseillers/Christophe FARDEL.jpg", alt: "Christophe FARDEL" }
    },
    {
      id: "conseiller-georges-renard",
      firstName: "Georges",
      lastName: "RENARD",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 12,
      photo: { url: "/media/officials/Conseillers/Georges RENARD.jpg", alt: "Georges RENARD" }
    },
    {
      id: "conseiller-laurent-gaquere",
      firstName: "Laurent",
      lastName: "GAQUERE",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 13,
      photo: { url: "/media/officials/Conseillers/Laurent GAQUERE.jpg", alt: "Laurent GAQUERE" }
    },
    {
      id: "conseiller-lucie-wery",
      firstName: "Lucie",
      lastName: "WERY",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 14,
      photo: { url: "/media/officials/Conseillers/Lucie WERY.jpg", alt: "Lucie WERY" }
    },
    {
      id: "conseiller-marie-orzechowski",
      firstName: "Marie",
      lastName: "ORZECHOWSKI",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 15,
      photo: { url: "/media/officials/Conseillers/Marie ORZECHOWSKI.jpg", alt: "Marie ORZECHOWSKI" }
    },
    {
      id: "conseiller-maxime-debusschere",
      firstName: "Maxime",
      lastName: "DEBUSSCHERE",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 16,
      photo: { url: "/media/officials/Conseillers/Maxime DEBUSSCHERE.jpg", alt: "Maxime DEBUSSCHERE" }
    },
    {
      id: "conseiller-patrick-morien",
      firstName: "Patrick",
      lastName: "MORIEN",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 17,
      photo: { url: "/media/officials/Conseillers/Patrick MORIEN.jpg", alt: "Patrick MORIEN" }
    },
    {
      id: "conseiller-philippe-meurillon",
      firstName: "Philippe",
      lastName: "MEURILLON",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 18,
      photo: { url: "/media/officials/Conseillers/Philippe MEURILLON.jpg", alt: "Philippe MEURILLON" }
    },
    {
      id: "conseiller-sylvie-brismail",
      firstName: "Sylvie",
      lastName: "BRISMAIL",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 19,
      photo: { url: "/media/officials/Conseillers/Sylvie BRISMAIL.jpg", alt: "Sylvie BRISMAIL" }
    },
    {
      id: "conseiller-sylvie-herchin",
      firstName: "Sylvie",
      lastName: "HERCHIN",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 20,
      photo: { url: "/media/officials/Conseillers/Sylvie HERCHIN.jpg", alt: "Sylvie HERCHIN" }
    },
    {
      id: "conseiller-sylvie-lion",
      firstName: "Sylvie",
      lastName: "LION",
      role: "Conseiller municipal",
      politicalGroup: "Liste municipale",
      group: "council",
      order: 21,
      photo: { url: "/media/officials/Conseillers/Sylvie LION.jpg", alt: "Sylvie LION" }
    }
  ];

  let docs: Official[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "officials",
      depth: 1,
      sort: "order",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    docs = response.docs as Official[];
  } catch {
    docs = [];
  }

  const sourceOfficials = docs.length > 0 ? docs : fallbackOfficials;
  const officials = sourceOfficials.map((item) => ({
    ...item,
    photo: typeof item.photo === "object" ? item.photo : null
  }));

  let heroImageUrl: string | null = "/images/photo_mairie.jpg";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "elu-et-delegations"
        }
      }
    });
    const heroDoc = heroResponse.docs?.[0] as
      | { id?: string | number; image?: { url?: string } | string | null }
      | undefined;
    if (heroDoc?.image && typeof heroDoc.image === "object" && heroDoc.image.url) {
      heroImageUrl = heroDoc.image.url;
    }
    if (heroDoc?.id) {
      heroId = String(heroDoc.id);
    }
  } catch {
    heroImageUrl = "/images/photo_mairie.jpg";
    heroId = null;
  }

  return (
    <div className="space-y-8">
      <HeroAdmin
        slug="elu-et-delegations"
        eyebrow="Ma ville"
        title="Liste des elus"
        subtitle="Composition de l'equipe municipale, delegations et groupes politiques."
        alt="Mairie de Vendin-les-Bethune"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />

      <OfficialsClient initialOfficials={officials} />
    </div>
  );
}
