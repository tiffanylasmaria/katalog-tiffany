import { ambilPengaturanToko } from "@/lib/server-data";

export const metadata = { title: "Tentang dan Kontak | serba serbi", description: "Informasi dan kontak toko serba serbi." };

export default async function Tentang() {
  const toko = await ambilPengaturanToko();
  return <article className="flex max-w-2xl flex-col gap-4 py-12"><h1 className="text-3xl font-extrabold">Tentang {toko.nama}</h1><p className="text-teks-lembut">{toko.tagline}</p><section className="rounded-2xl border border-garis bg-permukaan p-5"><h2 className="font-bold">Kontak dan jam buka</h2><p className="mt-2">{toko.alamat}</p><p>{toko.jamBuka}</p><a className="mt-3 inline-block font-semibold text-utama underline" href={`https://wa.me/${toko.nomorWhatsApp.replace(/\D/g, "")}`}>Hubungi via WhatsApp</a></section></article>;
}
