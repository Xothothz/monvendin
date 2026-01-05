import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

export const SchoolMenuSettings: CollectionConfig = {
  slug: "school-menu-settings",
  labels: {
    singular: "Parametres menus scolaires",
    plural: "Parametres menus scolaires"
  },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "updatedAt"]
  },
  access: {
    read: () => true,
    create: hasPermissionAccess("manageSchoolMenus"),
    update: hasPermissionAccess("manageSchoolMenus"),
    delete: hasPermissionAccess("manageSchoolMenus")
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
      name: "yearLabel",
      type: "text",
      label: "Annee scolaire",
      required: true
    }
  ]
};
