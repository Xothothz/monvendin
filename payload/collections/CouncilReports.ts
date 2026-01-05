import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const CouncilReports: CollectionConfig = {
  slug: "council-reports",
  labels: {
    singular: "Compte rendu",
    plural: "Comptes rendus"
  },
  admin: {
    useAsTitle: "date",
    defaultColumns: ["date", "agendaDoc", "minutesDoc", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageCouncilReports"),
    create: hasPermissionAccess("manageCouncilReports"),
    update: hasPermissionAccess("manageCouncilReports"),
    delete: hasPermissionAccess("manageCouncilReports")
  },
  fields: [
    {
      name: "date",
      type: "date",
      label: "Date",
      required: true
    },
    {
      name: "agendaDoc",
      type: "upload",
      relationTo: "documents",
      label: "Ordre du jour (PDF)",
      required: true
    },
    {
      name: "minutesDoc",
      type: "upload",
      relationTo: "documents",
      label: "Compte rendu et deliberation (PDF)",
      required: true
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      admin: {
        position: "sidebar",
        description: "Publie pour afficher sur le site."
      },
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "Publie", value: "published" }
      ]
    }
  ]
};
