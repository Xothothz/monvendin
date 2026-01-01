"use client";

export const SiteBanner = () => {
  return (
    <div className="bg-gradient-to-r from-accent via-ink to-gold text-white text-xs sm:text-sm py-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-2">
        <span className="font-semibold uppercase tracking-[0.2em]">
          Site non officiel de la ville de Vendin-les-Bethune
        </span>
      </div>
    </div>
  );
};
