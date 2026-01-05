import clsx from "clsx";

const variants = {
  default: "bg-white/70 text-slate border border-white/60",
  accent: "bg-accentSoft/70 text-accent border border-accent/20",
  warning: "bg-warningSoft/70 text-warning border border-warning/20"
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
};

export const Badge = ({ children, variant = "default" }: BadgeProps) => {
  return (
    <span className={clsx("badge backdrop-blur-sm ring-1 ring-ink/5", variants[variant])}>
      {children}
    </span>
  );
};
