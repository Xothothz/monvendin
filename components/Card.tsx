import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-xl bg-white border border-ink/10 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
};
