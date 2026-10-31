export default function manifest() {
  return {
    name: "Katalog Serba Serbi",
    short_name: "Serba Serbi",
    description: "Katalog produk dan pemesanan lewat WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f6b4f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
