import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  if (!produk) return null;

  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const harga = formatRupiah(produk.harga).replace(/\s+/g, " ");
  const pesan = `Halo, saya ingin memesan ${produk.nama} seharga ${harga}.`;
  const linkWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={linkWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
