import clsx from "clsx";
import React from "react";
import {
  Bank,
  CalendarBlank,
  ClipboardText,
  Envelope,
  FileText,
  Gavel,
  HandHeart,
  House,
  MapPinLine,
  Recycle,
  ShieldCheck,
  Users,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";

/**
 * Liste stricte des noms d’icônes décoratives utilisables
 * (évite toute incohérence dans le code appelant)
 */
export type DecorativeIconName =
  | "conseil-municipal"
  | "commissions"
  | "deliberations"
  | "comptes-rendus"
  | "demarches"
  | "contact"
  | "urbanisme"
  | "dechets"
  | "logement"
  | "solidarite"
  | "securite"
  | "associations"
  | "agenda";

/**
 * Props du composant DecorativeIcon
 */
type DecorativeIconProps = {
  name: DecorativeIconName;
  className?: string;
};

/**
 * IMPORTANT
 * On utilise React.ElementType pour accepter :
 * - FunctionComponent
 * - ForwardRefExoticComponent (Phosphor)
 * - SSR icons
 *
 * Sans conflit sur propTypes / aria-hidden / weight
 */
type IconComponent = React.ElementType;

/**
 * Mapping nom logique → icône réelle
 */
const icons: Record<DecorativeIconName, IconComponent> = {
  "conseil-municipal": Bank,
  commissions: UsersThree,
  deliberations: Gavel,
  "comptes-rendus": FileText,
  demarches: ClipboardText,
  contact: Envelope,
  urbanisme: MapPinLine,
  dechets: Recycle,
  logement: House,
  solidarite: HandHeart,
  securite: ShieldCheck,
  associations: Users,
  agenda: CalendarBlank
};

/**
 * Composant d’icône décorative
 * Usage :
 * <DecorativeIcon name="agenda" className="h-6 w-6" />
 */
export const DecorativeIcon = ({ name, className }: DecorativeIconProps) => {
  const Icon = icons[name];

  return (
    <Icon
      aria-hidden
      weight="fill"
      className={clsx("text-[#1E63B6]", className)}
    />
  );
};
