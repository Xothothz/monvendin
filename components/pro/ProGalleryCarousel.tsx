"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProGalleryItem = {
  src: string;
  alt: string;
  caption?: string | null;
};

type ProGalleryCarouselProps = {
  items: ProGalleryItem[];
  intervalMs?: number;
};

const DEFAULT_INTERVAL_MS = 5000;

export const ProGalleryCarousel = ({
  items,
  intervalMs = DEFAULT_INTERVAL_MS
}: ProGalleryCarouselProps) => {
  const total = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeItem = items[activeIndex];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (activeIndex >= total) {
      setActiveIndex(0);
    }
  }, [activeIndex, total]);

  useEffect(() => {
    if (total <= 1 || isLightboxOpen) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(intervalId);
  }, [intervalMs, isLightboxOpen, total]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowRight" && total > 1) {
        setActiveIndex((prev) => (prev + 1) % total);
      } else if (event.key === "ArrowLeft" && total > 1) {
        setActiveIndex((prev) => (prev - 1 + total) % total);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLightboxOpen, total]);

  if (!activeItem) return null;

  return (
    <div className="pro-gallery-viewer-wrap">
      <div className="pro-gallery-viewer">
        <button
          type="button"
          className="pro-gallery-viewer-button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Voir l'image en grand"
        >
          <img
            src={activeItem.src}
            alt={activeItem.alt}
            className="pro-gallery-viewer-image"
            loading="lazy"
          />
        </button>

        {total > 1 ? (
          <div className="pro-gallery-controls">
            <button
              type="button"
              className="pro-gallery-control"
              onClick={() => setActiveIndex((prev) => (prev - 1 + total) % total)}
              aria-label="Image precedente"
            >
              Precedent
            </button>
            <button
              type="button"
              className="pro-gallery-control"
              onClick={() => setActiveIndex((prev) => (prev + 1) % total)}
              aria-label="Image suivante"
            >
              Suivant
            </button>
          </div>
        ) : null}

        {total > 1 ? (
          <div className="pro-gallery-counter">
            {activeIndex + 1} / {total}
          </div>
        ) : null}
      </div>

      {activeItem.caption ? (
        <p className="pro-gallery-caption pro-text pro-text-muted">{activeItem.caption}</p>
      ) : null}

      {total > 1 ? (
        <div className="pro-gallery-thumbs" role="tablist" aria-label="Selection des images">
          {items.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              className={`pro-gallery-thumb ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Voir l'image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}

      {isLightboxOpen && isMounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.alt}
              className="fixed inset-0 z-[2147483647] bg-ink/70 backdrop-blur-sm"
              onClick={() => setIsLightboxOpen(false)}
            >
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
                <div
                  className="relative flex items-center justify-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute right-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card"
                  >
                    Fermer
                  </button>
                  {total > 1 ? (
                    <span className="absolute left-3 top-3 z-[2147483648] rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-card">
                      Image {activeIndex + 1} / {total}
                    </span>
                  ) : null}
                  <img
                    src={activeItem.src}
                    alt={activeItem.alt}
                    className="max-h-[85vh] w-auto max-w-[90vw] object-contain block"
                  />
                </div>
              </div>
              {total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveIndex((prev) => (prev - 1 + total) % total);
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-sm"
                  >
                    Precedent
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveIndex((prev) => (prev + 1) % total);
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink shadow-sm"
                  >
                    Suivant
                  </button>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
