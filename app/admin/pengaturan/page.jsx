import NavAdmin from "@/components/NavAdmin";
import { buatKlienAuth } from "@/lib/supabase/auth";
import { simpanPengaturanToko } from "@/app/admin/actions";

export default async function HalamanPengaturan({ searchParams }) {
  const supabase = await buatKlienAuth();
  const { data: toko } = await supabase.from("pengaturan_toko").select("*").eq("id", true).maybeSingle();
  const params = searchParams ? await searchParams : {};
  return <div className="flex flex-col gap-5 py-8"><NavAdmin /><h1 className="text-2xl font-extrabold">Pengaturan toko</h1>{params.error && <p role="alert" className="bg-bahaya/10 p-3 text-sm text-bahaya">{params.error}</p>}{params.berhasil && <p role="status" className="bg-permukaan p-3 text-sm">{params.berhasil}</p>}<form action={simpanPengaturanToko} className="flex max-w-xl flex-col gap-4"><label className="flex flex-col gap-1 text-sm font-semibold">Nama toko<input name="nama" defaultValue={toko?.nama || ""} required className="rounded-lg border border-garis p-3" /></label><label className="flex flex-col gap-1 text-sm font-semibold">WhatsApp<input name="nomor_whatsapp" defaultValue={toko?.nomor_whatsapp || ""} inputMode="tel" required className="rounded-lg border border-garis p-3" /></label><label className="flex flex-col gap-1 text-sm font-semibold">Alamat<textarea name="alamat" defaultValue={toko?.alamat || ""} className="rounded-lg border border-garis p-3" /></label><label className="flex flex-col gap-1 text-sm font-semibold">Jam buka<input name="jam_buka" defaultValue={toko?.jam_buka || ""} className="rounded-lg border border-garis p-3" /></label><label className="flex flex-col gap-1 text-sm font-semibold">Tagline<input name="tagline" defaultValue={toko?.tagline || ""} className="rounded-lg border border-garis p-3" /></label><button className="self-start rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white">Simpan pengaturan</button></form></div>;
}
