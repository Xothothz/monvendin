import type { CollectionConfig } from "payload";
import { isAdmin, isAdminOrOwner, publishedOrOwner } from "../access";

const pageHeaderFields = [
  {
    name: "header",
    type: "group",
    label: "En-tete de page",
    fields: [
      {
        name: "enabled",
        type: "checkbox",
        label: "Afficher l'en-tete",
        defaultValue: true
      },
      {
        name: "align",
        type: "select",
        label: "Alignement",
        defaultValue: "left",
        options: [
          { label: "Gauche", value: "left" },
          { label: "Centre", value: "center" }
        ]
      },
      {
        name: "variant",
        type: "select",
        label: "Style",
        defaultValue: "simple",
        options: [
          { label: "Simple", value: "simple" },
          { label: "Accent", value: "accent" }
        ]
      }
    ]
  }
];

const buildNavFields = (options: { defaultEnabled: boolean; defaultOrder: number }) => [
  {
    name: "navEnabled",
    type: "checkbox",
    label: "Afficher dans le menu",
    defaultValue: options.defaultEnabled
  },
  {
    name: "navLabel",
    type: "text",
    label: "Libelle du menu"
  },
  {
    name: "navOrder",
    type: "number",
    label: "Ordre dans le menu",
    min: 0,
    defaultValue: options.defaultOrder
  }
];

const servicesBlock = {
  slug: "services",
  labels: {
    singular: "Services / Menu",
    plural: "Services / Menu"
  },
  fields: [
    {
      name: "variant",
      type: "select",
      label: "Variante",
      defaultValue: "list",
      options: [
        { label: "Liste", value: "list" },
        { label: "Cartes", value: "cards" }
      ]
    },
    {
      name: "groups",
      type: "array",
      label: "Sections",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titre"
        },
        {
          name: "categories",
          type: "array",
          label: "Sous-sections",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre"
            },
            {
              name: "items",
              type: "array",
              label: "Elements",
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Visuel"
                },
                {
                  name: "name",
                  type: "text",
                  label: "Nom",
                  required: true
                },
                {
                  name: "description",
                  type: "textarea",
                  label: "Description"
                },
                {
                  name: "price",
                  type: "text",
                  label: "Prix"
                }
              ]
            }
          ]
        },
        {
          name: "items",
          type: "array",
          label: "Elements (ancienne version)",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Visuel"
            },
            {
              name: "name",
              type: "text",
              label: "Nom",
              required: true
            },
            {
              name: "description",
              type: "textarea",
              label: "Description"
            },
            {
              name: "price",
              type: "text",
              label: "Prix"
            }
          ]
        }
      ]
    },
    {
      name: "items",
      type: "array",
      label: "Elements (ancienne version)",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Visuel"
        },
        {
          name: "name",
          type: "text",
          label: "Nom",
          required: true
        },
        {
          name: "description",
          type: "textarea",
          label: "Description"
        },
        {
          name: "price",
          type: "text",
          label: "Prix"
        }
      ]
    }
  ]
};

