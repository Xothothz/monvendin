"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LightboxModalButtonProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
  thumbnailClassName?: string;
};

export const LightboxModalButton = ({
  src,
  alt,
  label,
  className,
  thumbnailClassName
}: LightboxModalButtonProps) => {
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
        className={
          className ??
          "group inline-flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 hover:border-gold/40 hover:bg-goldSoft/40 focus-ring"
        }
        aria-label={label}
      >
        <span
          className={
            thumbnailClassName ??
            "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-fog"
          }
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </span>
        {label}
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
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-[85vh] w-auto max-w-[90vw] object-contain block"
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};
