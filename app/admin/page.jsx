import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { redirect } from "next/navigation";
import { buatKlienAuth } from "@/lib/supabase/auth";
import Link from "next/link";

const BATAS = 20;

export default async function HalamanAdmin({ searchParams }) {
  const supabase = await buatKlienAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const params = searchParams ? await searchParams : {};
  const cari = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const halaman = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  let query = supabase.from("produk").select("*", { count: "exact" });
  if (cari) query = query.ilike("nama", `%${cari.replace(/[%_]/g, "\\$&")}%`);
  const { data: daftarProduk, error, count } = await query.order("urutan", { ascending: true }).order("id").range((halaman - 1) * BATAS, halaman * BATAS - 1);
  const { data: semuaProduk, count: jumlahProduk } = await supabase.from("produk").select("id, kategori", { count: "exact" }).limit(2000);
  const { data: daftarKlik } = await supabase.from("klik_pesan").select("produk_id").limit(10000);
  const { data: namaProduk } = await supabase.from("produk").select("id, nama").limit(2000);
  const jumlahKategori = (semuaProduk || []).reduce((hasil, produk) => {
    const nama = produk.kategori || "Tanpa kategori";
    hasil[nama] = (hasil[nama] || 0) + 1;
    return hasil;
  }, {});
  const jumlahKlik = (daftarKlik || []).reduce((hasil, klik) => {
    hasil[klik.produk_id] = (hasil[klik.produk_id] || 0) + 1;
    return hasil;
  }, {});
  const namaById = Object.fromEntries((namaProduk || []).map((produk) => [produk.id, produk.nama]));
  const terlaris = Object.entries(jumlahKlik).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalHalaman = Math.max(1, Math.ceil((count || 0) / BATAS));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <p className="rounded-xl border border-garis p-4">Jumlah produk <strong>{jumlahProduk ?? "—"}</strong></p>
        <div className="rounded-xl border border-garis p-4"><h2 className="font-semibold">Produk per kategori</h2><ul className="mt-2 text-sm">{Object.entries(jumlahKategori).map(([nama, jumlah]) => <li key={nama}>{nama}: {jumlah}</li>)}</ul></div>
      </section>

      <section className="rounded-xl border border-garis p-4"><h2 className="font-semibold">5 produk paling sering dipesan</h2>{terlaris.length ? <ol className="mt-2 list-inside list-decimal text-sm">{terlaris.map(([id, jumlah]) => <li key={id}>{namaById[id] || `Produk #${id}`} — {jumlah} klik</li>)}</ol> : <p className="mt-2 text-sm text-teks-lembut">Belum ada data klik pesan.</p>}</section>

      <nav className="flex flex-wrap gap-3 text-sm">{[["/admin/kategori", "Kategori"], ["/admin/ulasan", "Ulasan"], ["/admin/banner", "Banner"], ["/admin/pengaturan", "Pengaturan toko"], ["/admin/akun", "Akun admin"], ["/admin/log", "Log aktivitas"], ["/admin/impor", "Impor CSV"], ["/api/admin/produk.csv", "Ekspor CSV"]].map(([href, label]) => <Link key={href} href={href} className="text-utama underline">{label}</Link>)}</nav>

      {params.berhasil && (
        <p className="rounded-xl border border-utama/20 bg-utama/10 p-3 text-sm text-utama">
          {params.berhasil}
        </p>
      )}

      {params.error && <p role="alert" className="rounded-xl border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">{params.error}</p>}

      <form action="/admin" method="get" className="flex gap-2"><input name="q" defaultValue={cari} placeholder="Cari produk" className="flex-1 rounded-lg border border-garis px-3 py-2" /><button className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white">Cari</button></form>

      {error ? (
        <p className="rounded-xl border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">
          Gagal memuat produk: {error.message}
        </p>
      ) : (daftarProduk || []).length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}

      {totalHalaman > 1 && <nav className="flex justify-center gap-4"><Link href={`/admin?q=${encodeURIComponent(cari)}&page=${Math.max(1, halaman - 1)}`} aria-disabled={halaman <= 1}>Sebelumnya</Link><span>Halaman {halaman} dari {totalHalaman}</span><Link href={`/admin?q=${encodeURIComponent(cari)}&page=${Math.min(totalHalaman, halaman + 1)}`} aria-disabled={halaman >= totalHalaman}>Berikutnya</Link></nav>}
    </div>
  );
}
