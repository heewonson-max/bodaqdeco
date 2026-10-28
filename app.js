/* Entry point — routes, chrome, boot. */
import { collections, getCollection, getProduct } from "../data/catalog.js";
import { createRouter } from "./router.js";
import { el, html, applySiteTokens, setTitle } from "./lib.js";
import { Header } from "./chrome.js";
import homeView, { footerMarkup } from "./views/home.js";
import materialView from "./views/material.js";
import galleryView from "./views/gallery.js";

applySiteTokens();

let router;
const replaceUrl = (path) => router.replaceUrl(path);
const navigate = (path) => router.navigate(path);

/* Legacy URLs from the original site, e.g. /glossy-wood.html
   (Netlify also 301s these — this covers local servers). */
const legacy = new Map(collections.map((c) => [c.legacyPage.replace(/\.html$/, ""), c.id]));

const routes = [
  { pattern: /^\/(?:index\.html)?$/, view: homeView },
  { pattern: /^\/collection$/, view: homeView },
  {
    pattern: /^\/(?<page>[a-z-]+)\.html$/,
    redirect: ({ page }) => (legacy.has(page) ? `/material/${legacy.get(page)}` : "/"),
  },
  {
    pattern: /^\/material\/(?<cid>[a-z-]+)\/applications(?:\/(?<n>\d+))?$/,
    view: ({ params }) => {
      const c = getCollection(params.cid);
      if (!c) return notFound();
      return galleryView({ collection: c, index: (parseInt(params.n, 10) || 1) - 1, replaceUrl, navigate });
    },
  },
  {
    pattern: /^\/material\/(?<cid>[a-z-]+)(?:\/(?<pid>[a-z0-9-]+))?$/,
    view: ({ params }) => {
      const c = getCollection(params.cid);
      if (!c) return notFound();
      const p = params.pid ? getProduct(c, params.pid) : c.products[0];
      if (!p) return notFound();
      return materialView({ collection: c, product: p, replaceUrl });
    },
  },
  { notFound: true, pattern: /^$/, view: () => notFound() },
];

function notFound() {
  const root = el(html`<div class="view view--404">
    <section class="nf on-dark wrap">
      <p class="label muted">404</p>
      <h1 class="nf__title">This surface<br>isn’t in the collection.</h1>
      <p class="ko muted">요청하신 페이지를 찾을 수 없습니다.</p>
      <a class="btn-line" href="/collection"><span>Collection index</span><span class="arrow" aria-hidden="true"></span></a>
    </section>
  </div>`);
  root.insertAdjacentHTML("beforeend", footerMarkup());
  return {
    el: root,
    mount() {
      setTitle("Not found");
      Header.setTone("light"); Header.setSolid(false); Header.setCrumbs([{ label: "Home", href: "/" }, { label: "Not found" }]);
    },
  };
}

router = createRouter({
  routes,
  outlet: document.getElementById("app"),
  onAfterRender: () => {
    // Move focus to the new content for screen-reader users (not on first load).
    if (booted) document.getElementById("app").focus({ preventScroll: true });
    booted = true;
  },
});
let booted = false;
router.start();
