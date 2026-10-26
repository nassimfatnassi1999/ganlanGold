export const ASSET_PATHS = {
  products: {
    "250ml": "images/products/product-250ml.webp",
    "500ml": "images/products/product-500ml.webp",
    "750ml": "images/products/product-750ml.webp",
    "5l": "images/products/product-5l.webp",
  },
  hero: {
    desktopAvif: "images/hero/products-desktop.avif",
    desktopWebp: "images/hero/products-desktop.webp",
    mobileAvif: "images/hero/products-mobile.avif",
    mobileWebp: "images/hero/products-mobile.webp",
  },
  brand: {
    olivePattern: "images/brand/olive-pattern.svg",
  },
  groves: {
    atmosphere: "images/groves/olive-grove-atmosphere.webp",
    origin: "images/groves/moroccan-groves-sharp.webp",
  },
  qr: {
    lassad: "images/qr/lassad-wechat.png",
    fouad: "images/qr/fouad-wechat.png",
  },
} as const;

export const QR_SOURCE_HASHES = {
  lassad: "c68229ae0aaa15f9ab583f48ec7f48db8da9624121f06d8f80b524df53628fa5",
  fouad: "97234eb329de5c6280d20f0b38d286807ad42bfba473a7b8878b53f3634a1491",
} as const;
