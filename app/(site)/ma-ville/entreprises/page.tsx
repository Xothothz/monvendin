import { getPayload } from "payload";
import configPromise from "@payload-config";
import { AnnuaireTable } from "@/components/AnnuaireTable";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Annuaire des entreprises"
};

export default async function EntreprisesPage() {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "annuaire",
    depth: 0,
    page: 1,
    limit: 10,
    sort: "denomination"
  });

  return (
    <div className="space-y-8 section-stack">
      <CenteredPageHeader
        label="Economie"
        title="Annuaire des entreprises"
        description="Consultez les entreprises et services locaux. Les mises a jour sont faites directement sur cette page par l'administration."
      />
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <AnnuaireTable
            initialData={{
              docs: result.docs,
              totalDocs: result.totalDocs,
              totalPages: result.totalPages,
              page: result.page ?? 1,
              limit: result.limit ?? 20
            }}
          />
        </div>
      </div>
    </div>
  );
}
