import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";

export default async function HalamanTambahProduk({ searchParams }) {
  const params = searchParams ? await searchParams : {};

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {params.error && (
        <p className="max-w-xl rounded-xl border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">
          {params.error}
        </p>
      )}
      <FormProduk
        action={tambahProduk}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
