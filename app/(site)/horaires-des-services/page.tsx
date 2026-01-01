import { PageTitle } from "@/components/PageTitle";
import { Card } from "@/components/Card";

export const metadata = {
  title: "Horaires des services"
};

const services = [
  {
    title: "Mairie",
    address: "Place du General de Gaulle, 62232 Vendin-les-Bethune",
    phone: "03.21.57.26.21",
    fax: "03.21.01.00.03",
    email: "mairie.vendinlesbethune@wanadoo.fr",
    facebook: "ville de vendin-lez-bethune",
    website: "www.vendin-lez-bethune.fr",
    hours: [
      { day: "Lundi", hours: "08h30 - 12h00 / 13h30 - 18h00" },
      { day: "Mardi", hours: "08h30 - 12h00 / 13h30 - 17h00" },
      { day: "Mercredi", hours: "08h30 - 12h00 / 13h30 - 17h00" },
      { day: "Jeudi", hours: "08h30 - 12h00 / AM fermee au public" },
      { day: "Vendredi", hours: "08h30 - 12h00 / 13h30 - 17h00" }
    ]
  }
];

export default function HorairesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Horaires des services" />
        <p className="text-slate max-w-2xl">
          Coordonnees et horaires d'accueil des services municipaux.
        </p>
      </header>
      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.title} className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-display text-ink">{service.title}</h2>
                <p className="text-sm text-slate">{service.address}</p>
                <p className="text-sm text-slate">Telephone: {service.phone}</p>
                {service.fax ? <p className="text-sm text-slate">Fax: {service.fax}</p> : null}
                {service.email ? <p className="text-sm text-slate">Email: {service.email}</p> : null}
                {service.facebook ? (
                  <p className="text-sm text-slate">Facebook: {service.facebook}</p>
                ) : null}
                {service.website ? (
                  <p className="text-sm text-slate">Internet: {service.website}</p>
                ) : null}
              </div>
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Horaires</th>
                  </tr>
                </thead>
                <tbody>
                  {service.hours.map((row) => (
                    <tr key={row.day}>
                      <td className="font-semibold text-ink">{row.day}</td>
                      <td className="text-slate">{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
