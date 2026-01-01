import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="space-y-6 text-center">
      <p className="text-xs uppercase text-slate">404</p>
      <PageTitle title="Page introuvable" />
      <p className="text-slate">La page demandee n'existe pas ou a ete deplacee.</p>
      <Button href="/" variant="secondary">
        Retour a l'accueil
      </Button>
    </div>
  );
}
