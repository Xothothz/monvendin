import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const hasCategory = (item: unknown) =>
  Boolean(item && typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "category"));

const stripCategoryFromItems = (items: unknown) => {
  if (!Array.isArray(items)) {
    return { items, changed: false, removed: 0 };
  }
  let changed = false;
  let removed = 0;
  const nextItems = items.map((item) => {
    if (!hasCategory(item)) {
      return item;
    }
    removed += 1;
    changed = true;
    const { category: _category, ...rest } = item as Record<string, unknown>;
    return rest;
  });
  return { items: changed ? nextItems : items, changed, removed };
};

const cleanCategories = (categories: unknown) => {
  if (!Array.isArray(categories)) {
    return { categories, changed: false, removed: 0 };
  }
  let changed = false;
  let removed = 0;
  const nextCategories = categories.map((category) => {
    if (!category || typeof category !== "object") {
      return category;
    }
    const itemsResult = stripCategoryFromItems((category as any).items);
    removed += itemsResult.removed;
    if (!itemsResult.changed) {
      return category;
    }
    changed = true;
    return { ...category, items: itemsResult.items };
  });
  return {
    categories: changed ? nextCategories : categories,
    changed,
    removed
  };
};

const cleanGroups = (groups: unknown) => {
  if (!Array.isArray(groups)) {
    return { groups, changed: false, removed: 0 };
  }
  let changed = false;
  let removed = 0;
  const nextGroups = groups.map((group) => {
    if (!group || typeof group !== "object") {
      return group;
    }
    let groupChanged = false;
    let nextGroup = group as Record<string, unknown>;

    const itemsResult = stripCategoryFromItems((group as any).items);
    removed += itemsResult.removed;
    if (itemsResult.changed) {
      groupChanged = true;
      nextGroup = { ...nextGroup, items: itemsResult.items };
    }

    const categoriesResult = cleanCategories((group as any).categories);
    removed += categoriesResult.removed;
    if (categoriesResult.changed) {
      groupChanged = true;
      nextGroup = { ...nextGroup, categories: categoriesResult.categories };
    }

    if (groupChanged) {
      changed = true;
      return nextGroup;
    }
    return group;
  });
  return { groups: changed ? nextGroups : groups, changed, removed };
};

const cleanServicesSection = (section: Record<string, unknown>) => {
  let changed = false;
  let removed = 0;
  let nextSection = section;

  const itemsResult = stripCategoryFromItems(section.items);
  removed += itemsResult.removed;
  if (itemsResult.changed) {
    changed = true;
    nextSection = { ...nextSection, items: itemsResult.items };
  }

  const groupsResult = cleanGroups(section.groups);
  removed += groupsResult.removed;
  if (groupsResult.changed) {
    changed = true;
    nextSection = { ...nextSection, groups: groupsResult.groups };
  }

  return { section: changed ? nextSection : section, changed, removed };
};

const cleanPages = (pages: unknown) => {
  if (!pages || typeof pages !== "object") {
    return { pages, changed: false, removed: 0 };
  }
  let changed = false;
  let removed = 0;
  const nextPages: Record<string, unknown> = { ...(pages as Record<string, unknown>) };

  for (const [key, value] of Object.entries(pages as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const sections = Array.isArray((value as any).sections)
      ? ((value as any).sections as Record<string, unknown>[])
      : [];
    if (sections.length === 0) continue;

    let sectionsChanged = false;
    const nextSections = sections.map((section) => {
      if ((section as any).blockType !== "services") {
        return section;
      }
      const result = cleanServicesSection(section);
      removed += result.removed;
      if (result.changed) {
        sectionsChanged = true;
        return result.section;
      }
      return section;
    });

    if (sectionsChanged) {
      changed = true;
      nextPages[key] = { ...(value as Record<string, unknown>), sections: nextSections };
    }
  }

  return { pages: changed ? nextPages : pages, changed, removed };
};

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? request.headers.get("x-admin-secret");
  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayload({ config: configPromise });

  let scanned = 0;
  let updated = 0;
  let removed = 0;

  let page = 1;
  let totalPages = 1;
  const limit = 50;

  do {
    const result = await payload.find({
      collection: "pro-pages",
      limit,
      page,
      depth: 0,
      overrideAccess: true
    });
    totalPages = result.totalPages ?? 1;

    for (const doc of result.docs ?? []) {
      scanned += 1;
      const cleanResult = cleanPages((doc as any).pages);
      removed += cleanResult.removed;
      if (!cleanResult.changed) {
        continue;
      }
      await payload.update({
        collection: "pro-pages",
        id: (doc as any).id,
        data: { pages: cleanResult.pages },
        depth: 0,
        overrideAccess: true
      });
      updated += 1;
    }

    page += 1;
  } while (page <= totalPages);

  return NextResponse.json({ scanned, updated, removed });
};
