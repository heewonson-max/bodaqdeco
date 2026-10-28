# Bodaq Deco — Premium Digital Showroom (2026 / 27)

Renewal of https://snazzy-sprite-b497f0.netlify.app/ — same products, same assets,
same no-build static deployment on Netlify.

## 1. 실행 / Run locally

```bash
node tools/serve.mjs          # → http://localhost:8080
```
Node 18+ only, no `npm install`. The server applies `_redirects` exactly like
Netlify, so deep links and refresh behave the same as in production.
(Opening `index.html` directly from the file system will not work — the site
uses clean URLs.)

## 2. 배포 / Deploy (Netlify)

Publish directory = project root, no build command (`netlify.toml`).
Either drag the folder onto the Netlify deploy page, or connect the repo.

* `_redirects` — SPA fallback (`/* /index.html 200`) so refreshing
  `/material/noble-oak/sx7k2g` or `/material/noble-oak/applications/3` works.
* Old URLs keep working: `/glossy-wood.html` → `/material/glossy-wood` (301), etc.

## 3. 구조 / Structure

```
index.html              app shell (header, menu, <main>)
data/catalog.js         ★ ALL collections, codes, image paths, applications
css/tokens.css          design system: colours, type scale, spacing, motion
css/base.css            reset, primitives, media frames, placeholders
css/chrome.css          header, breadcrumb, menu, footer
css/views.css           hero, index grid, material page, gallery
js/app.js               routes
js/router.js            History API router + View Transitions
js/views/*.js           home (hero + index), material, gallery
assets/                 ORIGINAL site assets — paths unchanged
assets/renewal/         new derived assets (plates, hero, logo mask, og)
assets/fonts/           self-hosted Pretendard + IBM Plex Mono (OFL)
tools/build-assets.py   regenerates assets/renewal from the originals
tools/serve.mjs         local preview server
```

### Routes
| URL | Page |
|---|---|
| `/` | Hero → Collection index |
| `/collection`, `/collection?c=noble-oak` | Index (optionally filtered) |
| `/material/<collection>[/<code>]` | Material experience |
| `/material/<collection>/applications/<n>` | Application gallery |

## 4. 이미지 교체 / Replacing images

Everything is referenced from **`data/catalog.js`** — no component holds a path.

**Hero image** — put your render anywhere under `assets/`, then edit
`site.hero.image` (and `focus`, `alt`, `credit`). Also update the
`<link rel="preload">` in `index.html` to the same file.

**A new application render (e.g. Travertine kitchen)** — each planned
application already has a target path, e.g.
`assets/applications/open-pore-travertine/kitchen-island.jpg`.
Save the render there, then in `catalog.js` change

```js
pending("open-pore-travertine", "kitchen", "Island"),
```
to
```js
{ type: "image", space: "kitchen", area: "Island",
  image: "assets/applications/open-pore-travertine/kitchen-island.jpg" },
```
It immediately appears as a real render (no “in preparation” label) on the
material page and in the gallery. Portrait 4:5, ≥1600px wide is ideal.

**A new finish / product code** — add the files with the original naming
(`assets/patterns-display/<dir>/<CODE>.jpg`, `assets/patterns-thumbnail/<dir>/<CODE>.jpg`),
add `product("<dir>", "<CODE>")` to the collection, then run
`python3 tools/build-assets.py` to create its index plate.

**A new collection** — copy one collection block in `catalog.js`; numbering
(Material 01…), menu, footer, pager and gallery update automatically.

Missing or failed images never show a broken icon: frames switch to a designed
fallback, and planned applications show a labelled “Render in preparation”
material plate so nothing is mistaken for a real render.

## 5. 원본 대비 변경 / What changed vs. the original

Kept: all 46 original image files and paths, 6 collections, 16 product codes,
Korean descriptions (one typo fixed: 유뮤광 → 유무광), the space-render × pattern
multiply compositing, finish switching, keyboard and swipe navigation, the
footer tagline.

New: editorial collection index (4/3/2 columns), per-product deep links,
application gallery, breadcrumb, prev/next material, collections menu,
View-Transition page changes, scroll reveal, `prefers-reduced-motion` support,
self-hosted fonts, legacy-URL redirects.
