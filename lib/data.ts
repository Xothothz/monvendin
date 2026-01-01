import agendaData from "@/data/agenda.json";
import demarchesData from "@/data/demarches.json";
import documentsData from "@/data/documents.json";
import associationsData from "@/data/associations.json";
import ecolesData from "@/data/ecoles.json";
import menusData from "@/data/menus-cantine.json";

export type AgendaItem = {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  category: string;
  summary: string;
  content: string;
  sources: { label: string; url: string }[];
};

export type DemarcheItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  steps: string[];
  documents: string[];
  contact: string;
  delay: string;
  cost: string;
  sources: { label: string; url: string }[];
};

export type DocumentItem = {
  id: string;
  title: string;
  date: string;
  year: number;
  type: string;
  source: string;
  url: string;
  access: "interne" | "externe";
};

export type AssociationItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  contact: string;
  website?: string;
};

export type EcoleItem = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  services: string[];
};

export type MenuWeek = {
  id: string;
  week: string;
  days: {
    day: string;
    lunch: string[];
    allergens: string[] | null;
  }[];
  pdf?: string;
};

export const agenda = agendaData as AgendaItem[];
export const demarches = demarchesData as DemarcheItem[];
export const documents = documentsData as DocumentItem[];
export const associations = associationsData as AssociationItem[];
export const ecoles = ecolesData as EcoleItem[];
export const menus = menusData as MenuWeek[];

export const getAgendaBySlug = (slug: string) => agenda.find((item) => item.slug === slug);
export const getDemarcheBySlug = (slug: string) => demarches.find((item) => item.slug === slug);
export const getAssociationBySlug = (slug: string) =>
  associations.find((item) => item.slug === slug);

export const unique = <T>(items: T[]) => Array.from(new Set(items));

export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};
