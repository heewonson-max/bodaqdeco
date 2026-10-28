/* ==========================================================================
   BODAQ DECO — CENTRAL CATALOGUE
   --------------------------------------------------------------------------
   Every collection, product, image path and application lives here.
   Components never hard-code a path or a code — edit this file only.

   Paths are relative to the site root (no leading slash).

   ── How an application image is defined ─────────────────────────────────
   { type: "composite" }  Real render. Uses the collection's `scene.space`
                          multiplied with the selected product's `overlay`
                          (the original site's layering technique).
   { type: "image", image: "assets/applications/…jpg" }
                          A finished render you supply. Shown as-is.
   { type: "pending", image: null, plannedPath: "…" }
                          No render yet. A designed "material plate"
                          placeholder is shown and clearly labelled
                          "Render in preparation". To publish it, drop the
                          file at `plannedPath`, then change type to "image"
                          and set `image` to that path.
   ========================================================================== */

export const site = {
  brand: "Bodaq Deco",
  company: "Hyundai L&C",
  season: "2026 / 27",
  tagline: "삶이 문화가 되는 가장 현대적인 인테리어를 현대L&C에서 시작하세요.",
  logoMask: "assets/renewal/logo/logo-mask.png",
  logoOriginal: "assets/logo/logo-white.png",

  /* HOME HERO — replace `image` with your own interior render (portrait or
     landscape both work; the frame crops with object-fit: cover).
     `focus` = CSS object-position used for the crop. */
  hero: {
    image: "assets/renewal/hero/hero-main.jpg",
    focus: "50% 58%",
    alt: "Living room with a fireplace feature wall finished in Vertical Wood CW02 E22P",
    credit: { collection: "vertical-wood", code: "CW02 E22P", label: "Living Room / Feature Wall" },
  },
};

/* Space vocabulary — used for labels like "KITCHEN / ISLAND". */
export const spaces = {
  kitchen:  { en: "Kitchen",       ko: "주방" },
  living:   { en: "Living Room",   ko: "거실" },
  bathroom: { en: "Bathroom",      ko: "욕실" },
  entryway: { en: "Entryway",      ko: "현관" },
  bedroom:  { en: "Bedroom",       ko: "침실" },
  dressing: { en: "Dressing Room", ko: "드레스룸" },
};

/* Helper to keep product entries short. `dir` = folder name used by the
   original site (assets/patterns-display/<dir>/…). */
const product = (dir, code) => {
  const file = code.replace(/ /g, "_");
  return {
    id: code.toLowerCase().replace(/\s+/g, "-"),     // url slug, e.g. wh517-e46
    code,                                             // shown in UI, e.g. "WH517 E46"
    thumb:   `assets/patterns-thumbnail/${dir}/${file}.jpg`,  // original 220px chip
    overlay: `assets/patterns-display/${dir}/${file}.jpg`,    // original layer for the space render
    plate: {                                                  // index-grid plate (4:5)
      small: `assets/renewal/swatches/${dir}/${file}-360.jpg`,
      large: `assets/renewal/swatches/${dir}/${file}-720.jpg`,
    },
  };
};

const pending = (collectionId, space, area) => ({
  type: "pending",
  space,
  area,
  image: null,
  plannedPath: `assets/applications/${collectionId}/${space}-${area.toLowerCase().replace(/[^a-z]+/g, "-")}.jpg`,
});

/* --------------------------------------------------------------------------
   COLLECTIONS — order = numbering (Material 01 … 06), same order as the
   original home carousel.
   -------------------------------------------------------------------------- */
