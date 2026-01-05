import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { Card } from "@/components/Card";
import { HeroAdmin } from "@/components/HeroAdmin";
import { SchoolMenusCard } from "@/components/SchoolMenusCard";
import {
  Apple,
  Bell,
  CalendarClock,
  CircleHelp,
  CirclePlay,
  GlassWater,
  LogIn,
  Salad,
  Soup,
  UserPlus,
  UtensilsCrossed
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type SchoolMenuItem = {
  id?: string | number;
  title: string;
  linkLabel?: string | null;
  linkUrl?: string | null;
  status?: "draft" | "published";
  order?: number | null;
};

const restaurantMenuFallback: SchoolMenuItem[] = [
  {
    title: "Du 6 octobre au 4 janvier 2026 - Restauration scolaire",
    linkLabel: "Telecharger le menu Octobre - Janvier",
    linkUrl:
      "https://www.sivom-bethunois.fr/wp-content/uploads/2025/09/Menus-RAD-du-6-octobre-au-4-janvier-2026.pdf",
    status: "published",
    order: 1
  },
  {
    title: "Du 5 janvier au 27 mars 2026 - Scolaire",
    linkLabel: "Telecharger le menu Janvier - Mars",
    linkUrl:
      "https://www.sivom-bethunois.fr/wp-content/uploads/2025/12/Menus-SCOLAIRE-du-5-janvier-au-27-mars-2026.pdf",
    status: "published",
    order: 2
  }
];

const pages: Record<string, { title: string; description: string; bullets: string[] }> = {
  "micro-creche": {
    title: "Micro-creche",
    description: "Informations et modalites d'inscription.",
    bullets: ["Horaires", "Inscription", "Tarifs"]
  },
  "restaurant-scolaire": {
    title: "Restaurant scolaire",
    description: "Menus, inscriptions et informations pratiques.",
    bullets: ["Menus", "Inscriptions", "Reglements"]
  },
  "accueil-periscolaire": {
    title: "Accueil periscolaire",
    description: "Accueil matin et soir pour les eleves.",
    bullets: ["Horaires", "Modalites", "Inscription"]
  },
  "ecole-maternelle": {
    title: "Ecole maternelle",
    description: "Informations et vie des ecoles maternelles.",
    bullets: ["Etablissements", "Horaires", "Contacts"]
  },
  "ecole-primaire": {
    title: "Ecole primaire",
    description: "Etablissements primaires et services associes.",
    bullets: ["Etablissements", "Inscriptions", "Contacts"]
  },
  rased: {
    title: "RASED",
    description: "Reseau d'aide specialisee aux eleves en difficulte.",
    bullets: ["Accompagnement", "Equipe", "Orientation"]
  }
};

export default async function JeunesseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return notFound();

  if (slug === "micro-creche") {
    return (
      <div className="space-y-10 section-stack">
        <HeroAdmin
          slug="micro-creche"
          eyebrow="Jeunesse"
          title="Micro-creche Tete de Linotte"
          subtitle="Services petite enfance a Vendin-les-Bethune (62232)."
          alt="Micro-creche Tete de Linotte"
          initialImageUrl="/images/micro-creche-hero.png"
          showText={false}
        />

        <CenteredPageHeader
          label="Jeunesse"
          title="Micro-Creches"
          description="Services petite enfance a Vendin-les-Bethune (62232)."
        />

        <section>
          <Card className="p-6 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Micro-creche
                </p>
                <h2 className="text-2xl font-display text-ink">Tete de Linotte</h2>
                <p className="text-sm text-slate">Vendin-les-Bethune (62232)</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white px-5 py-4 shadow-sm">
                <img
                  src="/images/logo-tete-de-linotte.jpg"
                  alt="Logo Tete de Linotte"
                  className="h-28 w-auto sm:h-32"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-ink/10 bg-fog p-4">
                  <h3 className="text-base font-semibold text-ink">Informations pratiques</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate">
                    <p>
                      <span className="font-semibold text-ink">Adresse :</span> 16, rue du 11
                      Novembre, 62232 Vendin-les-Bethune
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Horaires :</span> du lundi au
                      vendredi | 7h00 - 19h00
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Age d'accueil :</span> de 2 mois et
                      demi a 4 ans
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Capacite :</span> 12 places dans une
                      structure a taille humaine
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Parking :</span> depose minute a
                      proximite
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/10 bg-white p-4">
                  <h3 className="text-base font-semibold text-ink">Contact / inscription</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate">
                    <p>
                      <span className="text-sm text-slate">Telephone :</span>{" "}
                      <a href="tel:0679580834" className="font-semibold text-ink">
                        06.79.58.08.34
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="https://tetedelinotte.fr/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                      >
                        Site de la micro-creche
                      </a>
                      <a
                        href="https://tetedelinotte.fr/demande-de-place-et-pre-inscription/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                      >
                        Demande de place / pre-inscription
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3">
                <h3 className="text-lg font-display text-ink">Ce qui fait la difference</h3>
                <p className="text-sm text-slate">
                  La micro-creche Tete de Linotte est un lieu pense pour l'eveil, la confiance et
                  le developpement harmonieux de chaque enfant.
                </p>
                <ul className="space-y-3 text-sm text-slate">
                  <li>
                    <span className="font-semibold text-ink">
                      Structure conviviale et chaleureuse :
                    </span>{" "}
                    salle d'activite, espace lecture et jeu, coin repos et jardin exterieur.
                  </li>
                  <li>
                    <span className="font-semibold text-ink">
                      Accompagnement personnalise vers l'autonomie :
                    </span>{" "}
                    developpement moteur, affectif et social dans le respect des rythmes.
                  </li>
                  <li>
                    <span className="font-semibold text-ink">
                      Activites ludiques et educatives :
                    </span>{" "}
                    ateliers creatifs, jeux d'eveil, decouvertes sensorielles adaptees.
                  </li>
                  <li>
                    <span className="font-semibold text-ink">
                      Bien-etre et confort au quotidien :
                    </span>{" "}
                    alimentation bio, produits d'hygiene biologiques, environnement sain.
                  </li>
                  <li>
                    <span className="font-semibold text-ink">Equipe professionnelle dediee :</span>{" "}
                    educatrice/puericultrice, auxiliaires petite enfance, securite et bienveillance.
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-fog p-5 space-y-4">
              <div>
                <h3 className="text-lg font-display text-ink">
                  Une experience enrichissante pour les familles
                </h3>
                <p className="mt-2 text-sm text-slate">
                  La micro-creche integre les parents dans la vie de la structure avec des moments
                  de partage et d'echange (animations, rencontres, evenements festifs).
                </p>
              </div>
              <div className="space-y-3 text-sm text-slate">
                <h4 className="text-base font-semibold text-ink">Semaines de fermeture</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>1 semaine entre Noel et Nouvel An</li>
                  <li>1 semaine en avril</li>
                  <li>3 semaines en aout</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-6 bg-fog">
            <div className="flex items-stretch gap-6">
              <div className="shrink-0">
                <img
                  src="/images/logo-people-baby.png"
                  alt="Logo People & Baby"
                  className="h-20 w-20 rounded-full object-contain sm:h-24 sm:w-24"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <h3 className="text-lg font-display text-ink">
                  Un reseau national de la petite enfance
                </h3>
                <p className="text-sm text-slate">
                  La micro-creche s'inscrit dans le cadre du reseau People & Baby, acteur reconnu
                  de la petite enfance en France. Le reseau developpe depuis plus de 20 ans des
                  structures d'accueil fondees sur le bien-etre de l'enfant, le respect de son
                  rythme et l'accompagnement des familles.
                </p>
                <p className="text-sm text-slate">
                  Sur le site People & Baby, vous pouvez retrouver des informations utiles sur la
                  pedagogie, le fonctionnement des creches, les demarches d'inscription et les
                  aides existantes.
                </p>
                <a
                  href="https://www.people-and-baby.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                >
                  Decouvrir People & Baby
                </a>
              </div>
            </div>
          </Card>
        </section>

      </div>
    );
  }

  if (slug === "restaurant-scolaire") {
    const settingsSlug = "restaurant-scolaire";
    let menuYearLabel = "2025 - 2026";
    let settingsId: string | number | null = null;
    let menuItems = restaurantMenuFallback;
    try {
      const payload = await getPayload({ config: configPromise });
      const settingsResponse = await payload.find({
        collection: "school-menu-settings",
        depth: 0,
        limit: 1,
        where: {
          slug: {
            equals: settingsSlug
          }
        }
      });
      const settingsDoc = settingsResponse.docs?.[0] as
        | { id?: string | number; yearLabel?: string | null }
        | undefined;
      if (settingsDoc?.yearLabel) {
        menuYearLabel = settingsDoc.yearLabel;
      }
      if (settingsDoc?.id) {
        settingsId = String(settingsDoc.id);
      }
      const response = await payload.find({
        collection: "school-menus",
        depth: 0,
        sort: "order",
        limit: 50,
        where: {
          status: {
            equals: "published"
          }
        }
      });
      if (response.docs?.length) {
        menuItems = response.docs as SchoolMenuItem[];
      }
    } catch {
      menuItems = restaurantMenuFallback;
    }

    return (
      <div className="space-y-10">
        <HeroAdmin
          slug="restaurant-scolaire"
          eyebrow="Jeunesse"
          title="Restaurant scolaire"
          subtitle="Menus scolaires du SIVOM Bethunois et informations pratiques."
          alt="Restaurant scolaire"
          initialImageUrl="/images/restaurant-scolaire-hero.png"
          showText={false}
        />

        <CenteredPageHeader
          label="Jeunesse"
          title="Restaurant scolaire"
          description="Menus scolaires du SIVOM Bethunois et informations pratiques."
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f5f1e6,transparent_60%)]" />
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/15" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-ink/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate shadow-sm">
                <UtensilsCrossed className="h-4 w-4 text-accent" aria-hidden="true" />
                Menus scolaires
              </div>
              <h2 className="text-2xl font-display text-ink">
                Des repas equilibres pour les enfants de nos ecoles
              </h2>
              <p className="text-sm text-slate">
                La commune, via le SIVOM Bethunois, propose des menus varies et adaptes aux besoins
                nutritionnels des enfants. Les menus sont concus dans le respect des
                recommandations nationales pour allier sante, plaisir et diversite alimentaire.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1">
                  <Salad className="h-4 w-4 text-accent" aria-hidden="true" />
                  Entree
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1">
                  <UtensilsCrossed className="h-4 w-4 text-accent" aria-hidden="true" />
                  Plat
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1">
                  <Soup className="h-4 w-4 text-accent" aria-hidden="true" />
                  Accompagnement
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1">
                  <GlassWater className="h-4 w-4 text-accent" aria-hidden="true" />
                  Laitier
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1">
                  <Apple className="h-4 w-4 text-accent" aria-hidden="true" />
                  Dessert
                </span>
              </div>
            </div>
          </Card>

          <SchoolMenusCard
            items={menuItems}
            fallbackItems={restaurantMenuFallback}
            yearLabel={menuYearLabel}
            settingsId={settingsId}
            settingsSlug={settingsSlug}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-display text-ink">Allergies et regimes specifiques</h3>
            <p className="text-sm text-slate">
              Si votre enfant presente une allergie ou un regime particulier, signalez-le a
              l'ecole ou au service concerne. Un Projet d'Accueil Individualise (PAI) pourra etre
              mis en place selon les besoins.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-display text-ink">Infos pratiques</h3>
            <div className="text-sm text-slate space-y-2">
              <p>
                <span className="font-semibold text-ink">Public concerne :</span> eleves des ecoles
                maternelles et elementaires desservis par le SIVOM Bethunois.
              </p>
              <p>
                <span className="font-semibold text-ink">Periodes :</span> menus actualises chaque
                trimestre, adaptes a l'annee scolaire en cours.
              </p>
              <p>
                <span className="font-semibold text-ink">Contact restauration scolaire :</span>{" "}
                pour toute question relative aux menus, a la cantine ou aux allergies, merci de
                contacter le service concerne via la mairie ou le SIVOM.
              </p>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  if (slug === "ecole-maternelle") {
    return (
      <div className="space-y-10">
        <section className="space-y-6">
          <CenteredPageHeader
            label="Jeunesse"
            title="Ecole maternelle Colette"
            description="Un cadre bienveillant pour les premiers apprentissages."
          />

          <Card className="overflow-hidden p-0">
            <div className="relative h-56 sm:h-72 lg:h-80">
              <img
                src="/images/ecole-maternelle.jpg"
                alt="Ecole maternelle Colette a Vendin-les-Bethune"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                    Ecole maternelle
                  </p>
                  <h2 className="text-2xl font-display text-ink">
                    Ecole maternelle Colette - Vendin-les-Bethune
                  </h2>
                  <p className="text-sm text-slate">
                    L'ecole accompagne les enfants dans leurs premiers apprentissages dans un
                    cadre rassurant et stimulant.
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-fog px-4 py-3 text-sm text-slate">
                  <p>
                    <span className="font-semibold text-ink">Adresse :</span> Rue Francois
                    Mitterrand, 62232 Vendin-les-Bethune
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Telephone :</span>{" "}
                    <a href="tel:0321571276" className="font-semibold text-ink">
                      03 21 57 12 76
                    </a>
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate">
                Repere : ecole elementaire Irene Curie, Rue Francois Mitterrand -{" "}
                <a href="tel:0321571071" className="font-semibold text-ink">
                  03 21 57 10 71
                </a>
              </p>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Horaires de l'ecole</h3>
            <p className="text-sm text-slate">
              Lundi, mardi, jeudi, vendredi : 8h30 - 11h45 et 13h45 - 16h30
            </p>
            <p className="text-xs text-slate">Ouverture des portes : 10 minutes avant l'accueil</p>
            <div className="rounded-2xl border border-ink/10 bg-fog p-4">
              <h4 className="text-base font-semibold text-ink">Periscolaire</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate">
                <li>
                  <span className="font-semibold text-ink">Garderie :</span> 7h30 - 8h15 et 16h30 -
                  19h00
                </li>
                <li>
                  <span className="font-semibold text-ink">Accueil du mercredi :</span> 7h30 -
                  18h30
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Restauration scolaire</h3>
            <p className="text-sm text-slate">
              Les inscriptions cantine se font via{" "}
              <a
                href="https://vendinlezbethune.myperischool.fr/connexion"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-accent hover:text-ink"
              >
                My Peri'School
              </a>
              .
            </p>
            <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate space-y-2">
              <p>
                <span className="font-semibold text-ink">Avant lundi 12h :</span> repas du jeudi et
                vendredi
              </p>
              <p>
                <span className="font-semibold text-ink">Avant jeudi 12h :</span> repas du lundi et
                mardi
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-fog p-4 text-sm text-slate space-y-2">
              <h4 className="text-base font-semibold text-ink">Aide aux eleves - RASED</h4>
              <p>
                Le RASED accompagne les difficultés scolaires (aide psychologique, reeducative,
                pedagogique) en lien avec l'equipe educative.
              </p>
              <p>
                <span className="font-semibold text-ink">Locaux :</span> ecole Irene Curie
              </p>
              <p>
                <span className="font-semibold text-ink">Telephone :</span>{" "}
                <a href="tel:0321658539" className="font-semibold text-ink">
                  03 21 65 85 39
                </a>
              </p>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Inscrire son enfant</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate">
              <div className="space-y-2">
                <p className="font-semibold text-ink">Pre-inscription en mairie</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Livret de famille / piece d'identite / acte de naissance</li>
                  <li>Justificatif de domicile</li>
                  <li>Justificatif des vaccinations obligatoires</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-ink">Inscription a l'ecole</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Certificat d'inscription delivre par la mairie</li>
                  <li>Pieces d'etat civil + vaccinations</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate">
              L'inscription doit etre finalisee au plus tard en juin avant la rentree. L'accueil
              des enfants a partir de 2 ans peut etre propose selon les places disponibles. L'ecole
              maternelle fait partie de l'instruction obligatoire a partir de 3 ans.
            </p>
          </Card>
        </section>
      </div>
    );
  }

  if (slug === "ecole-primaire") {
    return (
      <div className="space-y-10">
        <section className="space-y-6">
          <CenteredPageHeader
            label="Jeunesse"
            title="Ecole primaire Irene Curie"
            description="Etablissement public et services scolaires a Vendin-les-Bethune."
          />

          <Card className="overflow-hidden p-0">
            <div className="relative h-56 sm:h-72 lg:h-80">
              <img
                src="/images/ecole-primaire.jpg"
                alt="Ecole primaire Irene Curie a Vendin-les-Bethune"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                    Ecole primaire publique
                  </p>
                  <h2 className="text-2xl font-display text-ink">
                    Ecole primaire Irene Curie - Vendin-les-Bethune
                  </h2>
                  <p className="text-sm text-slate">
                    Etablissement public de l'Education nationale (academie de Lille), regroupant
                    les niveaux maternelle et elementaire.
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-fog px-4 py-3 text-sm text-slate space-y-1">
                  <p>
                    <span className="font-semibold text-ink">Adresse :</span> Rue Francois
                    Mitterrand, 62232 Vendin-les-Bethune
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Telephone :</span>{" "}
                    <a href="tel:0672602856" className="font-semibold text-ink">
                      06 72 60 28 56
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Email :</span>{" "}
                    <a href="mailto:ce.0623670C@ac-lille.fr" className="font-semibold text-ink">
                      ce.0623670C@ac-lille.fr
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                <span className="rounded-full border border-ink/10 bg-white px-3 py-1">
                  Academie de Lille
                </span>
                <span className="rounded-full border border-ink/10 bg-white px-3 py-1">
                  Zone B
                </span>
                <span className="rounded-full border border-ink/10 bg-white px-3 py-1">Public</span>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Horaires indicatifs</h3>
            <p className="text-sm text-slate">
              Lundi, mardi, jeudi, vendredi : 8h30 - 11h45 et 13h45 - 16h30
            </p>
            <p className="text-xs text-slate">
              Ces horaires correspondent a la plage habituellement indiquee pour les etablissements
              scolaires de Vendin-les-Bethune.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Services et particularites</h3>
            <ul className="space-y-2 text-sm text-slate">
              <li>
                <span className="font-semibold text-ink">Cantine scolaire :</span> restauration
                integree a l'etablissement.
              </li>
              <li>
                <span className="font-semibold text-ink">ULIS :</span> accueil et accompagnement
                adaptes pour certains eleves en situation de handicap.
              </li>
              <li>
                <span className="font-semibold text-ink">Effectif :</span> environ 145 eleves (donnee
                indicative).
              </li>
            </ul>
          </Card>
        </section>

        <section>
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Inscrire son enfant</h3>
            <p className="text-sm text-slate">
              La procedure d'inscription se fait en deux etapes, comme pour l'ecole maternelle.
            </p>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate">
              <div className="space-y-2">
                <p className="font-semibold text-ink">Pre-inscription en mairie</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Livret de famille / piece d'identite / acte de naissance</li>
                  <li>Justificatif de domicile</li>
                  <li>Justificatif des vaccinations obligatoires</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-ink">Inscription a l'ecole</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Certificat d'inscription delivre par la mairie</li>
                  <li>Pieces d'etat civil + vaccinations</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  if (slug === "rased") {
    return (
      <div className="space-y-10">
        <HeroAdmin
          slug="rased"
          eyebrow="Jeunesse"
          title="RASED"
          subtitle="Reseau d'aides specialisees aux eleves en difficulte."
          alt="RASED Vendin-les-Bethune"
          initialImageUrl="/images/rased-hero.png"
          showText={false}
        />

        <CenteredPageHeader
          label="Jeunesse"
          title="RASED"
          description="Reseau d'aides specialisees aux eleves en difficulte."
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              Aides specialisees
            </p>
            <h2 className="text-2xl font-display text-ink">
              RASED - Aide aux eleves en difficulte
            </h2>
            <p className="text-sm text-slate">
              Le RASED est un dispositif destine a accompagner les eleves rencontrant des
              difficultes scolaires persistantes. Il complete l'aide des enseignants par des
              interventions specialisees (psychologiques, reeducatives, pedagogiques) lorsque les
              aides en classe ne suffisent plus et qu'une demande est formulee.
            </p>
            <div className="rounded-2xl border border-ink/10 bg-fog p-4 text-sm text-slate space-y-2">
              <p>
                <span className="font-semibold text-ink">Locaux :</span> ecole Irene Curie
              </p>
              <p>
                <span className="font-semibold text-ink">Adresse :</span> Rue Francois Mitterrand,
                62232 Vendin-les-Bethune
              </p>
              <p>
                <span className="font-semibold text-ink">Adresse (annuaire) :</span> 166 Rue
                Francois Mitterrand, 62232 Vendin-les-Bethune
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-display text-ink">Contact</h3>
            <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate space-y-2">
              <p>
                <span className="font-semibold text-ink">Telephone :</span>{" "}
                <a href="tel:0321658539" className="font-semibold text-ink">
                  03 21 65 85 39
                </a>
              </p>
              <p className="text-xs text-slate">
                Contact pour les demandes d'information et d'orientation concernant les aides
                specialisees.
              </p>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  if (slug === "accueil-periscolaire") {
    return (
      <div className="space-y-10">
        <CenteredPageHeader
          label="Jeunesse"
          title="Portail Periscolaire"
          description="Gerez cantine, garderie et activites via My Peri'School."
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f2f6ff,transparent_60%)]" />
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-accent/10" />
            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Portail periscolaire
              </p>
              <h2 className="text-2xl font-display text-ink">
                Gere cantine, garderie et activites en un seul espace
              </h2>
              <p className="text-sm text-slate">
                Ce portail vous redirige vers My Peri'School, la plateforme utilisee pour gerer
                les inscriptions a la cantine et aux services periscolaires. Vous pouvez vous
                connecter pour consulter vos reservations, les modifier et suivre vos demarches.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://vendinlezbethune.myperischool.fr/connexion"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ink"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Se connecter
                </a>
                <a
                  href="https://vendinlezbethune.myperischool.fr/connexion"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-gold/60 hover:text-accent"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Creer / activer mon compte
                </a>
              </div>
            </div>
          </Card>

          <Card className="flex items-center justify-center p-6">
            <img
              src="/images/perischool-logo.png"
              alt="Logo My Peri'School"
              className="h-40 w-auto"
              loading="lazy"
            />
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-display text-ink">Cantine</h3>
            <p className="text-sm text-slate">Inscrire ou modifier les repas.</p>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-display text-ink">Periscolaire</h3>
            <p className="text-sm text-slate">Gerer la garderie et les mercredis.</p>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-display text-ink">Notifications</h3>
            <p className="text-sm text-slate">Recevoir des infos pratiques et confirmations.</p>
          </Card>
        </section>

        <section>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-display text-ink">Aide et mode d'emplois</h3>
              <CircleHelp className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate">
              Retrouvez ici le tutoriel video et les reponses aux questions frequentes pour
              utiliser My Peri'School en toute simplicite.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.youtube.com/watch?v=zGswwr-M7Zw"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent"
              >
                <CirclePlay className="h-4 w-4" aria-hidden="true" />
                Aide & mode d'emploi
              </a>
              <a
                href="/nous-contacter"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-gold/60 hover:text-accent"
              >
                Contacter le service periscolaire
              </a>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CenteredPageHeader label="Jeunesse" title={page.title} description={page.description} />
      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-display text-ink">Acces rapides</h2>
        <ul className="list-disc pl-5 text-sm text-slate">
          {page.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
