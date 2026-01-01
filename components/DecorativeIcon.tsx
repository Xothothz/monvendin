import clsx from "clsx";
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

type DecorativeIconProps = {
  name: DecorativeIconName;
  className?: string;
};

type IconComponent = React.ComponentType<{
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  "aria-hidden"?: boolean;
}>;

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

export const DecorativeIcon = ({ name, className }: DecorativeIconProps) => {
  const Icon = icons[name];
  return (
    <Icon
      aria-hidden
      className={clsx("text-[#1E63B6]", className)}
      weight="fill"
    />
  );
};
