import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const PageTexts: CollectionConfig = {
  slug: "page-texts",
  labels: {
    singular: "Texte de page",
    plural: "Textes de page"
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
      name: "intro",
      type: "textarea",
      label: "Texte introductif"
    },
    {
      name: "missions",
      type: "array",
      label: "Missions",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Mission",
          required: true
        }
      ]
    }
  ]
};
