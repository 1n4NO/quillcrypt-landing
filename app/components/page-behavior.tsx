"use client";

import { useEffect } from "react";

export function PageBehavior() {
  useEffect(() => {
    const progress = document.querySelector<HTMLElement>(".progress span");
    const updateProgress = () => {
      if (!progress) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible"));
    }, { threshold: 0.14 });

    window.addEventListener("scroll", updateProgress, { passive: true });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    updateProgress();

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
      window.removeEventListener("scroll", updateProgress);
      observer.disconnect();
    };
  }, []);

  return <div className="progress" aria-hidden="true"><span /></div>;
}
