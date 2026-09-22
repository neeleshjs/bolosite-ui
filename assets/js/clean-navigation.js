(() => {
  "use strict";

  // The owner workspace owns its hash/history navigation and active panels.
  if (document.currentScript?.hasAttribute("data-native-section-navigation")) return;

  if (window.BoloSiteCleanNavigation) return;

  const STORAGE_KEY = "bolosite_clean_navigation_v1";
  const MAX_PENDING_AGE_MS = 2 * 60 * 1000;
  const LEGACY_PATHS = new Map([
    ["/index", "/"],
    ["/index.html", "/"],
    ["/user", "/visitor"],
    ["/user.html", "/visitor"],
    ["/client", "/owner"],
    ["/client.html", "/owner"],
    ["/proof", "/trust"],
    ["/proof.html", "/trust"],
    ["/client-portal", "/owner-portal"],
    ["/client-portal.html", "/owner-portal"],
    ["/bolosite_client_portal.html", "/owner-portal"],
    ["/bolosite-test", "/test-lab"],
    ["/bolosite-test.html", "/test-lab"],
    ["/api/pages/home", "/"],
    ["/api/pages/visitor", "/visitor"],
    ["/api/pages/owner-guide", "/owner"],
    ["/api/pages/owner-portal", "/owner-portal"],
    ["/api/pages/test-lab", "/test-lab"],
  ]);

  const isWebPage = /^https?:$/.test(window.location.protocol);

  function canonicalPath(pathname) {
    let path = String(pathname || "/").replace(/\\/g, "/");
    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace(/\/{2,}/g, "/");
    const withoutTrailingSlash = path.length > 1 ? path.replace(/\/+$/, "") : path;
    return LEGACY_PATHS.get(withoutTrailingSlash.toLowerCase()) || path;
  }

  function decodeTarget(hash) {
    const raw = String(hash || "").replace(/^#/, "");
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch (_) {
      return raw;
    }
  }

  function cleanRelativeUrl(url) {
    return `${canonicalPath(url.pathname)}${url.search || ""}`;
  }

  function currentCleanUrl() {
    return `${canonicalPath(window.location.pathname)}${window.location.search || ""}`;
  }

  function replaceAddressBar() {
    if (!isWebPage) return;
    const cleanUrl = currentCleanUrl();
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== cleanUrl) {
      window.history.replaceState(window.history.state, "", cleanUrl);
    }
  }

  function rememberTarget(pathname, search, targetId) {
    if (!targetId) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        path: canonicalPath(pathname),
        search: String(search || ""),
        targetId,
        savedAt: Date.now(),
      }));
    } catch (_) {}
  }

  function takeRememberedTarget() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      if (!raw) return "";
      const pending = JSON.parse(raw);
      const age = Date.now() - Number(pending?.savedAt || 0);
      if (age < 0 || age > MAX_PENDING_AGE_MS) return "";
      if (canonicalPath(pending?.path) !== canonicalPath(window.location.pathname)) return "";
      if (String(pending?.search || "") !== String(window.location.search || "")) return "";
      return String(pending?.targetId || "");
    } catch (_) {
      return "";
    }
  }

  function scrollOffset() {
    const header = document.querySelector("header, .site-header, .navbar, [data-sticky-header]");
    const toc = document.querySelector(".toc, .sidebar");
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const tocHeight = toc && getComputedStyle(toc).position === "sticky"
      ? (toc.getBoundingClientRect().height || 0)
      : 0;
    return Math.min(headerHeight, 140) + Math.min(tocHeight, 90) + 14;
  }

  function scrollToTarget(targetId, options = {}) {
    const id = String(targetId || "").replace(/^#/, "");
    if (!id) return false;
    if (id.toLowerCase() === "top") {
      window.scrollTo({ top: 0, behavior: options.behavior || "smooth" });
      return true;
    }

    const target = document.getElementById(id);
    if (!target) return false;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior = reduceMotion ? "auto" : (options.behavior || "smooth");
    const top = window.scrollY + target.getBoundingClientRect().top - scrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
    if (options.focus === true) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      try {
        target.focus({ preventScroll: true });
      } catch (_) {
        target.focus();
      }
    }
    return true;
  }

  function navigate(rawUrl, options = {}) {
    let destination;
    try {
      destination = new URL(String(rawUrl || "/"), window.location.href);
    } catch (_) {
      return false;
    }
    if (!/^https?:$/.test(destination.protocol) || destination.origin !== window.location.origin) {
      return false;
    }

    const targetId = String(options.targetId || decodeTarget(destination.hash) || "");
    const destinationPath = canonicalPath(destination.pathname);
    const cleanDestination = `${destinationPath}${destination.search || ""}`;
    const sameDocument = destinationPath === canonicalPath(window.location.pathname)
      && destination.search === window.location.search;

    if (targetId && sameDocument) {
      scrollToTarget(targetId, options);
      replaceAddressBar();
      return true;
    }
    if (targetId) rememberTarget(destinationPath, destination.search, targetId);
    window.location.assign(cleanDestination);
    return true;
  }

  const initialHashTarget = isWebPage ? decodeTarget(window.location.hash) : "";
  replaceAddressBar();

  function enhanceLinks() {
    if (!isWebPage) return;
    document.querySelectorAll("a[href]").forEach((link) => {
      const rawHref = String(link.getAttribute("href") || "").trim();
      if (!rawHref || rawHref === "#" || /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(rawHref)) return;
      let destination;
      try {
        destination = new URL(rawHref, window.location.href);
      } catch (_) {
        return;
      }
      if (destination.origin !== window.location.origin) return;
      const targetId = decodeTarget(destination.hash);
      if (targetId) link.dataset.bolositeScrollTarget = targetId;
      const sameDocument = canonicalPath(destination.pathname) === canonicalPath(window.location.pathname)
        && destination.search === window.location.search;
      if (targetId && sameDocument) return;
      link.setAttribute("href", cleanRelativeUrl(destination));
    });

    document.querySelectorAll("[data-fallback-href]").forEach((control) => {
      const rawHref = String(control.getAttribute("data-fallback-href") || "").trim();
      if (!rawHref || /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(rawHref)) return;
      try {
        const destination = new URL(rawHref, window.location.href);
        if (destination.origin !== window.location.origin) return;
        const targetId = decodeTarget(destination.hash);
        if (targetId) control.dataset.bolositeFallbackTarget = targetId;
        control.setAttribute("data-fallback-href", cleanRelativeUrl(destination));
      } catch (_) {}
    });
  }

  document.addEventListener("click", (event) => {
    if (!isWebPage || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const fallbackControl = event.target.closest?.("[data-fallback-href]");
    const fallbackTarget = String(fallbackControl?.dataset?.bolositeFallbackTarget || "");
    const fallbackModalId = String(fallbackControl?.dataset?.openModal || "");
    if (fallbackControl && fallbackTarget && (!fallbackModalId || !document.getElementById(fallbackModalId))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(fallbackControl.getAttribute("data-fallback-href"), { targetId: fallbackTarget });
      return;
    }

    const link = event.target.closest?.("a[href]");
    if (!link || link.hasAttribute("download")) return;
    if (link.target && link.target.toLowerCase() !== "_self") return;

    const rawHref = String(link.getAttribute("href") || "").trim();
    if (!rawHref || /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(rawHref)) return;
    if (rawHref === "#") {
      event.preventDefault();
      replaceAddressBar();
      return;
    }

    let destination;
    try {
      destination = new URL(rawHref, window.location.href);
    } catch (_) {
      return;
    }
    if (destination.origin !== window.location.origin) return;

    const targetId = String(link.dataset.bolositeScrollTarget || decodeTarget(destination.hash) || "");
    const destinationPath = canonicalPath(destination.pathname);
    const isSameDocument = destinationPath === canonicalPath(window.location.pathname)
      && destination.search === window.location.search;
    const isLegacyPath = destinationPath !== destination.pathname;
    if (!targetId && !isLegacyPath) return;

    event.preventDefault();
    if (targetId && isSameDocument) {
      scrollToTarget(targetId, { focus: link.classList.contains("skip-link") });
      queueMicrotask(replaceAddressBar);
      return;
    }
    navigate(destination.href, { targetId });
  }, true);

  window.addEventListener("hashchange", () => {
    const targetId = decodeTarget(window.location.hash);
    replaceAddressBar();
    if (targetId) scrollToTarget(targetId);
  });

  function finishInitialNavigation() {
    enhanceLinks();
    const targetId = initialHashTarget || takeRememberedTarget();
    if (!targetId) return;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      scrollToTarget(targetId, { behavior: "auto", focus: targetId === "main" });
      replaceAddressBar();
    }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finishInitialNavigation, { once: true });
  } else {
    finishInitialNavigation();
  }

  window.BoloSiteCleanNavigation = Object.freeze({
    canonicalPath,
    navigate,
    replaceAddressBar,
    scrollTo: scrollToTarget,
  });
})();
