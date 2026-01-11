import type { CollectionConfig } from "payload";
import { hasAnyPermissionAccess } from "../access";

export const Documents: CollectionConfig = {
  slug: "documents",
  labels: {
    singular: "Document",
    plural: "Documents"
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "documentDate", "documentType", "year", "createdAt"]
  },
  access: {
    read: () => true,
    create: hasAnyPermissionAccess(["manageDocuments", "manageVendinfos"]),
    update: hasAnyPermissionAccess(["manageDocuments", "manageVendinfos"]),
    delete: hasAnyPermissionAccess(["manageDocuments", "manageVendinfos"])
  },
  upload: {
    staticDir: "public/documents",
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.text",
      "image/png",
      "image/jpeg"
    ],
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        const documentDate = data.documentDate ?? originalDoc?.documentDate;
        if (documentDate && !data.year) {
          const parsed = new Date(documentDate);
          if (!Number.isNaN(parsed.getTime())) {
            return { ...data, year: parsed.getFullYear() };
          }
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
      name: "documentType",
      type: "select",
      label: "Type de document",
      required: true,
      options: [
        { label: "DOB", value: "dob" },
        { label: "BP", value: "bp" },
        { label: "CA", value: "ca" },
        { label: "Deliberation", value: "deliberation" },
        { label: "Rapport", value: "rapport" },
        { label: "Annexe", value: "annexe" },
        { label: "Dechets", value: "dechets" },
        { label: "Vendinfos", value: "vendinfos" },
        { label: "Autre", value: "autre" }
      ]
    },
    {
      name: "documentDate",
      type: "date",
      label: "Date du document",
      required: true
    },
    {
      name: "year",
      type: "number",
      label: "Annee",
      admin: {
        position: "sidebar"
      }
    },
    {
      name: "calameoId",
      type: "text",
      label: "Calameo (bkcode ou lien)",
      admin: {
        description: "Optionnel. Utilisez pour integrer un document Calameo."
      }
    }
  ]
};
