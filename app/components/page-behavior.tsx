"use client";

import { useEffect } from "react";

export function PageBehavior() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible"));
    }, { threshold: 0.14 });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    const releases = (window as Window & { QUILLCRYPT_RELEASES?: Record<string, string> }).QUILLCRYPT_RELEASES;
    document.querySelectorAll<HTMLAnchorElement>("[data-release]").forEach((link) => {
      const releaseUrl = releases?.[link.dataset.release ?? ""];
      if (releaseUrl) {
        link.href = releaseUrl;
        if (/^https?:\/\//i.test(releaseUrl)) link.removeAttribute("download");
        else link.setAttribute("download", "");
        return;
      }
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.classList.add("release-unavailable");
      link.textContent = `${link.dataset.release === "chrome" ? "Chrome" : "Firefox"} release link unavailable`;
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
