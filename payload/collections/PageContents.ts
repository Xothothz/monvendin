import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const PageContents: CollectionConfig = {
  slug: "page-contents",
  labels: {
    singular: "Contenu de page",
    plural: "Contenus de page"
  },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "updatedAt"]
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug page",
      required: true,
      unique: true
    },
    {
      name: "content",
      type: "textarea",
      label: "Contenu",
      required: true
    }
  ]
};
