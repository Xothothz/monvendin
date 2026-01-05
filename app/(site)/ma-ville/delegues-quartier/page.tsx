import { getPayload } from "payload";
import configPromise from "@payload-config";
import { DelegatesClient } from "./DelegatesClient";
import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Delegues de quartier"
};

export const dynamic = "force-dynamic";

type DelegateStreet = { name?: string } | string;

type SectorStreet = { name?: string } | string;

type Sector = {
  id: string;
  number: number;
  streets?: SectorStreet[] | null;
  status?: "draft" | "published";
};

type Delegate = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  sector?: number | null;
  sectorRef?: string | { id?: string; _id?: string; number?: number } | null;
  streets?: DelegateStreet[] | null;
  status?: "draft" | "published";
  photo?: { url?: string; alt?: string } | string | null;
};

export default async function DeleguesQuartierPage() {
  let docs: Delegate[] = [];
  let sectorDocs: Sector[] = [];
  try {
    const payload = await getPayload({ config: configPromise });
    const [delegatesResponse, sectorsResponse] = await Promise.all([
      payload.find({
        collection: "delegates",
        depth: 1,
        sort: "lastName",
        limit: 200,
        where: {
          status: {
            equals: "published"
          }
        }
      }),
      payload.find({
        collection: "sectors",
        depth: 1,
        sort: "number",
        limit: 200,
        where: {
          status: {
            equals: "published"
          }
        }
      })
    ]);
    docs = delegatesResponse.docs as Delegate[];
    sectorDocs = sectorsResponse.docs as Sector[];
  } catch {
    docs = [];
    sectorDocs = [];
  }

  const delegates = docs.map((item) => ({
    ...item,
    photo: typeof item.photo === "object" ? item.photo : null
  }));

  return (
    <div className="space-y-8 section-stack">
      <CenteredPageHeader
        label="Vendin-les-Bethune"
        title="Delegues de quartier"
        description="Retrouvez les delegues par secteur et les rues rattachees."
      />

	<DelegatesClient initialDelegates={delegates as any} initialSectors={sectorDocs as any} />
    </div>
  );
}
