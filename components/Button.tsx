import Link from "next/link";
import clsx from "clsx";

const styles = {
  primary:
    "bg-accent text-white shadow-[0_10px_22px_rgba(12,44,132,0.25)] hover:bg-ink",
  secondary:
    "bg-white text-ink border border-ink/15 hover:border-accent/50 hover:bg-accentSoft/40",
  ghost: "bg-transparent text-ink hover:bg-accentSoft/50"
};

type ButtonProps = {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  href?: string;
  className?: string;
};

export const Button = ({ children, variant = "primary", href, className }: ButtonProps) => {
  const base = clsx(
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-ring hover:-translate-y-0.5 active:translate-y-0",
    styles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return <button className={base}>{children}</button>;
};
