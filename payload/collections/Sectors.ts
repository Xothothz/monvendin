import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const Sectors: CollectionConfig = {
  slug: "sectors",
  labels: {
    singular: "Secteur",
    plural: "Secteurs"
  },
  admin: {
    useAsTitle: "number",
    defaultColumns: ["number", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageSectors"),
    create: hasPermissionAccess("manageSectors"),
    update: hasPermissionAccess("manageSectors"),
    delete: hasPermissionAccess("manageSectors")
  },
  fields: [
    {
      name: "number",
      type: "number",
      label: "Numero de secteur",
      required: true,
      unique: true,
      admin: {
        width: "50%"
      }
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      admin: {
        width: "50%",
        description: "Publie pour afficher sur le site."
      },
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "Publie", value: "published" }
      ]
    },
    {
      name: "streets",
      type: "array",
      label: "Rues du secteur",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Nom de rue",
          required: true
        }
      ]
    }
  ]
};
