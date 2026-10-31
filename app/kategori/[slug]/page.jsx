import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { buatKlienServer } from "@/lib/supabase/server";
import { slugKategori } from "@/lib/server-data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Kategori ${slug.replace(/-/g, " ")} | serba serbi` };
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const supabase = buatKlienServer();
  let { data, error } = await supabase.from("produk").select("*").eq("aktif", true).order("urutan").limit(500);
  if (error && /aktif|urutan/i.test(error.message)) {
    ({ data, error } = await supabase.from("produk").select("*").order("id").limit(500));
  }
  if (error) notFound();
  const produk = (data || []).filter((item) => slugKategori(item.kategori || "") === slug);
  if (!produk.length) notFound();
  return <section className="flex flex-col gap-5 py-10"><h1 className="text-3xl font-extrabold">{produk[0].kategori}</h1><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{produk.map((item) => <KartuProduk key={item.id} produk={item} />)}</div></section>;
}
