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
          "relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden h-[175px] sm:h-[215px] lg:h-[255px] text-ink",
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
        <div
          className={clsx(
            "absolute inset-0",
            hasImage
              ? "bg-gradient-to-r from-white/85 via-white/45 to-transparent"
              : "bg-gradient-to-br from-white via-fog to-accentSoft/60"
          )}
        />
        {showText ? (
          <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6 sm:px-8 lg:px-10">
            <div
              className={clsx(
                "max-w-3xl h-full self-stretch flex flex-col justify-center rounded-2xl p-4 text-ink backdrop-blur-[1px] sm:p-6 motion-in",
                hasImage
                  ? "border border-white/25 bg-white/10 ring-1 ring-white/15 shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
                  : "border border-white/60 bg-white/70 ring-1 ring-ink/5"
              )}
            >
              {eyebrow ? (
                <p
                  className={clsx(
                    "inline-flex w-fit self-start items-center rounded-full border border-gold/40 bg-gradient-to-r from-goldSoft/90 via-white/80 to-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-ink shadow-[0_10px_22px_rgba(235,190,70,0.18)]"
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-4 text-3xl sm:text-5xl leading-tight text-ink">{title}</h1>
              {subtitle ? (
                <p
                  className={clsx(
                    "mt-4 text-base sm:text-lg text-ink/70"
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
