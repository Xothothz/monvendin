import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const HistorySections: CollectionConfig = {
  slug: "history-sections",
  labels: {
    singular: "Section histoire",
    plural: "Sections histoire"
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "period", "order", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageHistorySections"),
    create: hasPermissionAccess("manageHistorySections"),
    update: hasPermissionAccess("manageHistorySections"),
    delete: hasPermissionAccess("manageHistorySections")
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true
    },
    {
      name: "period",
      type: "text",
      label: "Periode",
      admin: {
        description: "Ex: XIXe siecle"
      }
    },
    {
      name: "content",
      type: "textarea",
      label: "Texte",
      required: true,
      admin: {
        description: "Saisir un paragraphe par ligne vide."
      }
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Illustration de la section."
      }
    },
    {
      name: "imageAlt",
      type: "text",
      label: "Texte alternatif image"
    },
    {
      name: "order",
      type: "number",
      label: "Ordre",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Plus petit = plus haut dans la liste."
      }
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      admin: {
        position: "sidebar"
      },
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "Publie", value: "published" }
      ]
    }
  ]
};
