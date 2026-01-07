"use client";

import clsx from "clsx";

type HomeHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  alt?: string;
  actions?: React.ReactNode;
  showText?: boolean;
};

export const HomeHero = ({
  eyebrow,
  title,
  subtitle,
  image,
  alt,
  actions,
  showText = true
}: HomeHeroProps) => {
  const hasImage = Boolean(image && image.trim().length > 0);

  return (
    <section aria-label={alt ?? "Banniere accueil"}>
      <div
        className={clsx(
          "home-hero-shell relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden h-[175px] sm:h-[215px] lg:h-[255px] text-ink",
          hasImage ? "bg-sand/40" : "bg-white/70"
        )}
      >
        {actions ? <div className="absolute right-6 top-6 z-20">{actions}</div> : null}
        {hasImage ? (
          <div
            className="absolute inset-0 bg-cover bg-bottom"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : null}
        <div className="home-hero-grid" aria-hidden="true" />
        <span className="home-hero-orb home-hero-orb-left" aria-hidden="true" />
        <span className="home-hero-orb home-hero-orb-right" aria-hidden="true" />
        <div
          className={clsx(
            "home-hero-overlay absolute inset-0",
            hasImage
              ? "bg-gradient-to-r from-ink/70 via-ink/35 to-transparent"
              : "bg-gradient-to-br from-white via-fog to-accentSoft/60"
          )}
        />
        {showText ? (
          <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 sm:px-8 lg:px-10">
            <div
              className={clsx(
                "max-w-3xl h-full self-stretch flex flex-col justify-center rounded-2xl p-4 backdrop-blur-md sm:p-6 motion-in",
                hasImage
                  ? "border border-white/15 bg-white/12 text-white shadow-[0_28px_70px_rgba(8,12,22,0.28)]"
                  : "border border-ink/10 bg-white/25 text-ink shadow-[0_24px_70px_rgba(8,12,22,0.18)]"
              )}
            >
              {eyebrow ? (
                <p
                  className={clsx(
                    "inline-flex w-fit self-start items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85 shadow-[0_10px_22px_rgba(8,12,22,0.22)]"
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-4 text-3xl sm:text-5xl leading-tight text-white/90">
                {title}
              </h1>
              {subtitle ? (
                <p
                  className={clsx(
                    "mt-4 text-base sm:text-lg text-sky-100/80"
                  )}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