export const collections = [
  {
    id: "glossy-wood",
    name: "Glossy Wood",
    description: "은은하게 빛나는 유무광 질감의 우드 패턴으로, 공간에 깊이감을 더합니다.",
    legacyPage: "glossy-wood.html",
    plate: "assets/carousel/glossy-wood-circle.jpg",
    scene: {
      space: "assets/spaces/glossy-space.jpg",
      width: 1080, height: 1350, focus: "62% 40%",
      alt: (code) => `Built-in living room storage wall finished in Glossy Wood ${code}`,
    },
    products: [
      product("glossy", "WH517 E46"),
      product("glossy", "IV055 E46"),
      product("glossy", "GY123 E46"),
      product("glossy", "GY116 E46"),
    ],
    applications: [
      { type: "composite", space: "living", area: "Built-in Storage" },
      pending("glossy-wood", "kitchen", "Tall Cabinet"),
      pending("glossy-wood", "bedroom", "Wardrobe"),
      pending("glossy-wood", "entryway", "Shoe Cabinet"),
    ],
  },
  {
    id: "vertical-wood-stripe",
    name: "Vertical Wood Stripe",
    description: "수직 스트라이프 패턴으로 공간에 역동성과 세련미를 더합니다.",
    legacyPage: "vertical-wood-stripe.html",
    plate: "assets/carousel/vertical-wood-stripe-circle.jpg",
    scene: {
      space: "assets/spaces/vertical-space.jpg",
      width: 1080, height: 1350, focus: "30% 45%",
      alt: (code) => `Entryway wall panelling with a lit niche finished in Vertical Wood Stripe ${code}`,
    },
    products: [
      product("vertical", "AH01 E30P"),
      product("vertical", "AH04 E30P"),
    ],
    applications: [
      { type: "composite", space: "entryway", area: "Wall Panel" },
      pending("vertical-wood-stripe", "living", "Feature Wall"),
      pending("vertical-wood-stripe", "bedroom", "Headboard Wall"),
    ],
  },
  {
    id: "multi-ceramic",
    name: "Multi Ceramic",
    description: "다양한 세라믹 질감을 표현한 모던하고 세련된 마감재입니다.",
    legacyPage: "multi-ceramic.html",
    plate: "assets/carousel/multi-ceramic-circle.jpg",
    scene: {
      space: "assets/spaces/ceramic-space.jpg",
      width: 1080, height: 1350, focus: "45% 62%",
      alt: (code) => `Kitchen island finished in Multi Ceramic ${code}`,
    },
    products: [
      product("ceramic", "DK03 ES10P"),
      product("ceramic", "DK06 ES10P"),
    ],
    applications: [
      { type: "composite", space: "kitchen", area: "Island" },
      pending("multi-ceramic", "bathroom", "Vanity"),
      pending("multi-ceramic", "living", "TV Wall"),
    ],
  },
  {
    id: "open-pore-travertine",
    name: "Open Pore Travertine",
    description: "천연 트래버틴의 독특한 기공 텍스처를 재현한 프리미엄 마감재입니다.",
    legacyPage: "open-pore-travertine.html",
    plate: "assets/carousel/open-pore-travertine-circle.jpg",
    scene: {
      space: "assets/spaces/travertine-space.jpg",
      width: 1080, height: 1350, focus: "55% 40%",
      alt: (code) => `Dressing room wardrobe doors finished in Open Pore Travertine ${code}`,
    },
    products: [
      product("travertine", "WH111 E45"),
      product("travertine", "KWH203 E45"),
      product("travertine", "GY01D E45"),
    ],
    applications: [
      { type: "composite", space: "dressing", area: "Wardrobe" },
      pending("open-pore-travertine", "kitchen", "Island"),
      pending("open-pore-travertine", "living", "Feature Wall"),
      pending("open-pore-travertine", "bathroom", "Vanity"),
      pending("open-pore-travertine", "entryway", "Wall Panel"),
    ],
  },
  {
    id: "vertical-wood",
    name: "Vertical Wood",
    description: "자연스러운 우드 결이 살아있는 버티컬 패턴으로, 공간에 따뜻함과 깊이감을 더합니다.",
    legacyPage: "vertical-wood.html",
    plate: "assets/carousel/vertical-wood-circle.jpg",
    scene: {
      space: "assets/spaces/vertical-wood-space.jpg",
      width: 1080, height: 1350, focus: "50% 50%",
      alt: (code) => `Living room fireplace feature wall finished in Vertical Wood ${code}`,
    },
    products: [
      product("vertical-wood", "CW01 E22P"),
      product("vertical-wood", "CW02 E22P"),
    ],
    applications: [
      { type: "composite", space: "living", area: "Feature Wall" },
      pending("vertical-wood", "bedroom", "Headboard Wall"),
      pending("vertical-wood", "entryway", "Wall Panel"),
    ],
  },
  {
    id: "noble-oak",
    name: "Noble Oak",
    description: "고귀하고 품격 있는 오크 우드 패턴으로, 공간에 클래식한 우아함을 선사합니다.",
    legacyPage: "noble-oak.html",
    plate: "assets/carousel/noble-oak-circle.jpg",
    scene: {
      space: "assets/spaces/noble-oak-space.jpg",
      width: 2000, height: 2753, focus: "40% 40%",
      alt: (code) => `Kitchen cabinetry wall with sink finished in Noble Oak ${code}`,
    },
    products: [
      product("noble-oak", "SX7K1G"),
      product("noble-oak", "SX7K2G"),
      product("noble-oak", "SX7K3G"),
    ],
    applications: [
      { type: "composite", space: "kitchen", area: "Cabinetry" },
      pending("noble-oak", "bedroom", "Wardrobe"),
      pending("noble-oak", "dressing", "Cabinetry"),
    ],
  },
];

/* ---------- derived lookups (do not edit) ---------- */
collections.forEach((c, i) => {
  c.index = i;
  c.number = String(i + 1).padStart(2, "0");
  c.products.forEach((p) => { p.collectionId = c.id; });
});

export const allProducts = collections.flatMap((c) => c.products);
allProducts.forEach((p, i) => { p.number = String(i + 1).padStart(2, "0"); });

export const getCollection = (id) => collections.find((c) => c.id === id);
export const getProduct = (c, id) => c && c.products.find((p) => p.id === id);
export const neighbours = (c) => ({
  prev: collections[(c.index - 1 + collections.length) % collections.length],
  next: collections[(c.index + 1) % collections.length],
});

/* Gallery frames for one collection: the real render once per finish,
   then every other application (supplied image or placeholder). */
export function galleryFrames(c) {
  const frames = [];
  c.applications.forEach((app) => {
    if (app.type === "composite") {
      c.products.forEach((p) => frames.push({ ...app, product: p }));
    } else {
      frames.push({ ...app, product: null });
    }
  });
  return frames;
}

export const spaceLabel = (app) => `${spaces[app.space].en} / ${app.area}`;
