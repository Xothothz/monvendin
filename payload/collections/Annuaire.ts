import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const Annuaire: CollectionConfig = {
  slug: "annuaire",
  labels: {
    singular: "Entree d'annuaire",
    plural: "Annuaire"
  },
  admin: {
    useAsTitle: "denomination",
    defaultColumns: ["categorie", "denomination", "nom", "prenom", "ville", "telephone"]
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  fields: [
    {
      name: "categorie",
      type: "select",
      label: "Categorie",
      options: [
        { label: "Commerce", value: "commerce" },
        { label: "Artisanat", value: "artisanat" },
        { label: "Services", value: "services" },
        { label: "Sante", value: "sante" },
        { label: "Education", value: "education" },
        { label: "Association", value: "association" },
        { label: "Autre", value: "autre" }
      ]
    },
    {
      name: "sousCategorie",
      type: "text",
      label: "Sous-categorie"
    },
    {
      name: "nom",
      type: "text",
      label: "Nom"
    },
    {
      name: "prenom",
      type: "text",
      label: "Prenom"
    },
    {
      name: "denomination",
      type: "text",
      label: "Denomination"
    },
    {
      name: "adresse",
      type: "text",
      label: "Adresse"
    },
    {
      name: "codePostal",
      type: "text",
      label: "Code postal"
    },
    {
      name: "ville",
      type: "text",
      label: "Ville"
    },
    {
      name: "telephone",
      type: "text",
      label: "Telephone"
    },
    {
      name: "portable",
      type: "text",
      label: "Portable"
    },
    {
      name: "mail",
      type: "email",
      label: "Mail"
    },
    {
      name: "siteInternet",
      type: "text",
      label: "Site internet"
    }
  ]
};
