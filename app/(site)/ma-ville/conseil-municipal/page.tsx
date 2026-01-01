import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Card } from "@/components/Card";
import { DecorativeIcon, DecorativeIconName } from "@/components/DecorativeIcon";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";
import { HeroAdmin } from "@/components/HeroAdmin";

export const metadata = {
  title: "Conseil municipal"
};

const quickLinks = [
  {
    title: "Liste des elus",
    description: "Equipe municipale, delegations et commissions.",
    href: "/ma-ville/elu-et-delegations",
    decorativeIcon: "conseil-municipal" as DecorativeIconName
  },
  {
    title: "Comptes rendus",
    description: "Decisions et deliberations par seance.",
    href: "/ma-ville/comptes-rendus",
    decorativeIcon: "comptes-rendus" as DecorativeIconName
  }
];

type ReportDoc = { url?: string } | string | null;

type CouncilReport = {
  id: string;
  date: string;
  agendaDoc?: ReportDoc;
  minutesDoc?: ReportDoc;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export default async function ConseilMunicipalPage() {
  let heroImageUrl: string | null = "/images/conseil-municipal-hero.png";
  let heroId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const heroResponse = await payload.find({
      collection: "page-heroes",
      depth: 1,
      limit: 1,
      where: {
        slug: {
          equals: "conseil-municipal"
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
    heroImageUrl = "/images/conseil-municipal-hero.png";
    heroId = null;
  }

  let reports: CouncilReport[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "council-reports",
      depth: 1,
      sort: "-date",
      limit: 3,
      where: {
        status: {
          equals: "published"
        }
      }
    });
    reports = response.docs as CouncilReport[];
  } catch {
    reports = [];
  }

  return (
    <div className="space-y-8">
      <HeroAdmin
        slug="conseil-municipal"
        eyebrow="Ma ville"
        title="Conseil municipal"
        subtitle="Ordres du jour, comptes rendus et deliberations."
        alt="Conseil municipal"
        initialImageUrl={heroImageUrl}
        initialHeroId={heroId}
      />
      <CenteredPageHeader
        label="Vendin-les-Bethune"
        title="Conseil municipal"
        description="Hub d'information: ordres du jour, comptes rendus et seances."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Card key={item.href} className="relative overflow-hidden p-6">
            <DecorativeIcon
              name={item.decorativeIcon}
              className="pointer-events-none absolute -bottom-10 -right-8 h-[150px] w-[150px] -rotate-6 text-[#1E63B6]/15"
            />
            <div className="relative z-10 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate">Rubrique</p>
              <h2 className="text-lg font-display text-ink">{item.title}</h2>
              <p className="text-sm text-slate">{item.description}</p>
              <Link href={item.href} className="text-sm font-semibold text-accent underline">
                Consulter
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-display text-ink">Seances recentes</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Date</th>
              <th>Seance</th>
              <th>Ordre du jour</th>
              <th>Compte rendu</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td className="text-slate" colSpan={4}>
                  Aucun compte rendu disponible.
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const agendaUrl =
                  report.agendaDoc && typeof report.agendaDoc === "object"
                    ? report.agendaDoc.url
                    : null;
                const minutesUrl =
                  report.minutesDoc && typeof report.minutesDoc === "object"
                    ? report.minutesDoc.url
                    : null;
                const dateLabel = formatDate(report.date);

                return (
                  <tr key={report.id}>
                    <td className="font-semibold text-ink">{dateLabel}</td>
                    <td className="text-slate">Conseil municipal</td>
                    <td>
                      {agendaUrl ? (
                        <a href={agendaUrl} download className="text-sm font-semibold">
                          ODJ
                        </a>
                      ) : (
                        <span className="text-slate">-</span>
                      )}
                    </td>
                    <td>
                      {minutesUrl ? (
                        <a href={minutesUrl} download className="text-sm font-semibold">
                          CR
                        </a>
                      ) : (
                        <span className="text-slate">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
