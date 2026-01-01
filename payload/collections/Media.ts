import type { CollectionConfig } from "payload";
import { isAdmin, isAuthenticated } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin
  },
  upload: {
    staticDir: "public/media",
    staticURL: "/media",
    mimeTypes: ["image/*"]
  },
  fields: [
    {
      name: "alt",
      type: "text"
    }
  ]
};
