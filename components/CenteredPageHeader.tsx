import type { ReactNode } from "react";

type CenteredPageHeaderProps = {
  label: string;
  title: string;
  description?: ReactNode;
};

export const CenteredPageHeader = ({ label, title, description }: CenteredPageHeaderProps) => {
  return (
    <header className="text-center motion-in">
      <div className="space-y-3 py-4 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate">{label}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          <h1 className="text-3xl font-display uppercase tracking-tight text-accent sm:text-4xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mx-auto max-w-2xl text-sm text-slate">{description}</p>
        ) : null}
      </div>
    </header>
  );
};
