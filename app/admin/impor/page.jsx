import NavAdmin from "@/components/NavAdmin";
import { imporProduk } from "@/app/admin/actions";

export default async function HalamanImpor({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const gagal = typeof params.gagal === "string" ? params.gagal.split(",").filter(Boolean) : [];
  return <div className="flex flex-col gap-5 py-8"><NavAdmin /><h1 className="text-2xl font-extrabold">Impor produk CSV</h1>{params.error && <p role="alert" className="rounded-lg bg-bahaya/10 p-3 text-sm text-bahaya">{params.error}</p>}{params.berhasil != null && <div className="rounded-lg bg-permukaan p-3 text-sm"><p>Berhasil menyimpan {params.berhasil} baris.</p>{gagal.length > 0 && <p>Baris gagal: {gagal.join(", ")}</p>}</div>}<p className="text-sm text-teks-lembut">Header wajib: nama,harga,kategori,foto_url,deskripsi. Maksimal 500 baris dan 2 MB.</p><form action={imporProduk} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4"><input type="file" name="file" accept=".csv,text/csv" required className="rounded-lg border border-garis p-3" /><button className="self-start rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white">Impor CSV</button></form></div>;
}
