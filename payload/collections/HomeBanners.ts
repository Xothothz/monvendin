import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const HomeBanners: CollectionConfig = {
  slug: "home-banners",
  labels: {
    singular: "Bandeau accueil",
    plural: "Bandeau accueil"
  },
  admin: {
    useAsTitle: "message",
    defaultColumns: ["label", "message", "order", "status"]
  },
  access: {
    read: publishedOrHasPermission("manageHomeBanners"),
    create: hasPermissionAccess("manageHomeBanners"),
    update: hasPermissionAccess("manageHomeBanners"),
    delete: hasPermissionAccess("manageHomeBanners")
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Label"
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
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
