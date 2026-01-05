import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: hasPermissionAccess("manageMedia"),
    update: hasPermissionAccess("manageMedia"),
    delete: hasPermissionAccess("manageMedia")
  },
  upload: {
    staticDir: "public/media",
    mimeTypes: ["image/*"]
  },
  fields: [
    {
      name: "alt",
      type: "text"
    }
  ]
};
