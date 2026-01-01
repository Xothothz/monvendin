"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";

type PdfLightboxButtonProps = {
  src: string;
  label: string;
  title?: string;
  className?: string;
};

export const PdfLightboxButton = ({
  src,
  label,
  title,
  className
}: PdfLightboxButtonProps) => {
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
          "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:text-ink"
        }
        aria-label={label}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      {isOpen && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title ?? label}
              className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
                <div
                  className="relative flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.6)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{title ?? label}</p>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
                    >
                      Fermer
                    </button>
                  </div>
                  <iframe title={title ?? label} src={`${src}#view=FitH`} className="h-full w-full" />
                  <div className="flex items-center justify-end gap-3 border-t border-ink/10 px-4 py-3">
                    <a
                      href={src}
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/80 hover:border-gold/40 hover:bg-goldSoft/40"
                    >
                      Telecharger
                    </a>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};
