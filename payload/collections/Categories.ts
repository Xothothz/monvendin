import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";
import { slugify } from "../utilities/slugify";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"]
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.slug && data?.name) {
          return {
            ...data,
            slug: slugify(data.name)
          };
        }

        return data;
      }
    ]
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true
    },
    {
      name: "color",
      type: "text",
      admin: {
        description: "Exemple: #1C329C (couleur d'accent pour le filtre)."
      }
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0
    }
  ]
};
