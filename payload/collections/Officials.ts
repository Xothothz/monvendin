import type { CollectionConfig } from "payload";
import { hasPermissionAccess, publishedOrHasPermission } from "../access";

export const Officials: CollectionConfig = {
  slug: "officials",
  labels: {
    singular: "Elu",
    plural: "Elus"
  },
  admin: {
    useAsTitle: "lastName",
    defaultColumns: [
      "lastName",
      "firstName",
      "role",
      "politicalGroup",
      "group",
      "order",
      "status"
    ]
  },
  access: {
    read: publishedOrHasPermission("manageOfficials"),
    create: hasPermissionAccess("manageOfficials"),
    update: hasPermissionAccess("manageOfficials"),
    delete: hasPermissionAccess("manageOfficials")
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "Prenom",
      required: true,
      admin: {
        width: "50%",
        description: "Prenom affiche sur la page publique."
      }
    },
    {
      name: "lastName",
      type: "text",
      label: "Nom",
      required: true,
      admin: {
        width: "50%",
        description: "Nom de famille affiche sur la page publique."
      }
    },
    {
      name: "role",
      type: "text",
      label: "Poste",
      required: true,
      admin: {
        width: "50%",
        description: "Fonction courte, ex: Maire, Adjoint a la culture."
      }
    },
    {
      name: "politicalGroup",
      type: "text",
      label: "Liste politique",
      admin: {
        width: "50%",
        description: "Optionnel. Nom de la liste ou du groupe."
      }
    },
    {
      name: "group",
      type: "select",
      label: "Section",
      required: true,
      defaultValue: "executive",
      options: [
        { label: "Le maire et ses adjoints", value: "executive" },
        { label: "Conseillers municipaux", value: "council" }
      ],
      admin: {
        description: "Choisissez ou la fiche s'affiche sur la page."
      }
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
      defaultValue: "draft",
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
        description: "Photo officielle, format carre recommande."
      }
    }
  ]
};
