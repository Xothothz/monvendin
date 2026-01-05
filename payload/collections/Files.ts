import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

export const Files: CollectionConfig = {
  slug: "files",
  labels: {
    singular: "Fichier",
    plural: "Fichiers"
  },
  access: {
    read: () => true,
    create: hasPermissionAccess("manageFiles"),
    update: hasPermissionAccess("manageFiles"),
    delete: hasPermissionAccess("manageFiles")
  },
  upload: {
    staticDir: "public/files",
    mimeTypes: ["application/pdf"],
  },
  fields: []
};
