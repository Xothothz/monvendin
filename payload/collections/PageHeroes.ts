import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

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
    create: hasPermissionAccess("managePageHeroes"),
    update: hasPermissionAccess("managePageHeroes"),
    delete: hasPermissionAccess("managePageHeroes")
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
