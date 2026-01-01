export type ReseauxContact = {
  label: string;
  phone?: string;
  note?: string;
  type?: "primary" | "secondary";
};

export type ReseauxSection = {
  id: string;
  title: string;
  image: {
    src?: string;
    alt: string;
  };
  center: {
    logoSrc?: string;
    text: string;
    bullets?: string[];
  };
  contacts: ReseauxContact[];
  website?: {
    label: string;
    href: string;
  };
  layout?: "default" | "doubleEmergency";
};

export const reseauxSections: ReseauxSection[] = [
  {
    id: "eau-potable",
    title: "Eau potable",
    image: {
      src: "/images/reseaux-eau.png",
      alt: "Illustration eau potable"
    },
    center: {
      text:
        "Depuis le 1er janvier 2020, la competence eau (du captage jusqu'au robinet) est assuree par l'Agglomeration."
    },
    contacts: [
      {
        label: "Service abonnes et facturation",
        phone: "0800 100 116",
        note: "Numero vert - service et appel gratuits",
        type: "primary"
      },
      {
        label: "Urgence technique (24h/24h - 7j/7j)",
        phone: "0800 100 109",
        note: "Numero vert - service et appel gratuits",
        type: "secondary"
      }
    ],
    website: {
      label: "Site Bethune-Bruay",
      href: "https://www.bethunebruay.fr/"
    }
  },
  {
    id: "assainissement",
    title: "Assainissement",
    image: {
      src: "/images/reseaux-assainissement.png",
      alt: "Illustration assainissement"
    },
    center: {
      text:
        "Competence de la CABBALR, l'assainissement maintient la proprete et l'hygiene. Il est dit collectif quand le foyer est relie au reseau public."
    },
    contacts: [
      {
        label: "Assainissement collectif",
        phone: "03 21 65 06 15",
        type: "primary"
      },
      {
        label: "Assainissement non collectif",
        phone: "03 21 61 50 00",
        type: "secondary"
      }
    ],
    website: {
      label: "Site Bethune-Bruay",
      href: "https://www.bethunebruay.fr/"
    }
  },
  {
    id: "eclairage-public",
    title: "Eclairage public",
    image: {
      src: "/images/reseaux-eclairage.png",
      alt: "Illustration eclairage public"
    },
    center: {
      text:
        "Signaler un probleme sur le reseau d'eclairage public de la ville."
    },
    contacts: [
      {
        label: "Mairie de Vendin-les-Bethune",
        phone: "03 21 57 26 21",
        type: "primary"
      }
    ]
  },
  {
    id: "electricite-gaz",
    title: "Electricite et gaz",
    image: {
      src: "/images/reseaux-electricite-gaz.png",
      alt: "Illustration electricite et gaz"
    },
    center: {
      text:
        "Contacts d'urgence pour les perturbations electriques et les fuites de gaz."
    },
    contacts: [
      {
        label: "Urgence electricite",
        phone: "0 972 675 062",
        note: "Service de depannage ENEDIS (appel non surtaxe depuis un poste fixe)",
        type: "primary"
      },
      {
        label: "Urgence gaz",
        phone: "0 800 47 33 33",
        note: "Urgence securite gaz GRDF (appel gratuit depuis un poste fixe)",
        type: "primary"
      }
    ],
    layout: "doubleEmergency"
  },
  {
    id: "fibre-optique",
    title: "Fibre optique",
    image: {
      src: "/images/reseaux-fibre.png",
      alt: "Illustration fibre optique"
    },
    center: {
      text: "Couverture fibre sur la commune :",
      bullets: [
        "Couverture : 98 %",
        "Locaux raccordes : 1 251",
        "Locaux restants a raccorder : 26"
      ]
    },
    contacts: [],
    website: {
      label: "Voir la couverture fibre",
      href: "https://infofibre.fr/62/vendin-les-bethune"
    }
  }
];
