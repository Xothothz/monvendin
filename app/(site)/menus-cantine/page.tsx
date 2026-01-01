import { PageTitle } from "@/components/PageTitle";
import { menus } from "@/lib/data";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";

export const metadata = {
  title: "Menus de cantine"
};

export default function MenusCantinePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Menus de cantine" />
        <p className="text-slate max-w-2xl">
          Menus accessibles en HTML par semaine. Les allergenes sont indiques quand disponibles.
        </p>
      </header>
      <div className="space-y-6">
        {menus.map((week) => (
          <Card key={week.id} className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title">Semaine du {week.week}</h2>
              {week.pdf && (
                <Button href={week.pdf} variant="secondary">
                  Version PDF
                </Button>
              )}
            </div>
            <Table>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Menu</th>
                  <th>Allergenes</th>
                </tr>
              </thead>
              <tbody>
                {week.days.map((day) => (
                  <tr key={day.day}>
                    <td className="font-semibold text-ink">{day.day}</td>
                    <td>
                      <ul className="text-sm text-slate space-y-1">
                        {day.lunch.map((dish) => (
                          <li key={dish}>{dish}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {day.allergens ? (
                        <ul className="text-sm text-slate space-y-1">
                          {day.allergens.map((allergen) => (
                            <li key={allergen}>{allergen}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate">Donnees non fournies</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        ))}
      </div>
    </div>
  );
}
