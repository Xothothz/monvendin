import type { CollectionConfig } from "payload";
import { isAuthenticated, publishedOnly } from "../access";

export const Delegates: CollectionConfig = {
  slug: "delegates",
  labels: {
    singular: "Delegue de quartier",
    plural: "Delegues de quartier"
  },
  admin: {
    useAsTitle: "lastName",
    defaultColumns: ["lastName", "firstName", "sectorRef", "email", "phone", "status"]
  },
  access: {
    read: publishedOnly,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "Prenom",
      required: true,
      admin: {
        width: "50%"
      }
    },
    {
      name: "lastName",
      type: "text",
      label: "Nom",
      required: true,
      admin: {
        width: "50%"
      }
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      admin: {
        width: "50%"
      }
    },
    {
      name: "sectorRef",
      type: "relationship",
      relationTo: "sectors",
      label: "Secteur",
      admin: {
        width: "50%"
      }
    },
    {
      name: "phone",
      type: "text",
      label: "Telephone",
      admin: {
        width: "50%"
      }
    },
    {
      name: "sector",
      type: "number",
      label: "Secteur",
      admin: {
        hidden: true
      }
    },
    {
      name: "streets",
      type: "array",
      label: "Rues du secteur",
      admin: {
        hidden: true
      },
      fields: [
        {
          name: "name",
          type: "text",
          label: "Nom de rue",
          required: true
        }
      ]
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      admin: {
        position: "sidebar",
        description: "Publie pour afficher sur le site."
      },
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "Publie", value: "published" }
      ]
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Photo du delegue."
      }
    }
  ]
};
