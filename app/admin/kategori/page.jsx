import NavAdmin from "@/components/NavAdmin";
import { buatKlienAuth } from "@/lib/supabase/auth";
import { tambahKategori, ubahKategori, hapusKategori } from "@/app/admin/actions";

export default async function HalamanKategori({ searchParams }) {
  const supabase = await buatKlienAuth();
  const { data: kategori, error } = await supabase.from("kategori_produk").select("id,nama").order("nama");
  const params = searchParams ? await searchParams : {};
  return <div className="flex flex-col gap-5 py-8"><NavAdmin /><h1 className="text-2xl font-extrabold">Kelola kategori</h1>{params.error && <p role="alert" className="bg-bahaya/10 p-3 text-sm text-bahaya">{params.error}</p>}{params.berhasil && <p role="status" className="bg-permukaan p-3 text-sm">{params.berhasil}</p>}<form action={tambahKategori} className="flex max-w-xl gap-2"><input name="nama" required maxLength={80} placeholder="Nama kategori baru" className="flex-1 rounded-lg border border-garis px-3 py-2" /><button className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white">Tambah</button></form>{error ? <p role="alert" className="text-bahaya">{error.message}</p> : <ul className="divide-y divide-garis rounded-xl border border-garis">{(kategori || []).map((item) => <li key={item.id} className="flex flex-wrap items-center gap-2 p-3"><form action={ubahKategori} className="flex flex-1 gap-2"><input type="hidden" name="id" value={item.id} /><input name="nama" defaultValue={item.nama} required className="min-w-0 flex-1 rounded-lg border border-garis px-3 py-2" /><button className="text-sm font-semibold text-utama underline">Simpan</button></form><form action={hapusKategori}><input type="hidden" name="id" value={item.id} /><button className="text-sm font-semibold text-bahaya underline">Hapus</button></form></li>)}</ul>}</div>;
}
