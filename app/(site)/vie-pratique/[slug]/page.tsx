import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import {
  ArrowRight,
  EnvelopeSimple,
  FileText,
  Globe,
  Leaf,
  MapPin,
  Phone,
  PhoneCall,
  Recycle,
  ShieldCheck,
  Trash,
  Truck,
  WarningCircle,
  Wine
} from "@phosphor-icons/react/dist/ssr";
import { PoliceMunicipaleContactContent } from "@/components/PoliceMunicipaleContactContent";
import { HealthServicesHero, HealthServicesPage } from "@/components/HealthServicesPage";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { DechetsSchedule } from "@/components/DechetsSchedule";
import { HeroAdmin } from "@/components/HeroAdmin";
import { UrbanismeResourcesTabs } from "@/components/UrbanismeResourcesTabs";
import { ReseauxAccordion } from "@/components/ReseauxAccordion";
import { LightboxModalButton } from "@/components/LightboxModalButton";
import { PdfLightboxButton } from "@/components/PdfLightboxButton";
import { getPayload } from "payload";
import configPromise from "@payload-config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const basePages: Record<
  string,
  { title: string; description: string; hints: string[] }
> = {
  demarches: {
    title: "Demarches administratives",
    description: "Guides et formulaires pour vos demandes du quotidien.",
    hints: ["Etat civil", "Cartes d'identite", "Elections"]
  },
  sante: {
    title: "Sante",
    description: "Services de sante et professionnels disponibles.",
    hints: ["Medecins", "Pharmacies", "Urgences"]
  },
  reseaux: {
    title: "Reseaux",
    description: "Reseaux d'eau, electricite, fibre et signalements.",
    hints: ["Coupures", "Raccordements", "Fibre"]
  },
  logement: {
    title: "Logement",
    description: "Bailleurs sociaux, demandes et aides disponibles.",
    hints: ["Demande logement", "Aides", "Permis de louer"]
  },
  emploi: {
    title: "Emploi",
    description: "Offres, formations et ressources emploi.",
    hints: ["Offres locales", "Emploi territorial", "Formations"]
  },
  "police-municipale": {
    title: "Police municipale",
    description: "Contact, dispositifs et prevention.",
    hints: ["Contact", "Stationnement", "Securite"]
  },
  "police-municipale-contact": {
    title: "Police municipale - Contact",
    description: "Coordonnees et horaires de la police municipale.",
    hints: ["Telephone", "Accueil", "Signalements"]
  },
  "services-sante": {
    title: "Services de santé",
    description: "Structures et services de santé disponibles.",
    hints: ["Centre de sante", "Soins", "Urgences"]
  },
  ccas: {
    title: "CCAS",
    description: "Solidarite, aides sociales et accompagnements.",
    hints: ["Aides d'urgence", "Accompagnement", "Seniors"]
  },
  seniors: {
    title: "Seniors",
    description: "Services et accompagnements pour les seniors.",
    hints: ["Aides", "Activites", "Accompagnement"]
  },
  formation: {
    title: "Formation",
    description: "Formations et accompagnement professionnel.",
    hints: ["Orientation", "Financement", "Parcours"]
  },
  "bailleurs-sociaux": {
    title: "Bailleurs sociaux",
    description: "Liste des bailleurs et informations pratiques.",
    hints: ["Contacts", "Dossiers", "Suivi"]
  },
  "demande-logement": {
    title: "Demande de logement",
    description: "Constituer une demande de logement social.",
    hints: ["Dossier", "Pieces", "Suivi"]
  },
  "aides-conseils": {
    title: "Aides et conseils",
    description: "Aides financieres et conseils logement.",
    hints: ["Aides", "Conseils", "Accompagnement"]
  },
  "permis-louer": {
    title: "Permis de louer",
    description: "Informations sur le permis de louer.",
    hints: ["Dossier", "Obligations", "Contact"]
  }
};

