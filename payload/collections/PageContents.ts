import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

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
    create: hasPermissionAccess("managePageContents"),
    update: hasPermissionAccess("managePageContents"),
    delete: hasPermissionAccess("managePageContents")
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
