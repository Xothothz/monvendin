import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const SchoolMenus: CollectionConfig = {
  slug: "school-menus",
  labels: {
    singular: "Menu scolaire",
    plural: "Menus scolaires"
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageSchoolMenus"),
    create: hasPermissionAccess("manageSchoolMenus"),
    update: hasPermissionAccess("manageSchoolMenus"),
    delete: hasPermissionAccess("manageSchoolMenus")
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true
    },
    {
      name: "linkLabel",
      type: "text",
      label: "Texte du bouton"
    },
    {
      name: "linkUrl",
      type: "text",
      label: "Lien",
      required: true
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
