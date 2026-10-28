/* APPLICATION GALLERY — Page 04. Large-image viewer for one collection:
   the real render in every finish, then the planned applications.
   ← / → keys, swipe, prev/next buttons, thumbnails; Esc returns. */
import { collections, neighbours, galleryFrames, spaceLabel } from "../../data/catalog.js";
import { $, $$, el, html, raw, asset, wireImages, preload, reducedMotion, stackMarkup, pendingMarkup, setTitle, pad2, ready } from "../lib.js";
import { Header, isMenuOpen } from "../chrome.js";

export default function galleryView({ collection: c, index: startIndex, replaceUrl, navigate }) {
  const frames = galleryFrames(c);
  const { next } = neighbours(c);
  let i = Math.min(Math.max(startIndex, 0), frames.length - 1);
  const total = pad2(frames.length);

  const frameMedia = (f, eager) => {
    if (f.type === "composite") return stackMarkup(c, f.product, { eager });
    if (f.type === "image" && f.image)
      return html`<img src="${asset(f.image)}" alt="${spaceLabel(f)} — ${c.name}" decoding="async">`;
    return pendingMarkup(f, c.products[0]);
  };
  const frameUrls = (f) =>
    f.type === "composite" ? [c.scene.space, f.product.overlay] : f.image ? [f.image] : [c.products[0].plate.large];

  const root = el(html`<div class="view view--gallery">
    <section class="gal on-dark" aria-roledescription="carousel" aria-labelledby="gal-title">
      <h1 class="sr-only" id="gal-title">${c.name} — Applications in Architecture</h1>
      <div class="gal__stage">
        <div class="gal__viewport" data-vt-target></div>
        <button class="gal__hit gal__hit--prev" type="button" tabindex="-1" aria-hidden="true"></button>
        <button class="gal__hit gal__hit--next" type="button" tabindex="-1" aria-hidden="true"></button>
      </div>

      <div class="gal__bar wrap">
        <div class="gal__caption" aria-live="polite">
          <p class="gal__space label js-space"></p>
          <p class="gal__detail"><span class="code js-codeline"></span><span class="label js-status"></span></p>
        </div>
        <p class="gal__count num" aria-hidden="true"><span class="gal__now js-now">01</span><span class="muted"> / ${total}</span></p>
        <div class="gal__ctrl">
          <button class="gal__btn js-prev" type="button" aria-label="Previous image"><span class="arrow arrow--left" aria-hidden="true"></span><span class="label">Prev</span></button>
          <button class="gal__btn js-next" type="button" aria-label="Next image"><span class="label">Next</span><span class="arrow" aria-hidden="true"></span></button>
        </div>
      </div>

      <ol class="gal__thumbs wrap" aria-label="All views">
        ${frames.map((f, n) => raw(html`<li>
          <button class="gal__thumb frame" type="button" data-i="${n}" aria-label="View ${n + 1}: ${spaceLabel(f)}${f.product ? " — " + f.product.code : " — in preparation"}">
            ${f.product
              ? raw(html`<img src="${asset(f.product.plate.small)}" alt="" loading="lazy" decoding="async">`)
              : raw(html`<span class="gal__thumb-pending" style="background-image:url('${asset(c.products[0].plate.small)}')"></span>`)}
          </button>
        </li>`))}
      </ol>

      <div class="gal__foot wrap">
        <a class="tlink label js-back" href="/material/${c.id}"><span class="arrow arrow--left" aria-hidden="true"></span>&nbsp; ${c.name}</a>
        <a class="tlink label" href="/collection">Collection index</a>
        <a class="tlink label" href="/material/${next.id}/applications/1">Next material — ${next.name} &nbsp;<span class="arrow" aria-hidden="true"></span></a>
      </div>
    </section>
  </div>`);

  const viewport = $(".gal__viewport", root);
  const now = $(".js-now", root);
  const space = $(".js-space", root);
  const codeline = $(".js-codeline", root);
  const status = $(".js-status", root);
  const thumbs = $$(".gal__thumb", root);
  const backLink = $(".js-back", root);
  let backHref = `/material/${c.id}`;

  function slideMarkup(f, eager) {
    return html`<div class="gal__slide">
      <div class="gal__frame frame" data-missing-label="${spaceLabel(f)}">${raw(frameMedia(f, eager))}</div>
    </div>`;
  }

  function show(n, dir = 0, { first = false } = {}) {
    i = (n + frames.length) % frames.length;
    const f = frames[i];
    // Instant feedback: numbers & captions update before the image settles.
    now.textContent = pad2(i + 1);
    space.textContent = spaceLabel(f);
    codeline.textContent = f.product ? f.product.code : c.name;
    status.textContent = f.type === "pending" ? "Render in preparation" : "Rendered application";
    status.classList.toggle("is-pending", f.type === "pending");
    thumbs.forEach((t, k) => t.setAttribute("aria-current", String(k === i)));
    thumbs[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: first || reducedMotion() ? "auto" : "smooth" });

    const wrap = document.createElement("div");
    wrap.innerHTML = slideMarkup(f, true);
    const slide = wrap.firstElementChild;
    const old = $$(".gal__slide", viewport);
    if (!first && !reducedMotion()) {
      slide.style.setProperty("--dir", dir || 1);
      slide.classList.add("is-in");
      old.forEach((o) => { o.style.setProperty("--dir", dir || 1); o.classList.add("is-out"); });
      setTimeout(() => old.forEach((o) => o.remove()), 520);
    } else old.forEach((o) => o.remove());
    viewport.appendChild(slide);
    wireImages(slide);

    if (!first) replaceUrl(`/material/${c.id}/applications/${i + 1}`);
    if (f.product) backHref = `/material/${c.id}/${f.product.id}`;
    backLink.href = backHref;
    Header.setCrumbs([
      { label: "Home", href: "/" },
      { label: "Collection", href: `/collection?c=${c.id}` },
      { label: c.name, href: backHref },
      { label: "Application" },
    ]);
    setTitle(`${spaceLabel(f)}`, c.name);
    // Preload neighbours so the next press is instant.
    preload([...frameUrls(frames[(i + 1) % frames.length]), ...frameUrls(frames[(i - 1 + frames.length) % frames.length])]);
  }

  const go = (d) => show(i + d, d);
  $(".js-prev", root).addEventListener("click", () => go(-1));
  $(".js-next", root).addEventListener("click", () => go(1));
  $(".gal__hit--prev", root).addEventListener("click", () => go(-1));
  $(".gal__hit--next", root).addEventListener("click", () => go(1));
  thumbs.forEach((t) => t.addEventListener("click", () => {
    const n = +t.dataset.i;
    if (n !== i) show(n, n > i ? 1 : -1);
  }));

  function onKey(e) {
    if (isMenuOpen() || e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "Home") { e.preventDefault(); show(0, -1); }
    else if (e.key === "End") { e.preventDefault(); show(frames.length - 1, 1); }
    else if (e.key === "Escape") { e.preventDefault(); navigate(backHref); }
  }

  /* Swipe (touch / pen); mouse drags are ignored so text stays selectable. */
  let sx = 0, sy = 0, tracking = false;
  const stage = $(".gal__stage", root);
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    tracking = true; sx = e.clientX; sy = e.clientY;
  });
  stage.addEventListener("pointerup", (e) => {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
  });
  stage.addEventListener("pointercancel", () => { tracking = false; });

  return {
    el: root,
    vtKind: "gallery",
    mount() {
      Header.setTone("light");
      Header.setSolid(true);
      Header.setActiveNav(null);
      show(i, 0, { first: true });
      wireImages(root);
      document.addEventListener("keydown", onKey);
      ready(root);
    },
    unmount() { document.removeEventListener("keydown", onKey); },
  };
}
