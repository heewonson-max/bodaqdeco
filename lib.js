/* Small shared helpers — DOM, media, motion. */
import { site, spaces } from "../data/catalog.js";

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Absolute URL for an asset stored in the catalogue as a root-relative path. */
export const asset = (p) => (p ? (/^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : "/" + p) : "");

/* Tagged template → DocumentFragment / Element. Values are escaped unless
   wrapped with raw(). */
const RAW = Symbol("raw");
export const raw = (s) => ({ [RAW]: true, s });
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function html(strings, ...vals) {
  let out = "";
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) {
      const v = vals[i];
      if (Array.isArray(v)) out += v.map((x) => (x && x[RAW] ? x.s : esc(x))).join("");
      else out += v && v[RAW] ? v.s : esc(v);
    }
  });
  return out;
}
export function el(markup) {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* Images: fade in when decoded, fall back to a designed state on error. */
export function wireImages(root) {
  $$("img", root).forEach((img) => {
    const done = () => img.classList.add("is-loaded");
    const fail = () => {
      const frame = img.closest(".frame");
      if (frame) {
        frame.classList.add("is-missing");
        frame.dataset.missingLabel = frame.dataset.missingLabel || "Image unavailable";
      }
      img.classList.add("is-loaded");
    };
    if (img.complete && img.naturalWidth) done();
    else if (img.complete && img.currentSrc) fail();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", fail, { once: true });
    }
  });
}

/* Preload a list of image URLs (used for hover-intent & gallery neighbours). */
const preloaded = new Set();
export function preload(urls) {
  urls.filter(Boolean).forEach((u) => {
    const src = asset(u);
    if (preloaded.has(src)) return;
    preloaded.add(src);
    const i = new Image();
    i.decoding = "async";
    i.src = src;
  });
}

/* Composite stack markup: the original render × finish overlay. */
export function stackMarkup(collection, product, { eager = false, extraClass = "" } = {}) {
  const sc = collection.scene;
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return html`<div class="stack ${extraClass}" data-product="${product.id}" style="--focus:${sc.focus}">
      <img class="layer-base" src="${asset(sc.space)}" alt="" width="${sc.width}" height="${sc.height}" ${raw(load)} decoding="async" style="object-position:${sc.focus}">
      <img class="layer-overlay" src="${asset(product.overlay)}" alt="${sc.alt(product.code)}" width="${sc.width}" height="${sc.height}" ${raw(load)} decoding="async" style="object-position:${sc.focus}">
    </div>`;
}

/* Placeholder plate for an application that has no render yet. */
export function pendingMarkup(app, product, { compact = false } = {}) {
  const bg = product ? asset(product.plate.large) : "";
  return html`<div class="plate-pending" style="background-image:url('${bg}')" role="img"
      aria-label="${spaces[app.space].en} / ${app.area} — application render in preparation">
      <span class="plate-pending__top label">${product ? "Material plate · " + product.code : "Material plate"}</span>
      <span class="plate-pending__title">${spaces[app.space].en}<small>${app.area}</small></span>
      <span class="plate-pending__status label">Render in preparation</span>
      ${compact ? "" : ""}
    </div>`;
}

/* Scroll reveal (once). Elements with .rv / .rv-fade inside root. */
let io;
export function reveal(root) {
  const items = $$(".rv, .rv-fade", root);
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((n) => n.classList.add("is-in"));
    return () => {};
  }
  io = io || new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((n) => io.observe(n));
  return () => items.forEach((n) => io.unobserve(n));
}

export const pad2 = (n) => String(n).padStart(2, "0");

export function setTitle(...parts) {
  document.title = [...parts.filter(Boolean), `Bodaq Deco ${site.season.replace(/\s/g, "")}`].join(" — ");
}

/* Root-level CSS variable for the logo mask (path lives in the catalogue). */
export function applySiteTokens() {
  document.documentElement.style.setProperty("--logo-url", `url("${asset(site.logoMask)}")`);
}

/* Mark a view ready. During a View Transition the new state is snapshotted
   immediately, so intro animations are skipped (the transition is the motion). */
export function ready(root) {
  if (document.documentElement.dataset.vt) root.classList.add("is-ready", "no-intro");
  else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
}

/* "Last viewed" memory so the index can show where the visitor left off. */
export const lastViewed = {
  get() { try { return sessionStorage.getItem("bodaq:last"); } catch { return null; } },
  set(v) { try { sessionStorage.setItem("bodaq:last", v); } catch { /* storage unavailable */ } },
};
