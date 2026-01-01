export type SiteNavLink = {
  label: string;
  href: string;
  adminHref?: string;
  adminOnly?: boolean;
  external?: boolean;
  newTab?: boolean;
};

export type SiteNavSection = {
  title: string;
  links: SiteNavLink[];
  collapsible?: boolean;
};

export type SiteNavItem = {
  label: string;
  href: string;
  columns: number;
  sections: SiteNavSection[];
};

export type SiteUtilityLink = {
  label: string;
  href: string;
  icon: "clock" | "mail" | "search";
};

export const siteNav: SiteNavItem[] = [
  {
    label: "Accueil",
    href: "/",
    columns: 2,
    sections: [
      {
        title: "Infos",
        collapsible: false,
        links: [
          { label: "Actualites", href: "/actualites" },
          { label: "Agenda", href: "/agenda" },
          { label: "Vendinfos", href: "/vendinfos" },
          { label: "A propos", href: "/a-propos" }
        ]
      }
    ]
  },
  {
    label: "Ma ville",
    href: "/ma-ville",
    columns: 3,
    sections: [
      {
        title: "Vendin-les-Bethune",
        links: [
          { label: "Conseil municipal", href: "/ma-ville/conseil-municipal" },
          { label: "Delegues de quartier", href: "/ma-ville/delegues-quartier" },
          {
            label: "Liste des elus",
            href: "/ma-ville/elu-et-delegations",
            adminHref: "/admin/collections/officials",
            adminOnly: true
          },
          { label: "Quelques chiffres", href: "/ma-ville/chiffres" },
          { label: "Fiscalite et budget", href: "/ma-ville/fiscalite" },
          { label: "Histoire de Vendin-les-Bethune", href: "/ma-ville/histoire" }
        ]
      },
      {
        title: "Economie",
        links: [
          { label: "Annuaire des entreprises", href: "/ma-ville/entreprises" },
          { label: "Marche", href: "/ma-ville/marche" }
        ]
      },
      {
        title: "Se reperer",
        links: [
          { label: "Plan et quartiers", href: "/ma-ville/plan-quartiers" }
        ]
      },
      {
        title: "Ville nature",
        links: [
        ]
      }
    ]
  },
  {
    label: "Vie pratique",
    href: "/vie-pratique",
    columns: 3,
    sections: [
      {
        title: "Police municipale",
        links: [
          { label: "Contact", href: "/vie-pratique/police-municipale-contact" },
          {
            label: "Operation tranquillite vacances",
            href: "https://www.sivom-bethunois.fr/index.php/operationtranquillitevacances/",
            external: true,
            newTab: true
          }
        ]
      },
      {
        title: "Sante",
        links: [
          { label: "Services de sante", href: "/vie-pratique/services-sante" }
        ]
      },
      {
        title: "Services",
        links: [
          { label: "Demarches administratives", href: "/vie-pratique/demarches" },
          { label: "Location de salle municipale", href: "/demarches/location-salle" },
          { label: "Collecte des dechets", href: "/vie-pratique/dechets" },
          { label: "Urbanisme et voirie", href: "/vie-pratique/urbanisme" },
          { label: "Les reseaux", href: "/vie-pratique/reseaux" }
        ]
      },
      {
        title: "Solidarite",
        links: [
          { label: "CCAS", href: "/vie-pratique/ccas" },
          { label: "Secours populaire", href: "/vie-pratique/secours-populaire" },
          { label: "Seniors", href: "/vie-pratique/seniors" }
        ]
      },
      {
        title: "Emploi",
        links: [
          {
            label: "Les offres d'emplois",
            href: "https://entreprises.hautsdefrance.fr/offres-prochemploi",
            external: true,
            newTab: true
          },
          {
            label: "Emplois territorial",
            href: "https://www.emploi-territorial.fr/recherche_emploi_mobilite/1/",
            external: true,
            newTab: true
          },
          { label: "Formation", href: "/vie-pratique/formation" }
        ]
      },
      {
        title: "Logement",
        links: [
          { label: "Bailleurs sociaux", href: "/vie-pratique/bailleurs-sociaux" },
          { label: "Demande de logement", href: "/vie-pratique/demande-logement" },
          { label: "Aides et conseils", href: "/vie-pratique/aides-conseils" },
          { label: "Permis de louer", href: "/vie-pratique/permis-louer" }
        ]
      }
    ]
  },
  {
    label: "Jeunesse",
    href: "/jeunesse",
    columns: 2,
    sections: [
      {
        title: "Petite enfance",
        links: [
          { label: "Micro-creche", href: "/jeunesse/micro-creche" }
        ]
      },
      {
        title: "Periscolaire",
        links: [
          { label: "Restaurant scolaire", href: "/jeunesse/restaurant-scolaire" },
          { label: "Accueil periscolaire", href: "/jeunesse/accueil-periscolaire" }
        ]
      },
      {
        title: "Vie scolaire",
        links: [
          { label: "Ecole maternelle", href: "/jeunesse/ecole-maternelle" },
          { label: "Ecole primaire", href: "/jeunesse/ecole-primaire" },
          { label: "RASED", href: "/jeunesse/rased" }
        ]
      }
    ]
  },
  {
    label: "Loisirs",
    href: "/loisirs",
    columns: 2,
    sections: [
      {
        title: "Vie associative",
        links: [
          { label: "Les associations de A a Z", href: "/loisirs/associations-a-z" },
          { label: "Association : mode d'emploi", href: "/loisirs/association-mode-emploi" }
        ]
      },
      {
        title: "Culture",
        links: [
          { label: "Culture", href: "/loisirs/culture" }
        ]
      },
      {
        title: "Sport",
        links: [
          { label: "Clubs", href: "/loisirs/clubs" },
          { label: "Equipement de plein air", href: "/loisirs/equipement-plein-air" }
        ]
      }
    ]
  },
  {
    label: "Tourisme",
    href: "/tourisme",
    columns: 1,
    sections: [
      {
        title: "Decouvrir",
        links: [
          { label: "Tourisme a Vendin", href: "/tourisme" },
          { label: "Balades", href: "/tourisme/balades" },
          { label: "Patrimoine", href: "/tourisme/patrimoine" }
        ]
      }
    ]
  }
];

export const siteUtilities: SiteUtilityLink[] = [
  { label: "Horaires", href: "/horaires-des-services", icon: "clock" },
  { label: "Contact", href: "/nous-contacter", icon: "mail" },
  { label: "Recherche", href: "/recherche", icon: "search" }
];
