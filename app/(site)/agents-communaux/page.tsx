import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { cookies } from "next/headers";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Acces agents communaux"
};

const protectedLinks = [
  { label: "Documents RH", href: "/ma-ville/fiscalite" },
  { label: "Notes internes", href: "/actualites" },
  { label: "Candidatures internes", href: "/actualites" }
];

export default async function AgentsCommunauxPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token");
  const isAuthenticated = Boolean(token?.value);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Acces agents communaux" />
        <p className="text-slate max-w-2xl">
          Zone protegee reservee aux agents municipaux.
        </p>
      </header>

      {isAuthenticated ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-display text-ink">Espace agents</h2>
          <p className="text-sm text-slate">
            Acces aux documents internes et ressources RH.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {protectedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/80 hover:bg-goldSoft/70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-display text-ink">Connexion requise</h2>
          <p className="text-sm text-slate">
            Connectez-vous avec votre compte agent pour acceder a cette zone.
          </p>
          <Link href="/admin" className="text-sm font-semibold text-ink">
            Aller vers la page de connexion
          </Link>
        </Card>
      )}
    </div>
  );
}
