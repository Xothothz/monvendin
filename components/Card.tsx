import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md ring-1 ring-ink/5 shadow-[0_18px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] motion-soft hover:-translate-y-0.5 hover:border-white/80 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
    >
      {children}
    </div>
  );
};
