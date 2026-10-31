import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { buatKlienAuth } from "@/lib/supabase/auth";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const supabase = await buatKlienAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  const query = searchParams ? await searchParams : {};

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {query.error && (
        <p className="max-w-xl rounded-xl border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">
          {query.error}
        </p>
      )}
      <FormProduk
        produk={produk}
        action={ubahProduk.bind(null, id)}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
