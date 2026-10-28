/* History-API router with View Transitions (progressive enhancement).
   Netlify serves index.html for every path (_redirects), so a refresh on any
   deep link renders the same view. */
import { reducedMotion } from "./lib.js";

export function createRouter({ routes, outlet, onBeforeRender, onAfterRender }) {
  let current = null;       // { view, path }
  let navId = 0;
  history.scrollRestoration = "manual";

  function match(pathname) {
    const clean = pathname.replace(/\/+$/, "") || "/";
    for (const r of routes) {
      const m = clean.match(r.pattern);
      if (m) return { route: r, params: m.groups || {} };
    }
    return null;
  }

  function saveScroll() {
    const st = history.state || {};
    history.replaceState({ ...st, scrollY: window.scrollY }, "", location.href);
  }

  async function render(url, { scrollY = null, hash = "", transition = true, source = null } = {}) {
    const id = ++navId;
    const u = new URL(url, location.origin);
    const found = match(u.pathname);
    if (found && found.route.redirect) {
      const to = found.route.redirect(found.params, u);
      history.replaceState({}, "", to);
      return render(to, { scrollY, transition: false });
    }
    const route = found ? found.route : routes.find((r) => r.notFound);
    const params = found ? found.params : {};

    onBeforeRender && onBeforeRender(route, params, u);
    const view = route.view({ params, url: u, source });

    const swap = () => {
      if (id !== navId) return;
      if (current && current.view.unmount) current.view.unmount();
      outlet.replaceChildren(view.el);
      current = { view, path: u.pathname };
      view.mount && view.mount();
      if (scrollY != null) window.scrollTo(0, scrollY);
      else if (view.initialScroll) view.initialScroll(u);
      else window.scrollTo(0, 0);
      onAfterRender && onAfterRender(route, params, u, view);
    };

    const canVT = transition && document.startViewTransition && !reducedMotion() && current;
    if (canVT) {
      document.documentElement.dataset.vt = view.vtKind || "fade";
      const t = document.startViewTransition(swap);
      t.finished.finally(() => {
        delete document.documentElement.dataset.vt;
        if (source) source.style.viewTransitionName = "";
      });
    } else {
      swap();
    }
  }

  function navigate(to, { replace = false, source = null } = {}) {
    const u = new URL(to, location.origin);
    // Same view can absorb the URL (e.g. "/" ⇄ "/collection"): scroll, don't re-render.
    if (current && current.view.handles && current.view.handles(u)) {
      saveScroll();
      if (u.pathname + u.search !== location.pathname + location.search) {
        history.pushState({}, "", u.pathname + u.search + u.hash);
      }
      current.view.initialScroll(u, true);
      return;
    }
    saveScroll();
    if (replace) history.replaceState({}, "", u.pathname + u.search + u.hash);
    else history.pushState({}, "", u.pathname + u.search + u.hash);
    render(u.href, { source });
  }

  /* Intercept same-origin links. */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download") || a.dataset.external != null) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (/\.(jpg|png|pdf|svg)$/i.test(u.pathname)) return;
    e.preventDefault();
    // Shared-element hint for the view transition
    const media = a.querySelector("[data-vt-source]");
    if (media && document.startViewTransition && !reducedMotion()) media.style.viewTransitionName = "material-media";
    navigate(u.pathname + u.search + u.hash, { source: media });
  });

  window.addEventListener("popstate", () => {
    const st = history.state || {};
    const u = new URL(location.href);
    if (current && current.view.handles && current.view.handles(u)) {
      if (current.view.sync) current.view.sync(u);
      if (st.scrollY == null) current.view.initialScroll(u, false);
      else window.scrollTo({ top: st.scrollY, behavior: "auto" });
      return;
    }
    render(location.href, { scrollY: st.scrollY ?? null });
  });

  return {
    start() { render(location.href, { transition: false, scrollY: (history.state || {}).scrollY ?? null }); },
    navigate,
    replaceUrl(path, state = {}) { history.replaceState({ ...(history.state || {}), ...state }, "", path); },
    get current() { return current; },
  };
}
