import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, publishedOnly } from "../access";
import { slugify } from "../utilities/slugify";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startDate", "status", "location"]
  },
  access: {
    read: publishedOnly,
    create: isStaff,
    update: isStaff,
    delete: isAdmin
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) {
          return data;
        }

        if (!data.slug && data.title) {
          return {
            ...data,
            slug: slugify(data.title)
          };
        }

        if (!data.slug && originalDoc?.slug) {
          return {
            ...data,
            slug: originalDoc.slug
          };
        }

        return data;
      }
    ],
    beforeChange: [
      ({ data, req }) => {
        if (!data) {
          return data;
        }

        if (req.user?.role === "admin") {
          return data;
        }

        if (data.status === "published") {
          return {
            ...data,
            status: "review"
          };
        }

        return data;
      }
    ]
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      admin: {
        position: "sidebar"
      },
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "En attente de validation", value: "review" },
        { label: "Publie", value: "published" }
      ]
    },
    {
      name: "startDate",
      type: "date",
      required: true
    },
    {
      name: "endDate",
      type: "date"
    },
    {
      name: "location",
      type: "text",
      required: true
    },
    {
      name: "address",
      type: "text"
    },
    {
      name: "summary",
      type: "textarea",
      required: true
    },
    {
      name: "description",
      type: "textarea"
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "externalLink",
      type: "text"
    }
  ]
};
