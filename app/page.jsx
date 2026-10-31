import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import DaftarLokal from "@/components/DaftarLokal";
import KeranjangBelanja from "@/components/KeranjangBelanja";
import { buatKlienServer } from "@/lib/supabase/server";
import { ambilPengaturanToko } from "@/lib/server-data";

const BATAS = 12;

export default async function HalamanKatalog({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const cari = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const kategori = typeof params.kategori === "string" ? params.kategori : "";
  const urutan = typeof params.urutkan === "string" ? params.urutkan : "unggulan";
  const halaman = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const awal = (halaman - 1) * BATAS;
  const supabase = buatKlienServer();
  const toko = await ambilPengaturanToko();

  let query = supabase.from("produk").select("*", { count: "exact" }).eq("aktif", true);
  if (cari) query = query.ilike("nama", `%${cari.replace(/[%_]/g, "\\$&")}%`);
  if (kategori) query = query.eq("kategori", kategori);

  if (urutan === "termurah") query = query.order("harga", { ascending: true });
  else if (urutan === "termahal") query = query.order("harga", { ascending: false });
  else if (urutan === "terbaru") query = query.order("created_at", { ascending: false });
  else query = query.order("urutan", { ascending: true }).order("id", { ascending: true });

  let { data, error, count } = await query.range(awal, awal + BATAS - 1);
  // Tetap tampilkan katalog lama jika migrasi kolom fitur baru belum dijalankan.
  if (error && /aktif|urutan|harga_diskon|stok|badge/i.test(error.message)) {
    let fallback = supabase.from("produk").select("*", { count: "exact" });
    if (cari) fallback = fallback.ilike("nama", `%${cari}%`);
    if (kategori) fallback = fallback.eq("kategori", kategori);
    fallback = urutan === "termurah"
      ? fallback.order("harga", { ascending: true })
      : urutan === "termahal"
        ? fallback.order("harga", { ascending: false })
        : fallback.order("id", { ascending: true });
    ({ data, error, count } = await fallback.range(awal, awal + BATAS - 1));
  }

  const { data: kategoriData } = await supabase
    .from("kategori_produk")
    .select("nama")
    .order("nama", { ascending: true });
  const { data: bannerData } = await supabase
    .from("banner")
    .select("id, judul, teks, gambar_url, tautan")
    .eq("aktif", true)
    .order("dibuat_pada", { ascending: false })
    .limit(3);

  const totalHalaman = Math.max(1, Math.ceil((count || 0) / BATAS));
  const linkHalaman = (nomor) => {
    const next = new URLSearchParams();
    if (cari) next.set("q", cari);
    if (kategori) next.set("kategori", kategori);
    if (urutan !== "unggulan") next.set("urutkan", urutan);
    next.set("page", String(nomor));
    return `/?${next.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <section className="py-3 sm:py-6">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{toko.nama}</h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      {(bannerData || []).length > 0 && (
        <section aria-label="Promo" className="grid gap-3 md:grid-cols-2">
          {bannerData.map((banner) => (
            <Link key={banner.id} href={banner.tautan || "/"} className="overflow-hidden rounded-2xl border border-utama/20 bg-permukaan p-5">
              {banner.gambar_url && <img src={banner.gambar_url} alt="" className="mb-3 max-h-48 w-full rounded-xl object-cover" />}
              <h2 className="text-xl font-bold">{banner.judul}</h2>
              {banner.teks && <p className="mt-1 text-sm text-teks-lembut">{banner.teks}</p>}
            </Link>
          ))}
        </section>
      )}

      <KeranjangBelanja nomorWhatsApp={toko.nomorWhatsApp} />
      <DaftarLokal jenis="favorites" judul="Favorit saya" />
      <DaftarLokal jenis="recent" judul="Terakhir dilihat" />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="judul-produk" className="text-xl font-bold">Produk kami</h2>
          <Link href="/bandingkan" className="text-sm font-semibold text-utama underline">Bandingkan produk</Link>
        </div>

        <form action="/" method="get" className="grid gap-3 rounded-xl border border-garis p-3 sm:grid-cols-4">
          <input name="q" defaultValue={cari} placeholder="Cari nama produk" className="rounded-lg border border-garis px-3 py-2 text-sm" />
          <select name="kategori" defaultValue={kategori} className="rounded-lg border border-garis px-3 py-2 text-sm">
            <option value="">Semua kategori</option>
            {(kategoriData || []).map((item) => <option key={item.nama} value={item.nama}>{item.nama}</option>)}
          </select>
          <select name="urutkan" defaultValue={urutan} className="rounded-lg border border-garis px-3 py-2 text-sm">
            <option value="unggulan">Urutan unggulan</option>
            <option value="termurah">Harga termurah</option>
            <option value="termahal">Harga termahal</option>
            <option value="terbaru">Terbaru</option>
          </select>
          <button type="submit" className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white">Terapkan</button>
        </form>

        {error ? (
          <div className="rounded-xl border border-bahaya/20 bg-bahaya/10 p-4 text-sm text-bahaya">
            <p className="font-semibold">Gagal memuat produk</p><p className="mt-1">{error.message}</p>
          </div>
        ) : (data || []).length === 0 ? (
          <p className="py-8 text-center text-teks-lembut">Belum ada produk yang cocok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {data.map((produk) => <KartuProduk key={produk.id} produk={produk} />)}
          </div>
        )}

        {totalHalaman > 1 && (
          <nav aria-label="Paginasi katalog" className="flex items-center justify-center gap-4">
            {halaman > 1 && <Link className="rounded-lg border border-garis px-3 py-2" href={linkHalaman(halaman - 1)}>Sebelumnya</Link>}
            <span className="text-sm text-teks-lembut">Halaman {halaman} dari {totalHalaman}</span>
            {halaman < totalHalaman && <Link className="rounded-lg border border-garis px-3 py-2" href={linkHalaman(halaman + 1)}>Muat lebih banyak</Link>}
          </nav>
        )}
      </section>
    </div>
  );
}
