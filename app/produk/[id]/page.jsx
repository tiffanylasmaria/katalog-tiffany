import Link from "next/link";
import { notFound } from "next/navigation";
import AksiProdukRingkas from "@/components/AksiProdukRingkas";
import BagikanProduk from "@/components/BagikanProduk";
import CatatDilihat from "@/components/CatatDilihat";
import GaleriFoto from "@/components/GaleriFoto";
import GaleriUlasan from "@/components/GaleriUlasan";
import KartuProduk from "@/components/KartuProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TanyaProduk from "@/components/TanyaProduk";
import { ambilPengaturanToko, slugKategori } from "@/lib/server-data";
import { buatKlienServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

async function ambilProduk(id) {
  const supabase = buatKlienServer();
  let result = await supabase.from("produk").select("*").eq("id", id).eq("aktif", true).maybeSingle();
  if (result.error && /aktif/i.test(result.error.message)) {
    result = await supabase.from("produk").select("*").eq("id", id).maybeSingle();
  }
  return result.data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);
  if (!produk) return { title: "Produk tidak ditemukan" };
  const deskripsi = (produk.deskripsi || `Lihat ${produk.nama} di katalog kami.`).slice(0, 160);
  return {
    title: `${produk.nama} | serba serbi`,
    description: deskripsi,
    openGraph: {
      title: produk.nama,
      description: deskripsi,
      images: produk.foto_url ? [{ url: produk.foto_url, alt: produk.nama }] : [],
      type: "website",
    },
  };
}

export default async function HalamanDetailProduk({ params, searchParams }) {
  const { id } = await params;
  const produk = await ambilProduk(id);
  if (!produk) notFound();

  const supabase = buatKlienServer();
  const [varianResult, relatedResult, reviewsResult] = await Promise.all([
    supabase.from("varian_produk").select("id, nama, harga").eq("produk_id", id).order("id"),
    supabase.from("produk").select("*").eq("kategori", produk.kategori || "").neq("id", id).eq("aktif", true).order("urutan").limit(4),
    supabase.from("ulasan").select("id, nama, rating, komentar, created_at").eq("produk_id", id).eq("terlihat", true).order("created_at", { ascending: false }).limit(20),
  ]);
  const toko = await ambilPengaturanToko();
  const query = searchParams ? await searchParams : {};
  const fotoTambahan = Array.isArray(produk.foto_urls) ? produk.foto_urls : [];

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        <GaleriFoto foto={produk.foto_url} fotoTambahan={fotoTambahan} nama={produk.nama} />
        <div className="flex flex-col gap-4">
          <CatatDilihat produkId={produk.id} />
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">Kembali ke katalog</Link>
          {produk.kategori && <Link href={`/kategori/${slugKategori(produk.kategori)}`} className="self-start text-sm text-teks-lembut underline">{produk.kategori}</Link>}
          {produk.badge && <span className="self-start rounded-full bg-utama/10 px-3 py-1 text-xs font-bold text-utama">{produk.badge}</span>}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">{formatRupiah(produk.harga_diskon || produk.harga)}</p>
            {produk.harga_diskon && <del className="text-sm text-teks-lembut">{formatRupiah(produk.harga)}</del>}
          </div>
          {produk.stok != null && <p className={produk.stok === 0 ? "font-semibold text-bahaya" : "text-sm text-teks-lembut"}>{produk.stok === 0 ? "Stok habis" : `Stok tersedia: ${produk.stok}`}</p>}
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <TombolWhatsApp produk={produk} varian={varianResult.data || []} nomorWhatsApp={toko.nomorWhatsApp} />
          <AksiProdukRingkas produk={produk} />
          <BagikanProduk judul={produk.nama} />
          {query.ulasan === "menunggu" && <p role="status" className="rounded-lg bg-permukaan p-3 text-sm">Ulasan terkirim dan menunggu persetujuan admin.</p>}
          {query.ulasan === "error" && <p role="status" className="rounded-lg bg-bahaya/10 p-3 text-sm text-bahaya">Ulasan gagal dikirim. Periksa isian dan coba lagi.</p>}
        </div>
      </article>

      <TanyaProduk produkId={produk.id} />
      <GaleriUlasan produkId={produk.id} ulasan={reviewsResult.data || []} />

      {(relatedResult.data || []).length > 0 && <section className="flex flex-col gap-4"><h2 className="text-xl font-bold">Produk terkait</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{relatedResult.data.map((item) => <KartuProduk key={item.id} produk={item} />)}</div></section>}
    </div>
  );
}
