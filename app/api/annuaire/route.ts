import configPromise from "@payload-config";
import { createPayloadRequest, getPayload } from "payload";

export const dynamic = "force-dynamic";

const toNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const allowedSortFields = new Set([
  "categorie",
  "sousCategorie",
  "nom",
  "prenom",
  "denomination",
  "adresse",
  "codePostal",
  "ville",
  "telephone",
  "portable",
  "mail",
  "siteInternet",
  "createdAt"
]);

const buildSort = (value: string | null) => {
  if (!value) return "denomination";
  const trimmed = value.trim();
  if (!trimmed) return "denomination";
  const isDesc = trimmed.startsWith("-");
  const field = isDesc ? trimmed.slice(1) : trimmed;
  if (!allowedSortFields.has(field)) return "denomination";
  return isDesc ? `-${field}` : field;
};

const buildWhere = (
  search: string | null,
  categorie: string | null,
  sousCategorie: string | null
) => {
  const filters: Record<string, unknown>[] = [];
  const query = search?.trim();
  if (query) {
    const fields = [
      "categorie",
      "sousCategorie",
      "nom",
      "prenom",
      "denomination",
      "adresse",
      "codePostal",
      "ville",
      "telephone",
      "portable",
      "mail",
      "siteInternet"
    ];
    filters.push({
      or: fields.map((field) => ({
        [field]: {
          contains: query
        }
      }))
    });
  }

  const categoryValue = categorie?.trim();
  if (categoryValue) {
    filters.push({
      categorie: {
        equals: categoryValue
      }
    });
  }

  const subCategoryValue = sousCategorie?.trim();
  if (subCategoryValue) {
    filters.push({
      sousCategorie: {
        contains: subCategoryValue
      }
    });
  }

  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return { and: filters };
};

export const GET = async (request: Request) => {
  const req = await createPayloadRequest({
    config: configPromise,
    request
  });
  const payload = await getPayload({ config: configPromise });
  const { searchParams } = new URL(request.url);
  const page = toNumber(searchParams.get("page"), 1);
  const limit = toNumber(searchParams.get("limit"), 10);
  const sort = buildSort(searchParams.get("sort"));
  const where = buildWhere(
    searchParams.get("search"),
    searchParams.get("categorie"),
    searchParams.get("sousCategorie")
  );

  const result = await payload.find({
    collection: "annuaire",
    depth: 0,
    page,
    limit,
    sort,
    where: where as any,
    req
  });

  return Response.json(result);
};

export const POST = async (request: Request) => {
  const req = await createPayloadRequest({
    config: configPromise,
    request
  });
  const payload = await getPayload({ config: configPromise });
  const data = await request.json().catch(() => ({}));

  try {
    const result = await payload.create({
      collection: "annuaire",
      data,
      req
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enregistrement impossible.";
    return Response.json({ message }, { status: 400 });
  }
};
