import NavAdmin from "@/components/NavAdmin";
import { buatKlienAuth } from "@/lib/supabase/auth";

export default async function HalamanLog() {
  const supabase = await buatKlienAuth();
  const { data, error } = await supabase.from("log_aktivitas").select("id,admin_id,aksi,detail,created_at").order("created_at", { ascending: false }).limit(50);
  return <div className="flex flex-col gap-5 py-8"><NavAdmin /><h1 className="text-2xl font-extrabold">Log aktivitas</h1>{error ? <p role="alert" className="text-bahaya">{error.message}</p> : !data?.length ? <p className="text-teks-lembut">Belum ada aktivitas.</p> : <ol className="space-y-3">{data.map((item) => <li key={item.id} className="rounded-xl border border-garis p-4"><p className="font-semibold">{item.aksi}</p><p className="text-sm">{item.detail}</p><p className="mt-1 text-xs text-teks-lembut">{new Date(item.created_at).toLocaleString("id-ID")} · admin {item.admin_id || "—"}</p></li>)}</ol>}</div>;
}