const fullPageBlocks = [

  {
    slug: "hero",
    labels: {
      singular: "Hero",
      plural: "Heros"
    },
    fields: [
      {
        name: "title",
        type: "text",
        label: "Titre",
        required: true
      },
      {
        name: "subtitle",
        type: "textarea",
        label: "Sous-titre"
      },
      {
        name: "bannerImage",
        type: "upload",
        relationTo: "media",
        label: "Image de banniere"
      },
      {
        name: "logo",
        type: "upload",
        relationTo: "media",
        label: "Logo"
      },
      {
        name: "primaryCtaLabel",
        type: "text",
        label: "Bouton principal (texte)"
      },
      {
        name: "primaryCtaUrl",
        type: "text",
        label: "Bouton principal (lien)"
      },
      {
        name: "secondaryCtaLabel",
        type: "text",
        label: "Bouton secondaire (texte)"
      },
      {
        name: "secondaryCtaUrl",
        type: "text",
        label: "Bouton secondaire (lien)"
      },
      {
        name: "align",
        type: "select",
        label: "Alignement",
        defaultValue: "left",
        options: [
          { label: "Gauche", value: "left" },
          { label: "Centre", value: "center" }
        ]
      },
      {
        name: "textTone",
        type: "select",
        label: "Couleur du texte",
        defaultValue: "light",
        options: [
          { label: "Clair", value: "light" },
          { label: "Sombre", value: "dark" }
        ]
      },
      {
        name: "overlay",
        type: "number",
        label: "Opacite du voile (0-80)",
        defaultValue: 40,
        min: 0,
        max: 80
      },
      {
        name: "height",
        type: "select",
        label: "Hauteur",
        defaultValue: "md",
        options: [
          { label: "Compact", value: "sm" },
          { label: "Moyen", value: "md" },
          { label: "Grand", value: "lg" }
        ]
      }
    ]
  },
  {
    slug: "about",
    labels: {
      singular: "A propos",
      plural: "A propos"
    },
    fields: [
      {
        name: "title",
        type: "text",
        label: "Titre",
        required: true
      },
      {
        name: "body",
        type: "textarea",
        label: "Texte"
      },
      {
        name: "image",
        type: "upload",
        relationTo: "media",
        label: "Image"
      },
      {
        name: "imagePosition",
        type: "select",
        label: "Position de l'image",
        defaultValue: "left",
        options: [
          { label: "Gauche", value: "left" },
          { label: "Droite", value: "right" }
        ]
      }
    ]
  },
  servicesBlock,
  {
    slug: "gallery",
    labels: {
      singular: "Galerie",
      plural: "Galerie"
    },
    fields: [
      {
        name: "columns",
        type: "select",
        label: "Colonnes",
        defaultValue: "3",
        options: [
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" }
        ]
      },
      {
        name: "images",
        type: "array",
        label: "Images",
        fields: [
          {
            name: "image",
            type: "upload",
            relationTo: "media",
            label: "Image",
            required: true
          },
          {
            name: "alt",
            type: "text",
            label: "Texte alternatif"
          },
          {
            name: "caption",
            type: "text",
            label: "Legende"
          }
        ]
      }
    ]
  },
  {
    slug: "contact",
    labels: {
      singular: "Contact",
      plural: "Contact"
    },
    fields: [
      {
        name: "address",
        type: "text",
        label: "Adresse"
      },
      {
        name: "postalCode",
        type: "text",
        label: "Code postal"
      },
      {
        name: "city",
        type: "text",
        label: "Ville"
      },
      {
        name: "phone",
        type: "text",
        label: "Telephone"
      },
      {
        name: "email",
        type: "email",
        label: "Email"
      },
      {
        name: "website",
        type: "text",
        label: "Site web"
      },
      {
        name: "mapUrl",
        type: "text",
        label: "Lien carte"
      },
      {
        name: "hours",
        type: "array",
        label: "Horaires",
        fields: [
          {
            name: "line",
            type: "text",
            label: "Horaire"
          }
        ]
      },
      {
        name: "socials",
        type: "array",
        label: "Reseaux",
        fields: [
          {
            name: "label",
            type: "text",
            label: "Nom"
          },
          {
            name: "url",
            type: "text",
            label: "Lien"
          }
        ]
      }
    ]
  }
];