export default async function ViePratiqueDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "demarches") {
    let heroImageUrl: string | null = "/images/ccas-hero.png";
    let heroId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const heroResponse = await payload.find({
        collection: "page-heroes",
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: "demarches"
          }
        }
      });
      const heroDoc = heroResponse.docs?.[0] as
        | { id?: string | number; image?: { url?: string } | string | null }
        | undefined;
      if (heroDoc?.image && typeof heroDoc.image === "object" && heroDoc.image.url) {
        if (!heroDoc.image.url.includes("photo_mairie")) {
          heroImageUrl = heroDoc.image.url;
        }
      }
      if (heroDoc?.id) {
        heroId = String(heroDoc.id);
      }
    } catch {
      heroImageUrl = "/images/ccas-hero.png";
      heroId = null;
    }

    return (
      <div className="space-y-10">
        <HeroAdmin
          slug="demarches"
          eyebrow="Vie pratique"
          title="Demarches administratives"
          subtitle="Accedez directement aux principales demarches pour les papiers citoyens et la vie de famille."
          alt="Demarches administratives"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />

        <CenteredPageHeader
          label="Vie pratique"
          title="Demarches administratives"
          description="Accedez directement aux principales demarches pour les papiers citoyens et la vie de famille."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="https://www.service-public.gouv.fr/particuliers/vosdroits/N19810"
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <Card className="h-full px-6 py-8 text-center transition-all duration-200 hover:border-gold/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Demarches
              </p>
              <h2 className="mt-2 text-base font-display uppercase tracking-[0.14em] text-ink transition group-hover:text-accent sm:text-lg">
                Papiers - Citoyennete
              </h2>
              <p className="mt-3 text-sm text-slate">
                Etats-civil, passeport, livret de famille, etc ...
              </p>
            </Card>
          </a>
          <a
            href="https://www.service-public.gouv.fr/particuliers/vosdroits/N19805"
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <Card className="h-full px-6 py-8 text-center transition-all duration-200 hover:border-gold/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Demarches
              </p>
              <h2 className="mt-2 text-base font-display uppercase tracking-[0.14em] text-ink transition group-hover:text-accent sm:text-lg">
                Famille
              </h2>
              <p className="mt-3 text-sm text-slate">
                Naissance, mariage, PACS, scolarite, allocations, etc ...
              </p>
            </Card>
          </a>
        </div>
      </div>
    );
  }

  if (slug === "police-municipale-contact") {
    let introText =
      "La ville de Vendin-les-Béthune adhere a la competence « Police municipale intercommunale »";
    let missions = [
      "Controles routiers",
      "Prevention et lutte contre les cambriolages",
      "Incivilites du quotidien",
      "Conflits de voisinage",
      "Attroupements – bruits – nuisances",
      "Depots sauvages",
      "Presence aux equipements municipaux loues",
      "Presence aux manifestations communales",
      "Respect de la reglementation en matiere d'urbanisme",
      "Prevention – pedagogie (ex: permis pieton, permis velo, etc.)"
    ];
    let contentId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const response = await payload.find({
        collection: "page-texts",
        depth: 0,
        limit: 1,
        where: {
          slug: {
            equals: "police-municipale-contact"
          }
        }
      });
      const doc = response.docs?.[0] as
        | { id?: string | number; intro?: string | null; missions?: { label?: string }[] }
        | undefined;
      if (doc?.intro) {
        introText = doc.intro;
      }
      if (doc?.missions && doc.missions.length > 0) {
        missions = doc.missions.map((item) => item.label ?? "").filter(Boolean);
      }
      if (doc?.id) {
        contentId = String(doc.id);
      }
    } catch {
      introText =
        "La ville de Vendin-les-Béthune adhere a la competence « Police municipale intercommunale »";
      contentId = null;
    }

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
            equals: "police-municipale-contact"
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
          slug="police-municipale-contact"
          eyebrow="Vie pratique"
          title="Police municipale intercommunale"
          subtitle="Services et contact de la police municipale intercommunale."
          alt="Police municipale intercommunale"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
          cropRatio={3 / 2}
        />
        <CenteredPageHeader
          label="Vie pratique"
          title="Police municipale intercommunale"
          description="Services et contact de la police municipale intercommunale."
        />

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-display text-ink">Contact</h2>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://www.sivom-bethunois.fr/index.php/police-municipale-intercommunale/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70 hover:bg-goldSoft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-goldSoft text-ink">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              Police intercommunale
            </a>
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-goldSoft text-ink">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <a href="tel:0805010221" className="hover:text-ink">
                0 805 010 221
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-goldSoft text-ink">
                <EnvelopeSimple className="h-4 w-4" aria-hidden="true" />
              </span>
              <a href="mailto:police.municipale@sivom-bethunois.fr" className="hover:text-ink">
                police.municipale@sivom-bethunois.fr
              </a>
            </div>
          </div>
        </Card>

        <PoliceMunicipaleContactContent
          slug="police-municipale-contact"
          initialIntro={introText}
          initialMissions={missions}
          initialContentId={contentId}
        />
      </div>
    );
  }

  if (slug === "services-sante") {
    return (
      <div className="space-y-8">
        <HealthServicesHero />
        <CenteredPageHeader
          label="Vie pratique"
          title="Services de Santé"
          description="Professionnels de sante sur la commune et hopitaux/cliniques les plus proches."
        />
        <HealthServicesPage />
      </div>
    );
  }

  if (slug === "ccas") {
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
            equals: "ccas"
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
      <div className="space-y-12">
        <HeroAdmin
          slug="ccas"
          eyebrow="Vie pratique"
          title="CCAS - Centre communal d'action sociale"
          subtitle="Un service municipal d'ecoute, d'accompagnement et d'orientation sociale."
          alt="CCAS"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />

        <CenteredPageHeader
          label="Vie pratique"
          title="CCAS - Centre communal d'action sociale"
          description="Un service municipal d'ecoute, d'accompagnement et d'orientation sociale."
        />

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-display text-ink">Qu'est-ce que le CCAS ?</h2>
            <div className="space-y-3 text-sm text-slate">
              <p>Le Centre communal d'action sociale (CCAS) est un service public communal.</p>
              <p>
                Il accueille, informe et oriente les habitants confrontes a des difficultes
                sociales, administratives ou personnelles.
              </p>
              <p>
                Le CCAS intervient dans un cadre strictement reglemente et agit en lien avec les
                partenaires institutionnels et sociaux.
              </p>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-display text-ink">A qui s'adresse le CCAS ?</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
              <li>Habitants de la commune</li>
              <li>Personnes rencontrant des difficultes sociales ou administratives</li>
              <li>Personnes agees ou isolees</li>
              <li>Familles ou personnes en situation de fragilite</li>
              <li>Toute personne ayant besoin d'information ou d'orientation sociale</li>
            </ul>
            <p className="text-sm text-slate">
              L'accueil est ouvert a tous, quelle que soit la situation, dans le respect de la
              confidentialite.
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display text-ink">Missions principales du CCAS</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-display text-ink">Accueil et ecoute</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
                <li>Echange confidentiel</li>
                <li>Premier niveau d'information</li>
              </ul>
            </Card>
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-display text-ink">Orientation</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
                <li>Orientation vers les services competents</li>
                <li>Administrations, organismes sociaux, partenaires locaux</li>
              </ul>
            </Card>
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-display text-ink">Accompagnement administratif</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
                <li>Aide a la comprehension des demarches</li>
                <li>Appui a la constitution de dossiers, selon les situations</li>
              </ul>
            </Card>
            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-display text-ink">Actions sociales communales</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
                <li>Mise en oeuvre d'actions decidees par la commune</li>
                <li>Soutien aux politiques locales de solidarite</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-display text-ink">Comment effectuer une demarche ?</h2>
            <ol className="space-y-3 text-sm text-slate">
              <li>Prendre contact avec le CCAS (telephone ou accueil en mairie)</li>
              <li>Exposer sa situation lors d'un premier echange</li>
              <li>Etude de la demande selon les regles et dispositifs existants</li>
              <li>Orientation ou accompagnement si necessaire</li>
            </ol>
            <p className="text-xs text-slate">
              Les demarches et aides possibles dependent de la situation personnelle et de la
              reglementation en vigueur.
            </p>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-display text-ink">Informations pratiques</h2>
              <div className="space-y-2 text-sm text-slate">
                <p className="font-semibold text-ink">
                  CCAS - Centre communal d'action sociale
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  Mairie de Vendin-les-Bethune - 209 rue Francois-Mitterrand, 62232
                  Vendin-les-Bethune
                </p>
                <p className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  03 21 57 26 21
                </p>
                <p>Horaires : horaires d'ouverture de la mairie</p>
                <p>Contact : accueil en mairie ou par telephone</p>
              </div>
              <Link
                href="/nous-contacter"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(12,44,132,0.25)]"
              >
                Nous joindre
              </Link>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <h2 className="text-lg font-display text-ink">Confidentialite et respect</h2>
                  <p className="text-sm text-slate">
                    Les echanges avec le CCAS se deroulent dans le respect de la confidentialite,
                    de la dignite des personnes et de l'egalite de traitement.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (slug === "seniors") {
    return (
      <div className="space-y-12">
        <CenteredPageHeader
          label="Vie pratique"
          title="Seniors - services, accompagnement et autonomie"
          description="Services utiles aux seniors, a leurs proches et aux aidants pour le maintien a domicile, l'acces aux soins, l'autonomie et l'accompagnement numerique."
        />
        <p className="text-center text-sm text-slate">Vendin-les-Bethune</p>

        <section className="-mx-4 bg-fog/70 py-10 sm:-mx-6 lg:-mx-8">
          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-ink">
                Maintien a domicile - Services du SIVOM du Bethunois
              </h2>
              <p className="text-sm text-slate">
                Services municipaux pour soutenir l'autonomie et le maintien a domicile.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 space-y-8">
                <div className="grid gap-4 md:grid-cols-[0.22fr_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                    <img
                      src="/images/restauration-domicile.png"
                      alt="Portage de repas a domicile"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-3 min-w-0 pb-6">
                    <h3 className="text-lg font-display text-ink">
                      Portage de repas a domicile
                    </h3>
                    <div className="space-y-3 text-sm text-slate leading-relaxed">
                      <p>
                        Le SIVOM propose un service de restauration a domicile, avec livraison de
                        repas en liaison froide. La commune de Vendin-les-Bethune fait partie des
                        communes couvertes par ce service.
                      </p>
                      <p>
                        Public concerne : personnes agees ou rencontrant des difficultes
                        temporaires ou durables pour preparer leurs repas.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 border-t border-ink/10 pt-8">
                  <div className="rounded-xl border border-ink/10 bg-fog px-4 py-3 text-sm text-slate">
                    <p className="font-semibold text-ink">SIVOM de la Communaute du Bethunois</p>
                    <p className="flex items-start gap-2">
                      <PhoneCall className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                      03 21 61 40 70
                    </p>
                  </div>
                </div>
                <div className="pt-6">
                  <LightboxModalButton
                    src="/images/restauration-modalites.png"
                    alt="Modalites restauration a domicile"
                    label="Modalites de restauration a domicile"
                  />
                  <a
                    href="https://www.sivom-bethunois.fr/index.php/restauration/menus/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                  >
                    Consulter les menus
                  </a>
                </div>
              </Card>

              <Card className="p-6 space-y-8">
                <div className="grid gap-4 md:grid-cols-[0.22fr_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                    <img
                      src="/images/spasad-soins.png"
                      alt="Soins infirmiers a domicile"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-3 min-w-0 pb-6">
                    <h3 className="text-lg font-display text-ink">
                      Soins infirmiers a domicile (SSIAD / SPASAD)
                    </h3>
                    <div className="space-y-3 text-sm text-slate leading-relaxed">
                      <p>
                        Le SIVOM met a disposition un service de soins infirmiers a domicile,
                        destine aux personnes agees ou en perte d'autonomie, sur prescription
                        medicale.
                      </p>
                      <p>
                        Interventions : soins infirmiers a domicile, accompagnement de la perte
                        d'autonomie.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 border-t border-ink/10 pt-8">
                  <div className="rounded-xl border border-ink/10 bg-fog px-4 py-3 text-sm text-slate">
                    <p className="font-semibold text-ink">SSIAD SPASAD du SIVOM</p>
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                      660 rue de Lille, 62400 Bethune
                    </p>
                    <p className="flex items-start gap-2">
                      <PhoneCall className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                      03 21 61 55 42
                    </p>
                    <p className="flex items-start gap-2">
                      <EnvelopeSimple className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                      <a href="mailto:spasad@sivom-bethunois.fr" className="text-ink">
                        spasad@sivom-bethunois.fr
                      </a>
                    </p>
                    <a
                      href="https://www.sivom-bethunois.fr/index.php/social/spasad/soins/"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
                    >
                      Site du SIVOM
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="-mx-4 bg-white py-10 sm:-mx-6 lg:-mx-8">
          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-ink">
                Autonomie & accompagnement - Service du Departement
              </h2>
              <p className="text-sm text-slate">
                Information, orientation et accompagnement des demarches liees a l'autonomie.
              </p>
            </div>
            <Card className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-[0.65fr_1.35fr]">
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-fog">
                  <img
                    src="/images/maison-autonomie.jpg"
                    alt="Maison de l'Autonomie de l'Artois"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-display text-ink">Maison de l'Autonomie de l'Artois</h3>
                  <p className="text-sm text-slate">
                    Service public departemental destine aux seniors et a leurs aidants. Il informe,
                    oriente et accompagne sur les questions liees a l'autonomie.
                  </p>
                  <p className="text-sm text-slate">Service du Departement du Pas-de-Calais.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  8 rue Boutleux, Bethune
                </p>
                <p className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  03 21 01 66 87
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="-mx-4 bg-fog/60 py-10 sm:-mx-6 lg:-mx-8">
          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-ink">
                Inclusion numerique - Apprendre l'informatique
              </h2>
              <p className="text-sm text-slate">
                Initiatives locales pour se sentir plus a l'aise avec l'informatique et les
                demarches en ligne.
              </p>
            </div>
            <Card className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-[0.65fr_1.35fr]">
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                  <img
                    src="/images/clic-solidaire.png"
                    alt="Clic Solidaire"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-display text-ink">
                    Clic Solidaire - Initiation informatique gratuite
                  </h3>
                  <p className="text-sm text-slate">
                    Vous etes senior ou rencontrez des difficultes avec l'ordinateur ou les
                    demarches administratives en ligne ? L'association Clic Solidaire propose une
                    initiation informatique gratuite.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate">
                    <li>Quand : samedi matin</li>
                    <li>Ou : Ecole Curie Colette, Vendin-les-Bethune</li>
                    <li>Tarif : gratuit</li>
                    <li>Inscriptions : en mairie</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate">
                <p className="font-semibold text-ink">Contact</p>
                <p className="flex items-start gap-2">
                  <PhoneCall className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  06 13 59 78 62
                </p>
                <p className="flex items-start gap-2">
                  <EnvelopeSimple className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                  <a href="mailto:asso.clicsolidaire@gmail.com" className="text-ink">
                    asso.clicsolidaire@gmail.com
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </section>

        <Card className="p-6">
          <h2 className="text-lg font-display text-ink">Bon a savoir</h2>
          <p className="mt-2 text-sm text-slate">
            Les services presentes sont proposes par des organismes publics ou associatifs
            reconnus. Les modalites (conditions, inscriptions, horaires) peuvent evoluer : il est
            recommande de contacter directement les services avant tout deplacement.
          </p>
        </Card>
      </div>
    );
  }

  if (slug === "aides-conseils") {
    const organismes = [
      {
        name: "Communaute d'agglomeration Bethune-Bruay (Artois Lys Romane)",
        label: "Hotel communautaire",
        address1: "100, avenue de Londres",
        address2: "62411 Bethune",
        phone: "03.21.61.50.00",
        website: "https://www.bethunebruay.fr",
        logo: "/images/logo-bethune-bruay.jpg"
      },
      {
        name: "SOLIHA (Solidaires pour l'habitat)",
        address1: "6 Rue Jean Bodel",
        address2: "62000 Arras",
        phone: "03.21.51.23.55",
        website: "https://www.soliha.fr",
        logo: "/images/logo-soliha.png"
      },
      {
        name: "Agence nationale de l'habitat (Anah)",
        label: "Communaute d'agglomeration Artois",
        address1: "100 avenue de Londres",
        address2: "62400 Bethune",
        phone: "03.21.61.50.00",
        website: "https://www.anah.fr",
        logo: "/images/logo-anah.png"
      }
    ];

    const formatPhone = (value: string) => value.replace(/\s+/g, "");

    return (
      <div className="space-y-10">
        <CenteredPageHeader
          label="Vie pratique"
          title="Les aides a l'amelioration de l'habitat"
        />
        <section className="space-y-4">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="flex items-center justify-center rounded-2xl border border-ink/10 bg-fog p-4">
              <img
                src="/images/aides-habitat.png"
                alt="Illustration des aides a l'amelioration de l'habitat"
                className="h-auto w-1/2 object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-sm text-slate">
              Des aides peuvent etre accordees selon votre situation et la nature des travaux
              (credits d'impot, subventions, accompagnements techniques). Les organismes ci-dessous
              peuvent vous informer, vous orienter et vous guider dans vos demarches.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {organismes.map((org) => (
              <Card key={org.name} className="p-6 space-y-4">
                <div className="flex h-20 items-center justify-center rounded-xl border border-ink/10 bg-fog p-2">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={`Logo ${org.name}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
                      Logo
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-ink/80">
                  {org.label ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                      {org.label}
                    </p>
                  ) : null}
                  <p className="font-semibold text-ink">{org.name}</p>
                  <p>{org.address1}</p>
                  <p>{org.address2}</p>
                  <a href={`tel:${formatPhone(org.phone)}`} className="text-ink/80">
                    {org.phone}
                  </a>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-2 text-rose-600 hover:underline"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    {org.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 hover:border-gold/40 hover:bg-goldSoft/40"
                >
                  Voir le site
                </a>
              </Card>
            ))}
          </div>
        </section>

        <Card className="p-6">
          <p className="text-sm text-slate">
            Besoin d'aide pour vos demarches ? Contactez{" "}
            <a href="/nous-contacter" className="font-semibold text-ink">
              la mairie
            </a>{" "}
            ou{" "}
            <a
              href="https://www.france-services.gouv.fr/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink"
            >
              France Services
            </a>
            .
          </p>
        </Card>
      </div>
    );
  }

  if (slug === "permis-louer") {
    const cerfaHref = "/docs/cerfa-permis-louer.pdf";
    const secteursDocHref = "/docs/permis-louer-secteurs.pdf";
    const plaquetteHref = "/docs/plaquette-permis-louer.pdf";
    let heroImageUrl: string | null = "/images/permis-louer-hero.png";
    let heroId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const heroResponse = await payload.find({
        collection: "page-heroes",
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: "permis-louer"
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
      heroImageUrl = "/images/permis-louer-hero.png";
      heroId = null;
    }
    const secteurs = [
      "La liste detaillee des rues concernees est disponible dans le document officiel ci-dessous."
    ];
    const contactRows = [
      {
        label: "Site",
        value: "www.bethunebruay.fr",
        href: "https://www.bethunebruay.fr"
      },
      {
        label: "Email",
        value: "permisdelouer@bethunebruay.fr",
        href: "mailto:permisdelouer@bethunebruay.fr"
      },
      {
        label: "Horaires",
        value: "Lundi et jeudi de 14h a 17h + mercredi de 9h a 12h"
      },
      {
        label: "Telephone",
        value: "03.21.61.50.05",
        href: "tel:0321615005",
        accent: true
      }
    ];

    return (
      <div className="space-y-10">
        <HeroAdmin
          slug="permis-louer"
          eyebrow="Vie pratique"
          title="Permis de louer"
          subtitle="Mise en location encadree pour lutter contre l'habitat indigne."
          alt="Permis de louer"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />
        <CenteredPageHeader label="Vie pratique" title="Permis de louer" />

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-display text-ink">
                Un permis de louer pour lutter contre le logement indigne
              </h2>
              <div className="space-y-3 text-sm text-slate">
                <p>
                  L'objectif est de <strong>controler l'etat du logement mis en location</strong>{" "}
                  et de lutter contre l'habitat indigne.
                </p>
                <p>
                  La demande se fait via un formulaire CERFA accompagne des{" "}
                  <strong>diagnostics obligatoires</strong>.
                </p>
                <p>
                  Une visite de controle peut etre organisee et des travaux peuvent etre demandes
                  avant la mise en location. <strong>Jusqu'a 15 000 EUR d'amende</strong> en cas
                  d'infraction.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={cerfaHref}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Telecharger le CERFA - Demande d'autorisation prealable de mise en location
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <PdfLightboxButton
                src={plaquetteHref}
                label="Consulter la plaquette explicative (PDF)"
                title="Plaquette permis de louer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 hover:border-gold/40 hover:bg-goldSoft/40"
              />
            </div>

            <Card className="p-5 space-y-2">
              <h3 className="text-lg font-display text-ink">Documents a prevoir</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate">
                <li>Formulaire CERFA</li>
                <li>Diagnostics (DPE, gaz/electricite, plomb avant 1949, amiante avant 1997...)</li>
                <li>Pieces complementaires selon la situation</li>
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-3 bg-fog/70">
              <h3 className="text-lg font-display text-ink">Secteurs concernes</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate">
                {secteurs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <PdfLightboxButton
                src={secteursDocHref}
                label="Consulter la liste des rues (PDF)"
                title="Liste des rues concernees"
              />
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Informations pratiques
              </div>
              <div className="space-y-3 px-5 py-4">
                {contactRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-slate"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                      {row.label}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        target={row.href.startsWith("http") ? "_blank" : undefined}
                        rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                        className={row.accent ? "text-ink font-semibold text-base" : "text-ink"}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <p className="text-ink">{row.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (slug === "bailleurs-sociaux") {
    const organismes = [
      {
        name: "Pas-de-Calais habitat",
        address1: "40, Grand Place",
        address2: "62400 Bethune",
        phone: "03.21.62.62.62",
        website: "http://www.pasdecalais-habitat.fr",
        logo: "/images/pdc-habitat.jpg"
      },
      {
        name: "Maisons & cites",
        address1: "21 bis rue Beharrelle",
        address2: "62290 Noeux les Mines",
        phone: "03.21.08.08.56",
        website: "https://www.maisonsetcites.fr",
        logo: "/images/maisons-cites.png"
      },
      {
        name: "GROUPE SIA",
        address1: "Residence Stendhal, 7 rue Jean-Jacques Rousseau",
        address2: "62290 Noeux les Mines",
        phone: "09.69.32.12.18",
        website: "https://www.sia-habitat.com",
        logo: "/images/sia.jpg"
      },
      {
        name: "Tisserin Habitat",
        address1: "7 rue de Tenremonde",
        address2: "59000 Lille",
        phone: "03.20.63.40.44",
        website: "https://www.tisserin-habitat.com",
        logo: "/images/tisserin-habitat.png"
      },
      {
        name: "Habitat 62/59 Picardie",
        address1: "34 rue du Docteur Denin - CS 70216",
        address2: "62404 Bethune",
        phone: "03.21.61.33.00",
        website: "https://www.habitathdf.fr",
        logo: "/images/habitat-62-59.jpg"
      }
    ];

    const formatPhone = (value: string) => value.replace(/\s+/g, "");

    return (
      <div className="space-y-8 rounded-3xl border border-ink/10 bg-white p-6">
        <CenteredPageHeader label="Vie pratique" title="Bailleurs sociaux" />

        <div className="grid gap-6 md:grid-cols-2">
          {organismes.map((org) => (
            <div
              key={org.name}
              className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-5 sm:flex-row sm:items-center"
            >
              <div className="flex h-24 w-28 flex-shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-fog p-2">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={`Logo ${org.name}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
                    Logo
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-ink/80">
                <p className="font-semibold text-ink">{org.name}</p>
                <p>{org.address1}</p>
                <p>{org.address2}</p>
                <a href={`tel:${formatPhone(org.phone)}`} className="text-ink/80">
                  {org.phone}
                </a>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-2 text-rose-600 hover:underline"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {org.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "secours-populaire") {
    const contactAddress =
      "198 rue Francois Mitterrand, 62232 Vendin-les-Bethune";
    const itineraryUrl =
      "https://www.google.com/maps?q=198%20rue%20Francois%20Mitterrand%2C%2062232%20Vendin-les-Bethune";

    return (
      <div className="space-y-12">
        <section className="relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden bg-fog">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,99,182,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,190,70,0.15),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate">
                Solidarite
              </p>
              <h1 className="text-3xl font-display uppercase tracking-tight text-accent sm:text-5xl">
                Secours populaire - Vendin / Oblinghem
              </h1>
              <p className="max-w-2xl text-sm text-slate sm:text-base">
                Association locale d'accueil, d'ecoute et d'entraide. Le comite peut accompagner
                et orienter, selon la situation et les dispositifs existants.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="rounded-3xl border border-ink/10 bg-white p-4 shadow-card">
                <img
                  src="/images/secours-populaire-logo.png"
                  alt="Secours populaire"
                  className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Secours populaire - Comite de Vendin / Oblinghem
                </p>
                <h2 className="text-xl font-display text-ink">
                  Secours populaire francais - Comite de Vendin / Oblinghem
                </h2>
                <p className="text-sm text-slate">{contactAddress}</p>
                <p className="text-sm text-slate">03 21 57 97 13</p>
                <p className="text-sm text-slate">
                  Horaires : lundi 09:00-10:00 ; jeudi 09:00-10:00 ; autres jours fermes
                </p>
              </div>
              <a
                href="https://www.secourspopulaire.fr/62-vendin-oblinghem/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Voir la fiche locale
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.secourspopulaire.fr/62-vendin-oblinghem/nous-contacter/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_rgba(12,44,132,0.28)]"
              >
                Contacter l'association
              </a>
              <a
                href="https://www.secourspopulaire.fr/62-vendin-oblinghem/devenir-benevole/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Devenir benevole
              </a>
              <a
                href="https://don.secourspopulaire.fr/defaut/~mon-don?ns_ira_cr_arg=IyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyPIl%2FJzUQT3DqI%2FCwe5vm9rbBHSdzUdFqOrAJDMAZGms4icrP8Jzyj99QqfwPgXKV5h%2FmCS3HY0MzuHnqVzUCc4&_cv=1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Faire un don
              </a>
              <a
                href={itineraryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
              >
                Itineraire
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-display text-ink">
              Ce que fait le Secours populaire
            </h2>
            <div className="space-y-3 text-sm text-slate">
              <p>
                Association de terrain, independante et decentralisee, qui agit au plus pres des
                personnes en difficulte.
              </p>
              <p>Association loi 1901 reconnue d'utilite publique.</p>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
              <li>Aide alimentaire (distributions, dispositifs adaptes selon le comite)</li>
              <li>Accueil, ecoute et orientation</li>
              <li>Possibles accompagnements selon les besoins (modalites locales)</li>
            </ul>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-display text-ink">
              Aide alimentaire : comment ca marche ?
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate">
              <li>Public concerne : toute personne en difficulte pour se nourrir.</li>
              <li>
                Les comites organisent des distributions, libre-service ou marches solidaires,
                selon les modalites locales.
              </li>
              <li>
                Les horaires et conditions sont propres a chaque comite : contactez le comite
                local.
              </li>
            </ul>
            <a
              href="https://www.secourspopulaire.fr/nos-actions/aide-alimentaire/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
            >
              En savoir plus sur l'aide alimentaire
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </Card>
        </section>

        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                Aussi utile
              </p>
              <h2 className="text-xl font-display text-ink">CCAS de Vendin-les-Bethune</h2>
              <p className="text-sm text-slate">CCAS - Rue de la Mairie - 03 21 57 26 21</p>
            </div>
            <a
              href="/vie-pratique/ccas"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
            >
              Page du CCAS
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </Card>
      </div>
    );
  }

  if (slug === "urbanisme") {
    let heroImageUrl: string | null = "/images/urbanisme-hero.png";
    let heroId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const heroResponse = await payload.find({
        collection: "page-heroes",
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: "urbanisme"
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
      heroImageUrl = "/images/urbanisme-hero.png";
      heroId = null;
    }

    const urbanismeCards = [
      {
        title: "Certificat d'urbanisme",
        description:
          "Le certificat d'urbanisme precise les regles applicables a un terrain et informe sur les possibilites de construction ou de realisation d'un projet.",
        href: "https://www.service-public.gouv.fr/particuliers/vosdroits/R1970",
        image: "/images/certificat-urbanisme.png",
        alt: "Plan et maquette urbaine"
      },
      {
        title: "Declaration prealable de travaux",
        description:
          "La declaration prealable est une autorisation necessaire pour certains travaux (extension, modification de facade, abri, cloture, etc.) lorsque le permis de construire n'est pas requis.",
        href: "https://www.service-public.gouv.fr/particuliers/vosdroits/F17578",
        image: "/images/declaration-prealable.png",
        alt: "Travaux et renovation"
      },
      {
        title: "Permis de construire",
        description:
          "Le permis de construire est une autorisation d'urbanisme obligatoire pour les projets de construction ou certains travaux importants, selon la nature et la surface du projet.",
        href: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1986",
        image: "/images/permis-construire.png",
        alt: "Chantier et batiment"
      }
    ];

    return (
      <div className="space-y-8">
        <HeroAdmin
          slug="urbanisme"
          eyebrow="Vie pratique"
          title="Urbanisme"
          subtitle="Demarches urbanisme, permis et liens vers les services publics."
          alt="Urbanisme"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />
        <CenteredPageHeader
          label="Vie pratique"
          title="Urbanisme"
          description="Demarches urbanisme, permis et liens vers les services publics."
        />
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-display text-accent">
              Urbanisme : vos demarches principales
            </h2>
            <p className="text-sm text-slate">
              Certificats, declarations et autorisations de travaux.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {urbanismeCards.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Card className="h-full p-4 sm:p-5">
                  <div className="space-y-3">
                    <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-sand/60">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-display text-accent">{item.title}</h3>
                      <p className="text-sm text-slate">{item.description}</p>
                      <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-gold/40 hover:bg-goldSoft/40">
                        En savoir plus
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        <UrbanismeResourcesTabs />
      </div>
    );
  }

  if (slug === "reseaux") {
    let heroImageUrl: string | null = "/images/reseaux-hero.png";
    let heroId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const heroResponse = await payload.find({
        collection: "page-heroes",
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: "reseaux"
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
      heroImageUrl = "/images/reseaux-hero.png";
      heroId = null;
    }

    const page = basePages[slug];
    if (!page) return notFound();

    return (
      <div className="space-y-8">
        <HeroAdmin
          slug="reseaux"
          eyebrow="Vie pratique"
          title={page.title}
          subtitle={page.description}
          alt={page.title}
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />
        <CenteredPageHeader label="Vie pratique" title={page.title} description={page.description} />
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-display text-ink">Reseaux</h2>
            <p className="text-sm text-slate">
              Informations essentielles sur les reseaux et services techniques.
            </p>
          </div>
          <ReseauxAccordion />
        </section>
      </div>
    );
  }

  if (slug === "dechets") {
    let heroImageUrl: string | null = "/images/banniere-dechets.png";
    let heroId: string | null = null;

    try {
      const payload = await getPayload({ config: configPromise });
      const heroResponse = await payload.find({
        collection: "page-heroes",
        depth: 1,
        limit: 1,
        where: {
          slug: {
            equals: "dechets"
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
      heroImageUrl = "/images/banniere-dechets.png";
      heroId = null;
    }

    const scheduleCards = [
      {
        title: "Ordures menageres",
        badge: "Bac fonce",
        badgeClass: "bg-ink text-white",
        icon: "trash",
        day: "Vendredi",
        time: "A partir de 13h30",
        frequency: "Chaque semaine",
        href: "/images/dechet-menagers.png"
      },
      {
        title: "Dechets recyclables",
        badge: "Bac jaune",
        badgeClass: "bg-gold text-ink",
        icon: "recycle",
        day: "Vendredi",
        time: "A partir de 13h30",
        frequency: "Une semaine sur deux (semaines impaires)",
        href: "/images/dechet-recyclable.png"
      },
      {
        title: "Dechets vegetaux",
        badge: "Bac vert",
        badgeClass: "bg-accentSoft text-accent",
        icon: "leaf",
        day: "Mardi",
        time: "A partir de 13h30",
        frequency: "Du 8 avril au 15 novembre (hebdomadaire)",
        href: "/images/dechet-vert.png"
      },
      {
        title: "Verre",
        badge: "Apport volontaire",
        badgeClass: "bg-fog text-ink",
        icon: "wine",
        day: "Depots en colonnes",
        time: "Libre acces",
        frequency: "Toute l'annee",
        href: "/images/dechet-verres.png"
      }
    ];

    const dechetteries = [
      "Bruay-La-Buissiere",
      "Marles-les-Mines",
      "Calonne-Ricouart",
      "Noeux-les-Mines",
      "Bethune",
      "Haisnes-les-La-Bassee",
      "Ruitz",
      "Lillers",
      "Saint-Venant",
      "Isbergues",
      "Houdain"
    ];

    return (
      <div className="space-y-12">
        <HeroAdmin
          slug="dechets"
          eyebrow="Vie pratique"
          title="Gestion des dechets a Vendin-les-Bethune"
          subtitle="Collectes, tri, dechetteries et services pratiques."
          alt="Gestion des dechets"
          initialImageUrl={heroImageUrl}
          initialHeroId={heroId}
          showText={false}
        />
        <CenteredPageHeader
          label="Vie pratique"
          title="Gestion des dechets a Vendin-les-Bethune"
          description="Collectes, tri, dechetteries et services pratiques."
        />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-display text-ink">Jours et horaires de collecte</h2>
            <p className="text-sm text-slate">
              Verifiez le bac a sortir selon le type de dechet.
            </p>
          </div>
          <DechetsSchedule
            cards={scheduleCards.map((item) => ({
              ...item,
              image: item.href
            }))}
          />
        </section>

        <section className="grid gap-6">
          <Card className="p-6 space-y-5 border-l-4 border-ink/70">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                <Trash className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">
                  Dechets menagers (bac a couvercle fonce)
                </h3>
                <p className="text-sm text-slate">Collecte une fois par semaine.</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Ce que vous pouvez jeter
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Emballages souilles ou non vides</li>
                  <li>Restes de repas</li>
                  <li>Polystyrene</li>
                  <li>Couches et papiers souilles</li>
                  <li>Verre non recyclable (vaisselle)</li>
                  <li>Vitres cassees</li>
                  <li>Vaisselle, vases, miroirs casses</li>
                  <li>Pots de fleurs casses</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Ce qui est interdit
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Dechets recyclables</li>
                  <li>Dechets verts</li>
                  <li>Verre d'apport volontaire</li>
                  <li>Amiante</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Bonnes pratiques
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Bac presente couvercle ferme</li>
                  <li>Sortir le bac le jour de collecte</li>
                  <li>Rentrer le bac apres passage</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5 border-l-4 border-gold/70">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-ink">
                <Recycle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">
                  Dechets recyclables (bac a couvercle jaune)
                </h3>
                <p className="text-sm text-slate">Collecte en vrac une semaine sur deux.</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Ce que vous pouvez jeter
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Cartons et emballages carton</li>
                  <li>Bouteilles et flacons plastiques</li>
                  <li>Emballages metalliques</li>
                  <li>Tous les papiers</li>
                  <li>Barquettes, pots et boites alimentaires</li>
                  <li>Sachets, gourdes, tubes</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Ce qui est interdit
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Emballages souilles non vides</li>
                  <li>Sacs fermes</li>
                  <li>Verre</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Bonnes pratiques
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Deplier les cartons</li>
                  <li>Mettre les papiers a plat</li>
                  <li>Ecraser les bouteilles</li>
                  <li>Les grands cartons vont en dechetterie</li>
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-goldSoft/40 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">
                Pourquoi une collecte tous les 15 jours ?
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Securite des agents</li>
                <li>Maitrise des couts</li>
                <li>Amelioration du tri selectif</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 space-y-5 border-l-4 border-accent/70">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">Dechets verts</h3>
                <p className="text-sm text-slate">
                  Collecte hebdomadaire du 8 avril au 15 novembre.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Dechets concernes
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Tontes de pelouse</li>
                  <li>Tailles de haies et arbustes</li>
                  <li>Fleurs et feuilles mortes</li>
                  <li>Residus d'elagage et debroussaillage</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Regles importantes
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Seul le bac vert officiel est collecte</li>
                  <li>Aucun melange avec d'autres dechets</li>
                  <li>Pas de sacs ou bacs a cote</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Bonnes pratiques
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Bac sorti couvercle ferme, poignees vers la route</li>
                  <li>Bac rentre apres la collecte</li>
                  <li>Entretien du bac a la charge de l'usager</li>
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accentSoft/40 p-4 text-sm text-slate">
              <p className="font-semibold text-ink">Collecte de branchages sur rendez-vous</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>30 EUR forfait deplacement</li>
                <li>15 EUR / m3</li>
                <li>
                  Contact:{" "}
                  <a href="mailto:collecte@bethunebruay.fr" className="font-semibold text-ink">
                    collecte@bethunebruay.fr
                  </a>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 space-y-5 border-l-4 border-fog">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fog text-ink">
                <Wine className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">Verre - Apport volontaire</h3>
                <p className="text-sm text-slate">
                  Depot dans les colonnes a verre reparties sur la commune.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  A deposer
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Bouteilles</li>
                  <li>Flacons</li>
                  <li>Bocaux</li>
                  <li>Pots a confiture</li>
                  <li>Petits pots bebe (sans couvercle)</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  A ne pas deposer
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate">
                  <li>Ampoules</li>
                  <li>Vaisselle</li>
                  <li>Vitres</li>
                  <li>Vases</li>
                  <li>Miroirs</li>
                  <li>Porcelaine</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Le + du verre
                </p>
                <p className="mt-3 text-sm text-slate">
                  Le verre est 100 % recyclable a l'infini.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5 border-l-4 border-warning">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warningSoft text-warning">
                <WarningCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">
                  Amiante - collecte a domicile uniquement
                </h3>
                <p className="text-sm text-slate">
                  Depot en dechetterie interdit. Collecte exclusivement a domicile.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Demarche
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate">
                  <li>Demande via la plateforme Mes demarches</li>
                  <li>Visite d'un agent pour evaluer la quantite</li>
                  <li>Remise des contenants et consignes de securite</li>
                  <li>Prise de rendez-vous pour l'enlevement</li>
                  <li>Depot des big-bags fermes la veille sur le domaine public</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-warning/20 bg-warningSoft/60 p-4 text-sm text-slate">
                <p className="font-semibold text-ink">Attention</p>
                <p className="mt-2">
                  Respectez strictement les consignes pour la manipulation et le conditionnement.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5 border-l-4 border-ink/40">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/10 text-ink">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-display text-ink">Dechetteries</h3>
                <p className="text-sm text-slate">
                  Charte de bonne conduite et conditions d'acces.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Regles d'acces
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                    <p className="font-semibold text-ink">Engagements usager</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Resider sur le territoire CABBALR</li>
                      <li>Dechets d'origine domestique uniquement</li>
                      <li>Depot sauvage interdit</li>
                      <li>Recuperation interdite</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                    <p className="font-semibold text-ink">Avant la visite</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Justificatif de domicile (-3 mois)</li>
                      <li>Pre-tri des dechets</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                    <p className="font-semibold text-ink">Sur place</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Rouler au pas</li>
                      <li>Enfants & animaux dans le vehicule</li>
                      <li>Courtoisie envers agents et usagers</li>
                      <li>Ouverture des sacs si demande</li>
                      <li>Dechargement par l'usager</li>
                      <li>Nettoyage de l'emplacement</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-warning">
                  Non-respect = exclusion possible
                </p>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Les 11 dechetteries disponibles
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {dechetteries.map((name) => (
                    <li key={name} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Dechets acceptes gratuitement
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>Electromenager</li>
                  <li>Bois, ferraille, gravats</li>
                  <li>Encombrants, mobilier</li>
                  <li>Dechets verts</li>
                  <li>Pneus, carton, papier</li>
                  <li>Piles</li>
                  <li>Huiles (noire & friture)</li>
                  <li>Dechets diffus specifiques</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Conditions
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>Vehicules &lt; 1m90</li>
                  <li>5 m3 / semaine</li>
                  <li>20 L liquides</li>
                  <li>5 pneus max</li>
                  <li>Justificatif obligatoire</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accentSoft text-accent">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-display text-ink">Documents utiles</h2>
                <p className="text-sm text-slate">Telechargez les supports pratiques.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <a
                href="/docs/memo-tri.pdf"
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/80 hover:bg-goldSoft/50"
              >
                Memo du tri (PDF)
                <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              </a>
              <a
                href="/docs/guide-tri-2022.pdf"
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/80 hover:bg-goldSoft/50"
              >
                Guide du tri 2022 (PDF)
                <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              </a>
              <a
                href="https://www.bethunebruay.fr/fr/le-compostage"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/80 hover:bg-goldSoft/50"
              >
                Tout savoir sur le compostage
                <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              </a>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
                <PhoneCall className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-display text-ink">Contacts & demarches</h2>
                <p className="text-sm text-slate">Service collecte et informations pratiques.</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate">
              <p>
                <span className="font-semibold text-ink">Telephone:</span>{" "}
                <a href="tel:0321570878" className="font-semibold text-ink">
                  03 21 57 08 78
                </a>
              </p>
              <p>
                <span className="font-semibold text-ink">Horaires:</span> Lun-Ven 9h-12h / 13h-16h30
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
                Cite du Plat Rio, boulevard de la Republique - 62232 Annezin
              </p>
              <a
                href="https://demarches.bethunebruay.fr/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(12,44,132,0.25)]"
              >
                Mes demarches
              </a>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  const page = basePages[slug];
  if (!page) return notFound();

  return (
    <div className="space-y-8">
      <CenteredPageHeader label="Vie pratique" title={page.title} description={page.description} />
      {slug === "formation" ? (
        <p className="text-center text-3xl font-display text-ink">Page en Construction</p>
      ) : null}
    </div>
  );
}
