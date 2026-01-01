import clsx from "clsx";

const variants = {
  default: "bg-fog text-slate border border-ink/10",
  accent: "bg-accentSoft text-accent border border-accent/20",
  warning: "bg-warningSoft text-warning border border-warning/20"
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
};

export const Badge = ({ children, variant = "default" }: BadgeProps) => {
  return <span className={clsx("badge", variants[variant])}>{children}</span>;
};
