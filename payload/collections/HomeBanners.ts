import type { CollectionConfig } from "payload";
import { isAuthenticated, publishedOnly } from "../access";

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
    read: publishedOnly,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated
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
