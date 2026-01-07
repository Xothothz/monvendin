"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  CaretDown,
  Clock,
  EnvelopeSimple,
  MagnifyingGlass
} from "@phosphor-icons/react";
import { siteNav, siteUtilities, type SiteNavLink } from "@/lib/site-nav";

const utilityIcons = {
  briefcase: Briefcase,
  clock: Clock,
  mail: EnvelopeSimple,
  search: MagnifyingGlass
};

export const SiteHeader = () => {
  const nav = siteNav.map((item) => ({
    ...item,
    sections: item.sections.map((section) => ({
      ...section,
      links: section.links.filter((link) => !link.adminOnly)
    }))
  }));
  const utilities = siteUtilities.map((item) => ({
    ...item,
    icon: utilityIcons[item.icon]
  }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(null);
  const [desktopOpenIndex, setDesktopOpenIndex] = useState<number | null>(null);
  const [openSectionByMenu, setOpenSectionByMenu] = useState<Record<number, number | null>>({});
  const headerRef = useRef<HTMLElement | null>(null);
  const isAnyMenuOpen =
    menuOpen || desktopOpenIndex !== null || mobileOpenIndex !== null;
  const closeMenus = () => {
    setDesktopOpenIndex(null);
    setMobileOpenIndex(null);
    setOpenSectionByMenu({});
  };

  const renderNavLink = (link: SiteNavLink, className: string) => {
    if (link.external) {
      return (
        <a
          href={link.href}
          target={link.newTab ? "_blank" : undefined}
          rel={link.newTab ? "noreferrer" : undefined}
          className={className}
          onClick={closeMenus}
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link href={link.href} className={className} onClick={closeMenus}>
        {link.label}
      </Link>
    );
  };

  const openDesktopMenu = (index: number) => {
    setDesktopOpenIndex(index);
    setOpenSectionByMenu((prev) => ({
      ...prev,
      [index]: null
    }));
  };
  const logo = (
    <Link href="/" className="flex items-center gap-4">
      <img
        src="/blason-vendin.png"
        alt="Blason de Vendin-les-Bethune"
        className="h-16 w-auto sm:h-20"
      />
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-[0.35em] text-slate">
          Vendin-les-Bethune
        </span>
        <span className="text-sm font-semibold uppercase tracking-widest text-ink">
          Portail citoyen
        </span>
      </div>
    </Link>
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!headerRef.current || !target) {
        return;
      }
      if (!headerRef.current.contains(target)) {
        closeMenus();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <>
      <header
        id="site-header"
        ref={headerRef}
        className="site-header sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:hidden">
        {logo}
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink/70 ring-1 ring-ink/5 hover:bg-goldSoft/70 focus-ring"
        >
          {menuOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      <nav id="site-nav" className="border-t border-white/60 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-between gap-6 py-3">
            {logo}
            <div className="flex items-center gap-10">
              <ul className="ml-6 xl:ml-8 flex items-center gap-0 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
                {nav.map((item, index) => {
                  const isOpen = desktopOpenIndex === index;
                  const openSectionIndex = openSectionByMenu[index] ?? null;
                  return (
                    <li key={item.href} className="relative">
                      <button
                        type="button"
                        onClick={() => openDesktopMenu(index)}
                        onFocus={() => openDesktopMenu(index)}
                        className="flex items-center gap-2 rounded-full px-2.5 py-1.5 whitespace-nowrap hover:bg-goldSoft/70 hover:text-ink"
                        aria-expanded={isOpen}
                        aria-controls={`desktop-menu-${index}`}
                      >
                        {item.label}
                        {item.sections.length > 0 ? (
                          <CaretDown
                            className={clsx(
                              "h-4 w-4 text-ink/50 transition",
                              isOpen && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                      <div
                        id={`desktop-menu-${index}`}
                        className={clsx(
                          "absolute left-0 top-full z-30 mt-3 transition duration-200",
                          isOpen
                            ? "opacity-100 translate-y-0"
                            : "pointer-events-none opacity-0 translate-y-2"
                        )}
                      >
                        <div className="inline-flex max-w-[calc(100vw-32px)] overflow-visible rounded-xl border border-white/60 bg-white/80 px-4 py-4 backdrop-blur-xl shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
                          <ul className="space-y-3 min-w-[190px]">
                            {item.sections.map((section, sectionIndex) => {
                              const isActive = openSectionIndex === sectionIndex;
                              const hasChildren = (section.links?.length ?? 0) > 0;
                              return (
                                <li key={section.title} className="relative">
                                  <button
                                    type="button"
                                    onMouseEnter={() =>
                                      setOpenSectionByMenu((prev) => ({
                                        ...prev,
                                        [index]: sectionIndex
                                      }))
                                    }
                                    className={clsx(
                                      "flex w-full items-center justify-between rounded-full px-2.5 py-1.5 text-left text-sm font-semibold uppercase tracking-[0.18em] text-ink/70 hover:bg-goldSoft/70 hover:text-ink",
                                      isActive && "bg-goldSoft/70 text-ink"
                                    )}
                                  >
                                    <span>{section.title}</span>
                                    {hasChildren ? <span className="text-ink/60">&gt;</span> : null}
                                  </button>
                                  {hasChildren && isActive ? (
                                    <div className="absolute left-full top-0 ml-2">
                                      <ul className="space-y-3 w-max shrink-0 rounded-xl border border-white/60 bg-white/85 px-4 py-3 backdrop-blur-xl shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
                                        {section.links.map((link) => (
                                          <li key={link.href}>
                                            {renderNavLink(
                                              link,
                                              "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70 hover:bg-goldSoft/70 hover:text-ink"
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="ml-6 flex items-center gap-3">
                {utilities.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_28px_rgba(12,44,132,0.28)] hover:bg-ink whitespace-nowrap"
                  >
                    <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className={clsx(
              "lg:hidden overflow-hidden transition-all duration-300",
              menuOpen ? "max-h-[1400px] py-4" : "max-h-0"
            )}
          >
            <div className="space-y-4">
              {nav.map((item, index) => {
                const isOpen = mobileOpenIndex === index;
                const openSectionIndex = openSectionByMenu[index] ?? null;
                return (
                  <div
                    key={item.href}
                    className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg ring-1 ring-ink/5 shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <Link
                        href={item.href}
                        className="text-sm font-semibold uppercase whitespace-nowrap"
                        onClick={closeMenus}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileOpenIndex(isOpen ? null : index)}
                        className="rounded-full border border-white/60 bg-white/70 px-2 py-1 text-ink/70 ring-1 ring-ink/5"
                        aria-expanded={isOpen}
                        aria-controls={`menu-section-${index}`}
                      >
                        <CaretDown
                          className={clsx("h-4 w-4 transition", isOpen && "rotate-180")}
                        />
                      </button>
                    </div>
                    <div
                      id={`menu-section-${index}`}
                      className={clsx(
                        "grid gap-4 overflow-hidden px-4 pb-4 transition-all duration-300",
                        isOpen ? "max-h-[900px]" : "max-h-0 pb-0"
                      )}
                    >
                      {item.sections.map((section, sectionIndex) => {
                        const isCollapsible = section.collapsible !== false;
                        const isSectionOpen = openSectionIndex === sectionIndex;
                        return (
                          <div
                            key={section.title}
                            className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm"
                          >
                            {isCollapsible ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenSectionByMenu((prev) => ({
                                      ...prev,
                                      [index]: prev[index] === sectionIndex ? null : sectionIndex
                                    }))
                                  }
                                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70"
                                  aria-expanded={isSectionOpen}
                                  aria-controls={`mobile-section-${index}-${sectionIndex}`}
                                >
                                  {section.title}
                                  <CaretDown
                                    className={clsx(
                                      "h-4 w-4 text-ink/50 transition",
                                      isSectionOpen && "rotate-180"
                                    )}
                                  />
                                </button>
                                <div
                                  id={`mobile-section-${index}-${sectionIndex}`}
                                  className={clsx(
                                    "overflow-hidden transition-all duration-300",
                                    isSectionOpen ? "max-h-[320px] pb-3" : "max-h-0"
                                  )}
                                >
                                  <ul className="space-y-2 px-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
                                    {section.links.map((link) => (
                                      <li key={link.href}>
                                        {renderNavLink(link, "block rounded-lg px-2 py-1")}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <>
                                {section.title ? (
                                  <div className="px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
                                    {section.title}
                                  </div>
                                ) : null}
                                <ul className="space-y-2 px-3 pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
                                  {section.links.map((link) => (
                                    <li key={link.href}>
                                      <Link
                                        href={link.href}
                                        className="block rounded-lg px-2 py-1"
                                        onClick={closeMenus}
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm ring-1 ring-ink/5">
                {utilities.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/70 ring-1 ring-ink/5 whitespace-nowrap"
                  >
                    <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <div
      className={clsx(
        "fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px] transition-opacity duration-200",
        isAnyMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden="true"
    />
    </>
  );
};
