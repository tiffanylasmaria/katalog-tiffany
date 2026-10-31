import PemesanProduk from "@/components/PemesanProduk";

export default function TombolWhatsApp({ produk, varian = [], nomorWhatsApp }) {
  if (!produk) return null;
  return <PemesanProduk produk={produk} varian={varian} nomorWhatsApp={nomorWhatsApp} />;
}
