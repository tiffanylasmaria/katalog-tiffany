import DaftarLokal from "@/components/DaftarLokal";

export const metadata = { title: "Favorit | serba serbi" };

export default function HalamanFavorit() {
  return <section className="py-10"><h1 className="mb-5 text-3xl font-extrabold">Produk favorit</h1><DaftarLokal jenis="favorites" judul="Disimpan di perangkat ini" /></section>;
}
