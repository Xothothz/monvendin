import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";
import { hasPermission, type UserWithPermissions } from "../../lib/permissions";
import { slugify } from "../utilities/slugify";

export const Actualites: CollectionConfig = {
  slug: "actualites",
  labels: {
    singular: "Actualite",
    plural: "Actualites"
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "category", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageActualites"),
    create: hasPermissionAccess("manageActualites"),
    update: hasPermissionAccess("manageActualites"),
    delete: hasPermissionAccess("manageActualites")
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data;

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
        if (!data) return data;

        const canPublish = hasPermission(req.user as UserWithPermissions, "canPublish");
        if (canPublish) return data;

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
      label: "Titre",
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
      name: "date",
      type: "date",
      label: "Date",
      required: true
    },
    {
      name: "category",
      type: "text",
      label: "Categorie",
      required: true
    },
    {
      name: "summary",
      type: "textarea",
      label: "Resume",
      required: true
    },
    {
      name: "content",
      type: "textarea",
      label: "Contenu",
      required: true
    },
    {
      name: "images",
      type: "array",
      label: "Images",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true
        },
        {
          name: "alt",
          type: "text",
          label: "Texte alternatif"
        }
      ]
    },
    {
      name: "attachments",
      type: "array",
      label: "Documents PDF",
      fields: [
        {
          name: "file",
          type: "upload",
          relationTo: "files",
          required: true
        },
        {
          name: "label",
          type: "text",
          label: "Titre"
        }
      ]
    },
    {
      name: "sources",
      type: "array",
      label: "Sources",
      fields: [
        {
          name: "label",
          type: "text",
          label: "Titre",
          required: true
        },
        {
          name: "url",
          type: "text",
          label: "Lien",
          required: true
        }
      ]
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
        { label: "En attente de validation", value: "review" },
        { label: "Publie", value: "published" }
      ]
    }
  ]
};
