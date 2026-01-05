export type PermissionKey =
  | "manageActualites"
  | "manageAgenda"
  | "manageDocuments"
  | "manageVendinfos"
  | "manageAssociations"
  | "manageHomeBanners"
  | "managePageHeroes"
  | "manageHistorySections"
  | "manageOfficials"
  | "manageDelegates"
  | "manageSectors"
  | "manageCouncilReports"
  | "managePageContents"
  | "managePageTexts"
  | "manageSchoolMenus"
  | "manageFiles"
  | "manageMedia"
  | "canPublish";

export type UserRole = "admin" | "user";

export type UserPermissions = Partial<Record<PermissionKey, boolean>>;

export type UserWithPermissions = {
  role?: UserRole | "editor";
  permissions?: UserPermissions | null;
};

export const permissionOptions: Array<{ key: PermissionKey; label: string }> = [
  { key: "manageActualites", label: "Actualites" },
  { key: "manageAgenda", label: "Agenda" },
  { key: "manageDocuments", label: "Documents" },
  { key: "manageVendinfos", label: "Vendinfos" },
  { key: "manageAssociations", label: "Associations" },
  { key: "manageHomeBanners", label: "Bandeau infos" },
  { key: "managePageHeroes", label: "Heros de page" },
  { key: "manageHistorySections", label: "Histoire (sections)" },
  { key: "manageOfficials", label: "Elus municipaux" },
  { key: "manageDelegates", label: "Delegues de quartier" },
  { key: "manageSectors", label: "Secteurs de quartier" },
  { key: "manageCouncilReports", label: "Comptes rendus" },
  { key: "managePageContents", label: "Contenus de page" },
  { key: "managePageTexts", label: "Textes de page" },
  { key: "manageSchoolMenus", label: "Menus scolaires" },
  { key: "manageFiles", label: "Fichiers" },
  { key: "manageMedia", label: "Medias (images, uploads)" },
  { key: "canPublish", label: "Publication directe" }
];

export const hasPermission = (
  user: UserWithPermissions | null | undefined,
  key: PermissionKey
) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return Boolean(user.permissions?.[key]);
};

export const hasAnyPermission = (
  user: UserWithPermissions | null | undefined,
  keys: PermissionKey[]
) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return keys.some((key) => Boolean(user.permissions?.[key]));
};
