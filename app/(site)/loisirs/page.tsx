import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Loisirs"
};

const items = [
  {
    title: "Vie associative",
    description: "Associations A a Z, mode d'emploi et subventions.",
    link: "/loisirs/associations-a-z"
  },
  {
    title: "Culture",
    description: "Mediatheque, ecole de musique, equipements.",
    link: "/loisirs/culture"
  },
  {
    title: "Sport",
    description: "Clubs et equipements de plein air.",
    link: "/loisirs/clubs"
  }
];

export default function LoisirsPage() {
  return (
    <div className="space-y-8 section-stack">
      <header className="space-y-3">
        <PageTitle title="Loisirs" />
        <p className="text-slate max-w-2xl">
          Vie associative, culture et sport pour tous.
        </p>
      </header>
      <div className="card-grid">
        {items.map((item) => (
          <Card key={item.title} className="p-6 flex flex-col gap-3">
            <h3 className="text-lg font-display">{item.title}</h3>
            <p className="text-sm text-slate flex-1">{item.description}</p>
            <Link href={item.link} className="text-sm font-semibold text-ink">
              Acceder
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
