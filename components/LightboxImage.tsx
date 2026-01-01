"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LightboxImageProps = {
  src: string;
  alt: string;
  previewClassName?: string;
  onPrev?: () => void;
  onNext?: () => void;
  showNav?: boolean;
  counterLabel?: string;
};

export const LightboxImage = ({
  src,
  alt,
  previewClassName,
  onPrev,
  onNext,
  showNav,
  counterLabel
}: LightboxImageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      } else if (showNav && event.key === "ArrowRight" && onNext) {
        onNext();
      } else if (showNav && event.key === "ArrowLeft" && onPrev) {
        onPrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label="Voir l'image en grand"
      >
        <img
          src={src}
          alt={alt}
          className={
            previewClassName ??
            "h-56 w-full rounded-xl border border-ink/10 bg-sand object-contain transition duration-200 hover:scale-[1.02] lg:h-64"
          }
          loading="lazy"
        />
      </button>

      {isOpen && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
          className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
            <div
              className="relative flex items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
              >
                Fermer
              </button>
              {counterLabel ? (
                <span className="absolute left-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card">
                  {counterLabel}
                </span>
              ) : null}
              <img
                src={src}
                alt={alt}
                className="max-h-[85vh] w-auto max-w-[90vw] object-contain block"
              />
            </div>
          </div>
          {showNav ? (
            <>
              {onPrev ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPrev();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-sm"
                >
                  Precedent
                </button>
              ) : null}
              {onNext ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-sm"
                >
                  Suivant
                </button>
              ) : null}
            </>
          ) : null}
        </div>,
        document.body
      )
        : null}
    </>
  );
};
