import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"]
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Administrateur", value: "admin" },
        { label: "Editeur", value: "editor" }
      ]
    },
    {
      name: "permissions",
      type: "group",
      label: "Permissions",
      fields: [
        {
          name: "manageActualites",
          type: "checkbox",
          label: "Actualites"
        },
        {
          name: "manageAgenda",
          type: "checkbox",
          label: "Agenda"
        },
        {
          name: "manageDocuments",
          type: "checkbox",
          label: "Documents"
        },
        {
          name: "manageVendinfos",
          type: "checkbox",
          label: "Vendinfos"
        },
        {
          name: "manageAssociations",
          type: "checkbox",
          label: "Associations"
        },
        {
          name: "canPublish",
          type: "checkbox",
          label: "Publication directe"
        }
      ]
    }
  ]
};
