import type { CollectionConfig } from "payload";
import { hasPermissionAccess } from "../access";

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
    create: hasPermissionAccess("manageAssociations"),
    update: hasPermissionAccess("manageAssociations"),
    delete: hasPermissionAccess("manageAssociations")
  },
  fields: [
    {
      name: "categorie",
      type: "select",
      label: "Categorie",
      options: [
        { label: "Alimentation", value: "alimentation" },
        { label: "Animaux", value: "animaux" },
        { label: "Automobile", value: "automobile" },
        { label: "Banque", value: "banque" },
        { label: "Bar-Tabac", value: "bar-tabac" },
        { label: "Bâtiment", value: "batiment" },
        { label: "Beauté", value: "beaute" },
        { label: "Bien-être", value: "bien-etre" },
        { label: "Café", value: "cafe" },
        { label: "Communication", value: "communication" },
        { label: "Crèche", value: "creche" },
        { label: "Evenementiel", value: "evenementiel" },
        { label: "Gestion Administrative", value: "gestion-administrative" },
        { label: "Hôtellerie", value: "hotellerie" },
        { label: "Immobilier", value: "immobilier" },
        { label: "Industries", value: "industries" },
        { label: "Informatique", value: "informatique" },
        { label: "Jardin", value: "jardin" },
        { label: "Maison", value: "maison" },
        { label: "Loisir", value: "loisir" },
        { label: "Médiation", value: "mediation" },
        { label: "Mode", value: "mode" },
        { label: "Musique", value: "musique" },
        { label: "Photographie", value: "photographie" },
        { label: "Pompes Funèbres", value: "pompes-funebres" },
        { label: "Restauration", value: "restauration" },
        { label: "Services", value: "services" },
        { label: "Services à la personne", value: "services-a-la-personne" },
        { label: "Tabac", value: "tabac" }
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
