import type { CollectionConfig } from "payload";
import { isAuthenticated } from "../access";

export const PageHeroes: CollectionConfig = {
  slug: "page-heroes",
  labels: {
    singular: "Banniere",
    plural: "Bannieres"
  },
  admin: {
    useAsTitle: "slug"
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated
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
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true
    }
  ]
};
