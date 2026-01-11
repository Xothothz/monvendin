"use client";

import { useEffect, useRef, useState } from "react";

const APP_ID = "910258654673702";
const SDK_URL =
  `https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v20.0&appId=${APP_ID}&autoLogAppEvents=1`;

declare global {
  interface Window {
    FB?: { XFBML?: { parse: (element?: HTMLElement | null) => void } };
  }
}

type FacebookCommentsProps = {
  href: string;
  numPosts?: number;
};

export const FacebookComments = ({ href, numPosts = 8 }: FacebookCommentsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => {
      const nextWidth = Math.max(320, Math.min(1000, Math.floor(node.clientWidth)));
      setWidth(nextWidth);
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("resize", update);
      };
    }

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const parse = () => {
      if (window.FB?.XFBML?.parse) {
        window.FB.XFBML.parse();
      }
    };

    if (document.getElementById("facebook-jssdk")) {
      parse();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_URL;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = parse;
    document.body.appendChild(script);
  }, [href, width]);

  return (
    <>
      <div id="fb-root" />
      <div ref={containerRef} className="w-full">
        <div
          className="fb-comments"
          data-href={href}
          data-width={width || 640}
          data-numposts={numPosts}
        />
      </div>
    </>
  );
};
