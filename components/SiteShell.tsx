"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type SiteShellProps = {
  children: React.ReactNode;
};

export const SiteShell = ({ children }: SiteShellProps) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/gestion");

  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    const update = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--site-header-h", `${height}px`);
    };

    update();
    const raf1 = requestAnimationFrame(update);
    const raf2 = requestAnimationFrame(update);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => update());
      observer.observe(header);
    } else {
      window.addEventListener("resize", update);
    }

    const onLoad = () => update();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("load", onLoad);
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener("resize", update);
      }
    };
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8 page-enter">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};
