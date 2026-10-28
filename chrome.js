/* Site chrome: header (tone, breadcrumb) and the collections menu. */
import { collections, site } from "../data/catalog.js";
import { $, $$, asset, html, raw, pad2 } from "./lib.js";

const header = $(".site-header");
const crumbsOl = $(".crumbs ol");

export const Header = {
  setTone(tone) { header.dataset.tone = tone; },          // "light" text on dark | "dark" text on ivory
  setSolid(solid) { header.dataset.solid = String(!!solid); },
  setCrumbs(items = []) {
    crumbsOl.innerHTML = items
      .map((c, i) => {
        const last = i === items.length - 1;
        return last
          ? html`<li><span class="label" aria-current="page">${c.label}</span></li>`
          : html`<li><a class="tlink label" href="${c.href}">${c.label}</a></li>`;
      })
      .join("");
    header.classList.toggle("has-crumbs", items.length > 0);
  },
  setActiveNav(key) {
    $$("[data-nav]", header).forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  },
};

/* ---------------- Menu (dialog) ---------------- */
const menu = $("#menu");
const toggle = $(".menu-toggle");
const list = $(".menu__list", menu);
const preview = $(".menu__preview", menu);
let lastFocus = null;

list.innerHTML = collections
  .map((c) => html`<li>
      <a class="menu__item" href="/material/${c.id}" data-id="${c.id}">
        <span class="num">${c.number}</span>
        <span class="menu__name">${c.name}</span>
        <span class="num muted">${pad2(c.products.length)} finishes</span>
      </a>
    </li>`)
  .join("");
$(".menu__tagline", menu).textContent = site.tagline;
preview.innerHTML = collections
  .map((c) => html`<img src="${asset(c.plate)}" alt="" data-id="${c.id}" loading="lazy">`)
  .join("");

function showPreview(id) {
  $$("img", preview).forEach((i) => i.classList.toggle("is-active", i.dataset.id === id));
}
$$(".menu__item", menu).forEach((a) => {
  a.addEventListener("pointerenter", () => showPreview(a.dataset.id));
  a.addEventListener("focus", () => showPreview(a.dataset.id));
});

export function openMenu() {
  if (!menu.hidden) return;
  lastFocus = document.activeElement;
  menu.hidden = false;
  document.body.classList.add("is-locked");
  toggle.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => menu.classList.add("is-open"));
  const cur = location.pathname.split("/")[2];
  $$(".menu__item", menu).forEach((a) => {
    if (a.dataset.id === cur) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  showPreview(cur || collections[0].id);
  $(".menu__close", menu).focus();
}

export function closeMenu({ restoreFocus = true } = {}) {
  if (menu.hidden) return;
  menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-locked");
  const finish = () => { menu.hidden = true; };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) finish(); else setTimeout(finish, 260);
  if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
}

toggle.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
$(".menu__close", menu).addEventListener("click", () => closeMenu());
menu.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu({ restoreFocus: false }); });
document.addEventListener("keydown", (e) => {
  if (menu.hidden) return;
  if (e.key === "Escape") { e.preventDefault(); closeMenu(); }
  if (e.key === "Tab") {                       // focus trap
    const f = $$("a, button", menu).filter((n) => n.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

export const isMenuOpen = () => !menu.hidden;
