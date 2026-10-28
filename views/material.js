/* MATERIAL EXPERIENCE — Page 03. One collection, its finishes, and its
   applications in architecture. Switching a finish is instant (no reload):
   the composite cross-fades, the URL is replaced, captions update. */
import { collections, site, spaces, neighbours, galleryFrames, spaceLabel } from "../../data/catalog.js";
import { $, $$, el, html, raw, asset, wireImages, reveal, preload, reducedMotion, stackMarkup, pendingMarkup, setTitle, pad2, ready, lastViewed } from "../lib.js";
import { Header } from "../chrome.js";
import { footerMarkup } from "./home.js";

export default function materialView({ collection: c, product: initial, replaceUrl }) {
  let product = initial;
  const { prev, next } = neighbours(c);
  const frames = galleryFrames(c);
  const real = c.applications.filter((a) => a.type !== "pending");
  const later = c.applications.filter((a) => a.type === "pending");
  const lead = real[0];

  const frameIndexFor = (app, prod) =>
    frames.findIndex((f) => f.space === app.space && f.area === app.area && (!f.product || !prod || f.product.id === prod.id)) + 1;

  const appMedia = (app, prod, opts = {}) => {
    if (app.type === "composite") return stackMarkup(c, prod, opts);
    if (app.type === "image" && app.image)
      return html`<img src="${asset(app.image)}" alt="${spaceLabel(app)} — ${c.name}" loading="lazy" decoding="async" data-fade>`;
    return pendingMarkup(app, prod);
  };

  const root = el(html`<div class="view view--material">
    <article class="mat on-dark">
      <section class="mat__stage wrap grid12" aria-labelledby="mat-name">
        <figure class="mat__figure">
          <div class="mat__frame frame" data-vt-target data-missing-label="${c.name}">
            ${raw(lead ? appMedia(lead, product, { eager: true }) : pendingMarkup(c.applications[0], product))}
          </div>
          <figcaption class="mat__caption">
            <span class="label">${lead ? spaceLabel(lead) : "Application"}</span>
            <span class="code js-code" aria-live="polite">${product.code}</span>
            <span class="label muted">${lead ? "Rendered application" : "Render in preparation"}</span>
          </figcaption>
        </figure>

        <div class="mat__info">
          <p class="mat__index num mat__in" style="--d:0">Material <b>${c.number}</b> / ${pad2(collections.length)}</p>
          <h1 class="mat__name mat__in" id="mat-name" style="--d:1">${c.name}</h1>
          <p class="label muted mat__in" style="--d:2">${site.season} Collection</p>
          <p class="mat__desc ko mat__in" style="--d:3">${c.description}</p>

          <div class="finishes mat__in" style="--d:4">
            <p class="finishes__head"><span class="label">Finishes</span><span class="num muted">${pad2(c.products.length)}</span></p>
            <ul class="finishes__list" role="list">
              ${c.products.map((p) => raw(html`<li>
                <button class="finish" type="button" data-id="${p.id}" aria-pressed="${p.id === product.id}">
                  <span class="finish__chip frame"><img src="${asset(p.thumb)}" alt="" width="220" height="220" loading="lazy" decoding="async"></span>
                  <span class="finish__code code">${p.code}</span>
                  <span class="finish__state label" aria-hidden="true">Selected</span>
                </button>
              </li>`))}
            </ul>
          </div>

          <a class="btn-line mat__cta mat__in js-gallery" style="--d:5" href="/material/${c.id}/applications/${lead ? frameIndexFor(lead, product) : 1}">
            <span>View applications</span>
            <span class="num">${pad2(frames.length)} views</span>
            <span class="arrow" aria-hidden="true"></span>
          </a>
        </div>
      </section>

      <section class="apps wrap" aria-labelledby="apps-title">
        <header class="apps__head grid12">
          <p class="label muted apps__eyebrow rv">Material ${c.number} — ${c.name}</p>
          <h2 class="apps__title rv" id="apps-title" style="--rv-delay:60ms">Applications<br>in Architecture</h2>
          <ol class="apps__index rv" style="--rv-delay:120ms">
            ${c.applications.map((a, i) => raw(html`<li>
              <a class="apps__index-item js-frame" href="/material/${c.id}/applications/${frameIndexFor(a, a.type === "composite" ? product : null)}" data-app="${i}">
                <span class="num muted">${pad2(i + 1)}</span>
                <span class="apps__space">${spaces[a.space].en}</span>
                <span class="label muted">${a.area}</span>
                <span class="apps__status label ${a.type === "pending" ? "is-pending" : ""}">${a.type === "pending" ? "In preparation" : "Rendered"}</span>
              </a>
            </li>`))}
          </ol>
        </header>

        ${lead ? raw(html`<a class="app app--lead grid12 rv js-frame" href="/material/${c.id}/applications/${frameIndexFor(lead, product)}" data-app="0">
          <div class="app__media frame">${raw(appMedia(lead, product))}</div>
          <div class="app__cap">
            <span class="num muted">01</span>
            <span class="app__space label">${spaceLabel(lead)}</span>
            <span class="code js-code">${product.code}</span>
            <span class="app__more label">Open gallery<span class="arrow" aria-hidden="true"></span></span>
          </div>
        </a>`) : ""}

        ${later.length ? raw(html`<div class="apps__more">
          <p class="apps__note label muted rv">Further applications — renders in preparation</p>
          <ul class="apps__grid" role="list">
            ${later.map((a, i) => raw(html`<li class="rv" style="--rv-delay:${(i % 3) * 70}ms">
              <a class="app app--pending js-frame" href="/material/${c.id}/applications/${frameIndexFor(a, null)}">
                <div class="app__media frame frame--45 js-pending" data-app-index="${c.applications.indexOf(a)}">${raw(appMedia(a, product))}</div>
                <div class="app__cap app__cap--row">
                  <span class="num muted">${pad2(real.length + i + 1)}</span>
                  <span class="app__space label muted">Planned application</span>
                </div>
              </a>
            </li>`))}
          </ul>
        </div>`) : ""}
      </section>

      <nav class="pager" aria-label="Other materials">
        <a class="pager__item pager__item--prev" href="/material/${prev.id}">
          <span class="pager__plate frame"><img src="${asset(prev.plate)}" alt="" loading="lazy"></span>
          <span class="pager__text">
            <span class="label muted"><span class="arrow arrow--left" aria-hidden="true"></span>&nbsp; Previous material</span>
            <span class="pager__name"><span class="num">${prev.number}</span> ${prev.name}</span>
          </span>
        </a>
        <a class="pager__item pager__item--next" href="/material/${next.id}">
          <span class="pager__text">
            <span class="label muted">Next material &nbsp;<span class="arrow" aria-hidden="true"></span></span>
            <span class="pager__name"><span class="num">${next.number}</span> ${next.name}</span>
          </span>
          <span class="pager__plate frame"><img src="${asset(next.plate)}" alt="" loading="lazy"></span>
        </a>
      </nav>
      <div class="mat__back wrap"><a class="tlink label" href="/collection?c=${c.id}"><span class="arrow arrow--left" aria-hidden="true"></span>&nbsp; Back to the index</a></div>
    </article>
    ${raw(footerMarkup())}
  </div>`);

  const stageFrame = $(".mat__frame", root);
  const leadFrame = $(".app--lead .app__media", root);
  let unreveal = () => {};

  /* Cross-fade a new composite into a frame (two isolated stacks). */
  function swapStack(frame) {
    if (!frame || !lead) return;
    const old = $$(".stack", frame);
    const wrap = document.createElement("div");
    wrap.innerHTML = stackMarkup(c, product, { eager: true, extraClass: "is-entering" });
    const stack = wrap.firstElementChild;
    frame.appendChild(stack);
    const imgs = $$("img", stack);
    let shown = false;
    const show = () => {
      if (shown) return; shown = true;
      requestAnimationFrame(() => {
        stack.classList.add("is-visible");
        const t = reducedMotion() ? 0 : 600;
        setTimeout(() => { old.forEach((o) => o.remove()); stack.classList.remove("is-entering", "is-visible"); }, t);
      });
    };
    Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()))).then(show);
    setTimeout(show, 900);           // never leave the user waiting on a slow decode
  }

  function select(id, { focus = false } = {}) {
    const p = c.products.find((x) => x.id === id);
    if (!p || p.id === product.id) return;
    product = p;
    $$(".finish", root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    $$(".js-code", root).forEach((n) => (n.textContent = p.code));
    swapStack(stageFrame);
    swapStack(leadFrame);
    $$(".js-pending .plate-pending", root).forEach((n) => (n.style.backgroundImage = `url('${asset(p.plate.large)}')`));
    if (lead) {
      const n = frameIndexFor(lead, p);
      $$(".js-frame", root).forEach((a) => {
        if (a.dataset.app === "0" || (a.dataset.app && c.applications[+a.dataset.app].type === "composite"))
          a.href = `/material/${c.id}/applications/${n}`;
      });
      $(".js-gallery", root).href = `/material/${c.id}/applications/${n}`;
    }
    replaceUrl(`/material/${c.id}/${p.id}`);
    lastViewed.set(`${c.id}/${p.id}`);
    setTitle(c.name, p.code);
    if (focus) $(`.finish[data-id="${id}"]`, root).focus();
  }

  $$(".finish", root).forEach((b) => {
    b.addEventListener("click", () => select(b.dataset.id));
    b.addEventListener("pointerenter", () => {
      const p = c.products.find((x) => x.id === b.dataset.id);
      preload([p.overlay]);
    });
  });
  // Arrow keys move through finishes when one has focus (radio-like).
  $(".finishes__list", root).addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const ids = c.products.map((p) => p.id);
    const i = ids.indexOf(product.id);
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    e.preventDefault();
    select(ids[(i + d + ids.length) % ids.length], { focus: true });
  });

  return {
    el: root,
    vtKind: "material",
    mount() {
      setTitle(c.name, product.code);
      Header.setTone("light");
      Header.setSolid(false);
      Header.setActiveNav(null);
      Header.setCrumbs([
        { label: "Home", href: "/" },
        { label: "Collection", href: `/collection?c=${c.id}` },
        { label: c.name },
      ]);
      wireImages(root);
      unreveal = reveal(root);
      ready(root);
      lastViewed.set(`${c.id}/${product.id}`);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      // Warm the cache for the neighbours and the other finishes.
      setTimeout(() => preload([...c.products.map((p) => p.overlay), prev.scene.space, next.scene.space]), 1200);
    },
    unmount() { unreveal(); window.removeEventListener("scroll", onScroll); },
  };

  function onScroll() {
    Header.setSolid(window.scrollY > 24);
  }
}