export const ProPages: CollectionConfig = {
  slug: "pro-pages",
  labels: {
    singular: "Page pro",
    plural: "Pages pro"
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "type", "status", "owner"]
  },
  access: {
    read: publishedOrOwner,
    create: isAdmin,
    update: isAdminOrOwner,
    delete: isAdmin
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
      required: true
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true
    },
    {
      name: "type",
      type: "select",
      label: "Type",
      required: true,
      options: [
        { label: "Association", value: "association" },
        { label: "Restaurant", value: "restaurant" },
        { label: "Prestataire", value: "prestataire" }
      ]
    },
    {
      name: "status",
      type: "select",
      label: "Statut",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Brouillon", value: "draft" },
        { label: "Publie", value: "published" }
      ]
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      label: "Proprietaire",
      required: true
    },
    {
      name: "theme",
      type: "select",
      label: "Theme",
      required: true,
      defaultValue: "moderne",
      options: [
        { label: "Moderne", value: "moderne" },
        { label: "Chaleureux", value: "chaleureux" },
        { label: "Minimal", value: "minimal" }
      ]
    },
    {
      name: "palette",
      type: "select",
      label: "Palette",
      required: true,
      defaultValue: "ocean",
      options: [
        { label: "Ocean", value: "ocean" },
        { label: "Terracotta", value: "terracotta" },
        { label: "Olive", value: "olive" },
        { label: "Sable", value: "sable" },
        { label: "Charcoal", value: "charcoal" },
        { label: "Bleu nuit", value: "bleu-nuit" }
      ]
    },
    {
      name: "typo",
      type: "select",
      label: "Typo",
      required: true,
      defaultValue: "fraunces-source",
      options: [
        { label: "Fraunces + Source Sans", value: "fraunces-source" },
        { label: "Cormorant + Work Sans", value: "cormorant-work" },
        { label: "Bebas + DM Sans", value: "bebas-dm" }
      ]
    },
    {
      name: "pages",
      type: "group",
      label: "Pages du mini-site",
      fields: [
        {
          name: "home",
          type: "group",
          label: "Accueil",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre",
              required: true
            },
            ...buildNavFields({ defaultEnabled: true, defaultOrder: 0 }),
            ...pageHeaderFields,
            {
              name: "sections",
              type: "blocks",
              label: "Sections",
              blocks: fullPageBlocks
            }
          ]
        },
        {
                  name: "services",
                  type: "group",
                  label: "Services / Menu",
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      label: "Titre",
                      required: true
                    },
                    ...buildNavFields({ defaultEnabled: true, defaultOrder: 1 }),
                    ...pageHeaderFields,
                    {
                      name: "sections",
                      type: "blocks",
                      label: "Sections",
                      blocks: [
                        servicesBlock,
                        {
                          slug: "pricing",
                          labels: {
                            singular: "Tarifs",
                            plural: "Tarifs"
                          },
                          fields: [
                            {
                              name: "variant",
                              type: "select",
                              label: "Variante",
                              defaultValue: "cards",
                              options: [
                                { label: "Table", value: "table" },
                                { label: "Cartes", value: "cards" }
                              ]
                            },
                            {
                              name: "offers",
                              type: "array",
                              label: "Offres",
                              fields: [
                                {
                                  name: "title",
                                  type: "text",
                                  label: "Titre",
                                  required: true
                                },
                                {
                                  name: "price",
                                  type: "text",
                                  label: "Prix"
                                },
                                {
                                  name: "description",
                                  type: "textarea",
                                  label: "Description"
                                },
                                {
                                  name: "points",
                                  type: "array",
                                  label: "Points cles",
                                  fields: [
                                    {
                                      name: "text",
                                      type: "text",
                                      label: "Point"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
        {
                  name: "gallery",
                  type: "group",
                  label: "Galerie",
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      label: "Titre",
                      required: true
                    },
                    ...buildNavFields({ defaultEnabled: true, defaultOrder: 2 }),
                    ...pageHeaderFields,
                    {
                      name: "sections",
                      type: "blocks",
                      label: "Sections",
                      blocks: [
                        {
                          slug: "gallery",
                          labels: {
                            singular: "Galerie",
                            plural: "Galerie"
                          },
                          fields: [
                            {
                              name: "columns",
                              type: "select",
                              label: "Colonnes",
                              defaultValue: "3",
                              options: [
                                { label: "2", value: "2" },
                                { label: "3", value: "3" },
                                { label: "4", value: "4" }
                              ]
                            },
                            {
                              name: "images",
                              type: "array",
                              label: "Images",
                              fields: [
                                {
                                  name: "image",
                                  type: "upload",
                                  relationTo: "media",
                                  label: "Image",
                                  required: true
                                },
                                {
                                  name: "alt",
                                  type: "text",
                                  label: "Texte alternatif"
                                },
                                {
                                  name: "caption",
                                  type: "text",
                                  label: "Legende"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
        {
          name: "team",
          type: "group",
          label: "Equipe",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Titre",
              required: true
            },
            ...buildNavFields({ defaultEnabled: false, defaultOrder: 3 }),
            ...pageHeaderFields,
            {
              name: "sections",
              type: "blocks",
              label: "Sections",
              blocks: fullPageBlocks
            }
          ]
        },
        {
                  name: "contact",
                  type: "group",
                  label: "Contact",
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      label: "Titre",
                      required: true
                    },
                    ...buildNavFields({ defaultEnabled: true, defaultOrder: 4 }),
                    ...pageHeaderFields,
                    {
                      name: "sections",
                      type: "blocks",
                      label: "Sections",
                      blocks: [
                        {
                          slug: "contact",
                          labels: {
                            singular: "Contact",
                            plural: "Contact"
                          },
                          fields: [
                            {
                              name: "address",
                              type: "text",
                              label: "Adresse"
                            },
                            {
                              name: "postalCode",
                              type: "text",
                              label: "Code postal"
                            },
                            {
                              name: "city",
                              type: "text",
                              label: "Ville"
                            },
                            {
                              name: "phone",
                              type: "text",
                              label: "Telephone"
                            },
                            {
                              name: "email",
                              type: "email",
                              label: "Email"
                            },
                            {
                              name: "website",
                              type: "text",
                              label: "Site web"
                            },
                            {
                              name: "mapUrl",
                              type: "text",
                              label: "Lien carte"
                            },
                            {
                              name: "hours",
                              type: "array",
                              label: "Horaires",
                              fields: [
                                {
                                  name: "line",
                                  type: "text",
                                  label: "Horaire"
                                }
                              ]
                            },
                            {
                              name: "socials",
                              type: "array",
                              label: "Reseaux",
                              fields: [
                                {
                                  name: "label",
                                  type: "text",
                                  label: "Nom"
                                },
                                {
                                  name: "url",
                                  type: "text",
                                  label: "Lien"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
      ]
    }
  ]
};
