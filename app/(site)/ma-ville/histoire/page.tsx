import { getPayload } from "payload";
import configPromise from "@payload-config";
import { HistoireClient } from "./HistoireClient";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Histoire de Vendin-les-Bethune"
};

export const dynamic = "force-dynamic";

const sections = [
  {
    id: "origines",
    title: "Origines du nom et premiers repères",
    period: "XIIe - XVe siecles",
    text: [
      "Les formes anciennes du nom de la commune attestent une presence ancienne et des variations d'orthographe selon les sources.",
      "On retrouve notamment Wendinium/Wendin (1152), Wending (1244), Vandin (1318), Wendin-deles-Bethune (1331), Vendin-en-l'Adwoerie (1449)."
    ],
    illustration: {
      title: "Illustration - Toponymie",
      caption: "Manuscrits, cartes anciennes ou vues historiques du bourg."
    }
  },
  {
    id: "ancien-regime",
    title: "Vendin sous l'Ancien Regime",
    period: "Avant 1789",
    text: [
      "A la veille de la Revolution, Vendin depend du bailliage de Bethune et possede une coutume locale redigee en 1507 (cadre de la coutume d'Artois).",
      "Sur le plan religieux, la paroisse releve du diocese d'Arras (doyenne de Bethune). Les sources mentionnent une eglise paroissiale consacree a la Vierge, ainsi qu'un vocable Saint-Vaast dans les archives departementales."
    ],
    illustration: {
      title: "Illustration - Vie paroissiale",
      caption: "Eglise, objets du culte, vues anciennes de la paroisse."
    }
  },
  {
    id: "revolution",
    title: "De la Revolution a la structuration administrative moderne",
    period: "1790 - 1801",
    text: [
      "Avec la Revolution, la commune s'integre aux nouvelles structures administratives.",
      "En 1790, Vendin-les-Bethune est chef-lieu de canton et depend du district de Bethune. En 1801, la commune releve du canton de Bethune dans l'arrondissement de Bethune."
    ]
  },
  {
    id: "mines-1",
    title: "L'ere miniere: un tournant majeur",
    period: "1854 - 1900",
    text: [
      "L'histoire locale est fortement marquee par l'exploitation houillere.",
      "Une societe de recherche est fondee le 31 mai 1854; le sondage confirme la presence de charbon. La concession est accordee le 6 mai 1857, et une fosse a Annezin commence a produire en 1861.",
      "Cette premiere periode se termine apres l'inondation des fosses en 1900."
    ],
    illustration: {
      title: "Illustration - Mines et corons",
      caption: "Chevalements, cites minieres, vie quotidienne des mineurs."
    }
  },
  {
    id: "mines-2",
    title: "Charbonnages de Vendin-lez-Bethune et suites",
    period: "1912 - 1949",
    text: [
      "La Compagnie des Charbonnages de Vendin-lez-Bethune est constituee en 1912; la fosse produit a partir de 1913.",
      "Pendant la Premiere Guerre mondiale, la production augmente fortement. En 1918, les installations sont bombardees et les travaux souterrains sont inondes.",
      "L'activite cesse en 1930 et la societe est dissoute en 1932. La fosse est reprise en 1942, nationalisee en 1946, relancee en 1948, puis fermee definitivement en novembre 1949."
    ]
  },
  {
    id: "guerres",
    title: "Guerres, decorations et memoire communale",
    period: "XXe siecle",
    text: [
      "La commune est decoree de la Croix de guerre 1914-1918 par decret du 25 septembre 1920.",
      "Un monument aux morts, situe pres de la mairie, commemore les conflits de 1914-1918 et 1939-1945."
    ],
    illustration: {
      title: "Illustration - Memoires de guerre",
      caption: "Monument aux morts, ceremonies, archives communales."
    }
  },
  {
    id: "patrimoine",
    title: "Symboles et patrimoine",
    period: "Repere patrimoniaux",
    text: [
      "Le blason communal est decrit par les archives departementales: d'azur a l'escarboucle fleuronnee d'or.",
      "La base nationale POP (Palissy) mentionne des objets mobiliers proteges dans l'eglise, dont la statue Notre-Dame des Ardents et une chasse-reliquaire dite Saint Cierge."
    ]
  }
];

const fallbackSections = sections.map((section, index) => ({
  id: section.id,
  title: section.title,
  period: section.period,
  content: section.text.join("\n\n"),
  order: index + 1,
  status: "published" as const,
  isFallback: true as const
}));

type HistorySection = {
  id: string | number;
  title: string;
  period?: string | null;
  content: string;
  status?: "draft" | "published";
  order?: number | null;
  image?: { url?: string; alt?: string } | string | null;
  imageAlt?: string | null;
  isFallback?: boolean;
};

export default async function HistoirePage() {
  let docs: HistorySection[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "history-sections",
      depth: 1,
      sort: "order",
      limit: 200,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    docs = response.docs as HistorySection[];
  } catch {
    docs = [];
  }

  const initialSections = docs.length > 0 ? docs : fallbackSections;

  return (
    <div className="space-y-8">
      <CenteredPageHeader
        label="Vendin-les-Bethune"
        title="Histoire de Vendin-les-Bethune"
        description="Parcours historique de la commune, organise par grandes etapes et enrichi d'espaces pour illustrations."
      />

      <HistoireClient initialSections={initialSections} />

      <section className="space-y-3">
        <h2 className="text-xl font-display">Sources</h2>
        <ul className="list-disc pl-5 text-sm text-slate">
          <li>Archives departementales du Pas-de-Calais</li>
          <li>Wikipasdecalais (toponymie, cadre 1789)</li>
          <li>Wikipedia (Vendin-les-Bethune, compagnies minieres)</li>
          <li>Base POP / Palissy (objets mobiliers)</li>
        </ul>
      </section>
    </div>
  );
}
