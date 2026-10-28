/* HOME — Page 01 hero + Page 02 collection index (same document, so the
   hero hands over to the index with one continuous scroll). */
import { site, collections, allProducts, getCollection } from "../../data/catalog.js";
import { $, $$, el, html, raw, asset, wireImages, reveal, preload, reducedMotion, setTitle, pad2, ready, lastViewed } from "../lib.js";
import { Header } from "../chrome.js";

export default function homeView({ url }) {
  const total = allProducts.length;
  const credit = site.hero.credit;
  const creditCol = getCollection(credit.collection);
  const creditHref = `/material/${credit.collection}/${credit.code.toLowerCase().replace(/\s+/g, "-")}`;

  const root = el(html`<div class="view view--home">
    <section class="hero on-dark" aria-label="Bodaq Deco 2026 / 27 New Collection">
      <div class="hero__media">
        <div class="hero__reveal">
          <img class="hero__img" src="${asset(site.hero.image)}" alt="${site.hero.alt}"
               style="object-position:${site.hero.focus}" fetchpriority="high" decoding="async">
        </div>
        <div class="hero__shade" aria-hidden="true"></div>
        <a class="hero__credit" href="${creditHref}">
          <span class="code">${creditCol.name} · ${credit.code}</span>
          <span class="label">${credit.label}</span>
        </a>
      </div>

      <div class="hero__content">
        <p class="hero__kicker">
          <span class="label hero__in" style="--d:0">Bodaq Deco</span>
          <span class="label hero__in muted" style="--d:1">${site.season} New Collection</span>
        </p>
        <h1 class="hero__title">
          <span class="hero__line"><span class="hero__in" style="--d:2">Materials</span></span>
          <span class="hero__line"><span class="hero__in" style="--d:3">in Space.</span></span>
        </h1>
        <p class="hero__sub hero__in" style="--d:4">Discover materials.<br>Experience the space.</p>
      </div>

      <a class="hero__scroll hero__in" style="--d:5" href="/collection" aria-label="Scroll to the collection index">
        <span class="label">Index</span>
        <span class="hero__scroll-line" aria-hidden="true"><i></i></span>
        <span class="num">${pad2(collections.length)} collections · ${pad2(total)} finishes</span>
      </a>
    </section>

    <section class="index on-ivory" id="index" aria-labelledby="index-title">
      <div class="index__head wrap grid12">
        <p class="index__eyebrow label rv">02 — Collection Index</p>
        <h2 class="index__title rv" id="index-title" style="--rv-delay:60ms">Six collections.<br>Sixteen surfaces.</h2>
        <p class="index__intro ko rv" style="--rv-delay:120ms">
          소재를 선택하면 실제 공간에 적용된 모습으로 이어집니다.<br>
          <span class="muted">Select a surface to see it in space.</span>
        </p>
      </div>

      <div class="index__bar wrap">
        <div class="filters" role="group" aria-label="Filter by collection">
          <button class="filter" type="button" data-filter="all" aria-pressed="true">
            <span>All</span><span class="num">${pad2(total)}</span>
          </button>
          ${collections.map((c) => raw(html`<button class="filter" type="button" data-filter="${c.id}" aria-pressed="false">
              <span>${c.name}</span><span class="num">${pad2(c.products.length)}</span>
            </button>`))}
        </div>
        <p class="index__status num" aria-live="polite"><span class="js-count">${pad2(total)}</span> / ${pad2(total)}</p>
      </div>

      <div class="index__open wrap" hidden>
        <a class="tlink label js-open" href="/collection">Open collection<span class="arrow"></span></a>
      </div>

      <ul class="grid wrap" role="list">
        ${allProducts.map((p, i) => {
          const c = getCollection(p.collectionId);
          return raw(html`<li class="card rv" data-collection="${c.id}" style="--rv-delay:${(i % 4) * 70}ms">
            <a class="card__link" href="/material/${c.id}/${p.id}" data-prefetch="${c.id}|${p.id}">
              <div class="card__media frame frame--45" data-vt-source data-missing-label="${p.code}">
                <img src="${asset(p.plate.small)}"
                     srcset="${asset(p.plate.small)} 360w, ${asset(p.plate.large)} 720w"
                     sizes="(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw"
                     width="720" height="900" loading="${i < 4 ? "eager" : "lazy"}" decoding="async"
                     alt="${c.name} ${p.code} material surface" data-fade>
              </div>
              <div class="card__meta">
                <span class="card__name">${c.name}</span>
                <span class="card__num num" aria-hidden="true">${p.number}</span>
                <span class="card__code code">${p.code}</span>
                <span class="card__cta label" aria-hidden="true">View in space</span>
              </div>
            </a>
          </li>`);
        })}
      </ul>
    </section>
    ${raw(footerMarkup())}
  </div>`);

  const hero = $(".hero", root);
  const heroContent = $(".hero__content", root);
  const shade = $(".hero__shade", root);
  const index = $("#index", root);
  const filters = $$(".filter", root);
  const cards = $$(".card", root);
  const openWrap = $(".index__open", root);
  const openLink = $(".js-open", root);
  const count = $(".js-count", root);
  let raf = 0, unreveal = () => {};

  /* ---- filter (instant, URL-synced with ?c=) ---- */
  function applyFilter(id, { updateUrl = true } = {}) {
    const valid = id && getCollection(id) ? id : "all";
    filters.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === valid)));
    let n = 0;
    cards.forEach((card) => {
      const show = valid === "all" || card.dataset.collection === valid;
      card.hidden = !show;
      if (show) {
        card.style.setProperty("--rv-delay", `${(n % 4) * 50}ms`);
        if (!reducedMotion()) { card.classList.remove("is-flash"); void card.offsetWidth; card.classList.add("is-flash"); }
        n++;
      }
    });
    count.textContent = pad2(n);
    if (valid === "all") openWrap.hidden = true;
    else {
      const c = getCollection(valid);
      openWrap.hidden = false;
      openLink.href = `/material/${c.id}`;
      openLink.firstChild.textContent = `Open ${c.name} — Material ${c.number}`;
    }
    if (updateUrl) {
      const path = valid === "all" ? "/collection" : `/collection?c=${valid}`;
      history.replaceState({ ...(history.state || {}) }, "", path);
    }
  }
  filters.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));

  /* ---- hover intent → preload the space render for instant detail ---- */
  function prefetch(e) {
    const a = e.currentTarget;
    const [cid, pid] = a.dataset.prefetch.split("|");
    const c = getCollection(cid);
    const p = c.products.find((x) => x.id === pid);
    preload([c.scene.space, p.overlay]);
  }
  $$(".card__link", root).forEach((a) => {
    a.addEventListener("pointerenter", prefetch, { once: true });
    a.addEventListener("focus", prefetch, { once: true });
    a.addEventListener("touchstart", prefetch, { once: true, passive: true });
  });

  /* ---- scroll: hero text drifts/fades, image dims, header switches tone ---- */
  function onScroll() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const h = hero.offsetHeight || window.innerHeight;
      const y = window.scrollY;
      const p = Math.min(Math.max(y / h, 0), 1);
      if (!reducedMotion()) {
        heroContent.style.opacity = String(1 - Math.min(p * 1.5, 1));
        heroContent.style.transform = `translate3d(0, ${(-p * 56).toFixed(1)}px, 0)`;
        shade.style.opacity = String(p * 0.6);
      }
      const overIndex = index.getBoundingClientRect().top <= parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) + 1;
      Header.setTone(overIndex ? "dark" : "light");
      Header.setSolid(overIndex);
      Header.setActiveNav(overIndex ? "index" : null);
    });
  }

  function scrollToIndex(smooth) {
    const top = index.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  }

  return {
    el: root,
    vtKind: "fade",
    handles: (u) => u.pathname === "/" || u.pathname === "/collection",
    sync(u) { applyFilter(u.searchParams.get("c") || "all", { updateUrl: false }); },
    initialScroll(u, smooth = false) {
      const c = u.searchParams.get("c");
      applyFilter(c || "all", { updateUrl: false });
      if (u.pathname === "/collection") scrollToIndex(smooth);
      else window.scrollTo({ top: 0, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
    },
    mount() {
      setTitle(location.pathname === "/collection" ? "Collection Index" : "Materials in Space");
      Header.setCrumbs([]);
      wireImages(root);
      unreveal = reveal(root);
      ready(root);
      const last = lastViewed.get();
      if (last) {
        const card = $(`.card__link[href="/material/${last}"]`, root);
        if (card) card.closest(".card").classList.add("is-last");
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    },
    unmount() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      unreveal();
    },
  };
}

export function footerMarkup() {
  return html`<footer class="site-footer on-ivory">
    <div class="wrap">
      <div class="site-footer__top grid12">
        <a class="logo site-footer__logo" href="/" aria-label="Bodaq Deco — Home"><span class="logo__mark" aria-hidden="true"></span></a>
        <p class="site-footer__tag ko">${site.tagline}</p>
        <nav class="site-footer__nav" aria-label="Collections">
          <p class="label muted">Collections</p>
          <ul>${collections.map((c) => raw(html`<li><a class="tlink" href="/material/${c.id}"><span class="num muted">${c.number}</span>&nbsp;&nbsp;${c.name}</a></li>`))}</ul>
        </nav>
      </div>
      <div class="site-footer__base">
        <span class="label muted">© ${site.company} · ${site.brand}</span>
        <span class="label muted">${site.season} New Collection</span>
        <a class="tlink label" href="/collection">Collection Index</a>
      </div>
    </div>
  </footer>`;
}
