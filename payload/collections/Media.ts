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
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "thumb",
        width: 320
      },
      {
        name: "small",
        width: 640
      },
      {
        name: "medium",
        width: 1024
      },
      {
        name: "large",
        width: 1600
      }
    ]
  },
  fields: [
    {
      name: "alt",
      type: "text"
    }
  ]
};
