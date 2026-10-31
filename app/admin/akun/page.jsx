import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import { buatKlienAuth } from "@/lib/supabase/auth";
import { buatKlienServer } from "@/lib/supabase/server";
import { buatAdmin, hapusAdmin } from "@/app/admin/actions";

export default async function HalamanAkun({ searchParams }) {
  const sesi = await buatKlienAuth();
  const { data: { user }, error } = await sesi.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const admin = buatKlienServer();
  const { data: hasil } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  const params = searchParams ? await searchParams : {};
  return <div className="flex flex-col gap-5 py-8"><NavAdmin /><h1 className="text-2xl font-extrabold">Kelola akun admin</h1>{params.error && <p role="alert" className="bg-bahaya/10 p-3 text-sm text-bahaya">{params.error}</p>}{params.berhasil && <p role="status" className="bg-permukaan p-3 text-sm">{params.berhasil}</p>}<form action={buatAdmin} className="grid max-w-xl gap-3 rounded-xl border border-garis p-4"><h2 className="font-semibold">Tambah admin</h2><input type="email" name="email" required placeholder="Email admin baru" className="rounded-lg border border-garis p-3" /><input type="password" name="password" required minLength={8} placeholder="Password minimal 8 karakter" className="rounded-lg border border-garis p-3" /><button className="justify-self-start rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white">Buat akun</button></form><ul className="divide-y divide-garis rounded-xl border border-garis">{(hasil?.users || []).map((item) => <li key={item.id} className="flex items-center justify-between gap-3 p-3"><span>{item.email}{item.id === user.id && <strong className="ml-2 text-xs text-utama">(akun Anda)</strong>}</span>{item.id !== user.id && <form action={hapusAdmin}><input type="hidden" name="id" value={item.id} /><button className="text-sm text-bahaya underline">Hapus</button></form>}</li>)}</ul></div>;
}
