import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "../access";

export const Files: CollectionConfig = {
  slug: "files",
  labels: {
    singular: "Fichier",
    plural: "Fichiers"
  },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isAdmin
  },
  upload: {
    staticDir: "public/files",
    mimeTypes: ["application/pdf"],
  },
  fields: []
};
