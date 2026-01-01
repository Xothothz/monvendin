export type HealthSource = {
  label: string;
  url: string;
};

export type HealthItem = {
  id: string;
  name: string;
  address: string;
  phones: string[];
  sources: HealthSource[];
  location: "vendin" | "nearby";
  distance?: string;
  services?: string[];
  urgent?: boolean;
};

export type HealthSection = {
  id: string;
  title: string;
  description: string;
  items: HealthItem[];
};

export const healthSections: HealthSection[] = [
  {
    id: "pharmacie",
    title: "Pharmacie",
    description: "Retrouvez ici la pharmacie presente sur la commune.",
    items: [
      {
        id: "pharmacie-lachor",
        name: "Pharmacie Lachor",
        address: "3 rue du Renouveau, 62232 Vendin-les-Bethune",
        phones: ["03 21 57 05 33"],
        sources: [
          { label: "PHARMACIE LACHOR", url: "https://example.com" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "infirmiers",
    title: "Infirmiers",
    description: "Professionnels infirmiers disponibles sur la commune.",
    items: [
      {
        id: "cecile-carlier",
        name: "Cecile Carlier (infirmiere)",
        address: "61 rue Francois Mitterrand, 62232 Vendin-les-Bethune",
        phones: ["06 81 18 24 54"],
        sources: [
          { label: "Sante.fr", url: "https://www.sante.fr" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "kine",
    title: "Kinesitherapeutes",
    description: "Kinesitherapeutes et soins de reeducation a Vendin.",
    items: [
      {
        id: "xavier-coquel",
        name: "Xavier Coquel",
        address: "12 rue du Renouveau, 62232 Vendin-les-Bethune",
        phones: ["03 21 57 06 98", "06 62 60 67 37"],
        sources: [
          { label: "Doctolib", url: "https://www.doctolib.fr" },
          { label: "Annuaire sante", url: "https://annuaire.sante.fr" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "orthophonistes",
    title: "Orthophonistes",
    description: "Orthophonistes presents sur la commune.",
    items: [
      {
        id: "aurelie-degaugue-reant",
        name: "Aurelie Degaugue Reant",
        address: "3 bis rue Pierre Mendes France, 62232 Vendin-les-Bethune",
        phones: ["03 21 26 39 76"],
        sources: [
          { label: "Sante.fr", url: "https://www.sante.fr" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "osteopathes",
    title: "Osteopathes",
    description: "Osteopathes disponibles a Vendin-les-Bethune.",
    items: [
      {
        id: "clemence-houze",
        name: "Clemence Houze",
        address: "5 rue du Renouveau, 62232 Vendin-les-Bethune",
        phones: [],
        sources: [
          { label: "Doctolib", url: "https://www.doctolib.fr" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "dentistes",
    title: "Dentistes",
    description: "Chirurgiens-dentistes presents sur la commune.",
    items: [
      {
        id: "muriel-dayez",
        name: "Dr Muriel Dayez",
        address: "36A rue des Martyrs, 62232 Vendin-les-Bethune",
        phones: ["03 21 56 03 23"],
        sources: [
          { label: "annuairedentaire.com", url: "https://www.annuairedentaire.com" }
        ],
        location: "vendin"
      }
    ]
  },
  {
    id: "hopitaux",
    title: "Hopitaux & cliniques proches",
    description: "Etablissements de sante a proximite de Vendin-les-Bethune.",
    items: [
      {
        id: "clinique-anne-d-artois",
        name: "Clinique Anne d'Artois",
        address: "Clinique Anne d'Artois, Bethune",
        phones: ["08 26 20 01 10"],
        sources: [
          {
            label: "Clinique Anne d'Artois",
            url: "https://www.sante.fr/etablissement-de-soins-pluridisciplinaire/bethune/clinique-anne-dartois"
          }
        ],
        location: "nearby",
        distance: "~3 km (Bethune)",
        urgent: true,
        services: ["Medecine", "Chirurgie", "Imagerie", "Laboratoire"]
      },
      {
        id: "ch-bethune-beuvry",
        name: "Centre Hospitalier de Bethune-Beuvry",
        address: "Centre Hospitalier de Bethune-Beuvry, Beuvry",
        phones: ["03 21 64 44 44"],
        sources: [{ label: "GHT de l'Artois", url: "https://www.ght-artois.fr/" }],
        location: "nearby",
        distance: "~3-4 km (Bethune-Beuvry)",
        urgent: true,
        services: [
          "Urgences",
          "Consultations specialisees",
          "Chirurgie",
          "Maternite",
          "Examens",
          "Hospitalisation",
          "Plateaux techniques"
        ]
      }
    ]
  }
];
