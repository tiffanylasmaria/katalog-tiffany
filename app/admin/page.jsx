import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { redirect } from "next/navigation";
import { buatKlienAuth } from "@/lib/supabase/auth";

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
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {params.berhasil && (
        <p className="rounded-xl border border-utama/20 bg-utama/10 p-3 text-sm text-utama">
          {params.berhasil}
        </p>
      )}

      {error ? (
        <p className="rounded-xl border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">
          Gagal memuat produk: {error.message}
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
