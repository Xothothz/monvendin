"use client";

import { useEffect } from "react";

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
  }, [href]);

  return (
    <>
      <div id="fb-root" />
      <div
        className="fb-comments"
        data-href={href}
        data-width="100%"
        data-numposts={numPosts}
      />
    </>
  );
};
