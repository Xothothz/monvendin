import type { CollectionConfig, Field } from "payload";
import { isAdmin } from "../access";
import { permissionOptions } from "../../lib/permissions";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "Administrateur", value: "admin" },
        { label: "Utilisateur", value: "user" },
      ],
    },
    {
      name: "permissions",
      type: "group",
      label: "Permissions",
      fields: permissionOptions.map(
        (permission): Field => ({
          name: permission.key,
          type: "checkbox",
          label: permission.label,
        })
      ),
    },
  ],
};
