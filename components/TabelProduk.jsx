import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import TombolHapusProduk from "@/components/TombolHapusProduk";
import { hapusProduk, ubahStatusProduk, ubahUrutanProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut"><tr><th className="px-4 py-3 font-semibold">Produk</th><th className="px-4 py-3 font-semibold">Kategori</th><th className="px-4 py-3 font-semibold">Harga</th><th className="px-4 py-3 font-semibold">Stok / Status</th><th className="px-4 py-3 font-semibold"><span className="sr-only">Aksi</span></th></tr></thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis">
              <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={produk.foto_url || "/produk/kopi.svg"} alt="" className="h-10 w-10 rounded-md object-cover" /><span className="font-semibold">{produk.nama}</span></div></td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "—"}</td>
              <td className="px-4 py-3">{formatRupiah(produk.harga_diskon || produk.harga)}{produk.harga_diskon && <del className="ml-2 text-xs text-teks-lembut">{formatRupiah(produk.harga)}</del>}</td>
              <td className="px-4 py-3"><p>{produk.stok == null ? "Tidak dibatasi" : produk.stok === 0 ? "Habis" : produk.stok}</p><form action={ubahStatusProduk} className="mt-1"><input type="hidden" name="id" value={produk.id} /><input type="hidden" name="aktif" value={produk.aktif === false ? "true" : "false"} /><button className="text-xs font-semibold text-utama underline">{produk.aktif === false ? "Aktifkan" : "Nonaktifkan"}</button></form></td>
              <td className="px-4 py-3"><div className="flex flex-wrap justify-end gap-2"><form action={ubahUrutanProduk}><input type="hidden" name="id" value={produk.id} /><input type="hidden" name="delta" value="-1" /><button aria-label={`Naikkan ${produk.nama}`} className="rounded border border-garis px-2 py-1">↑</button></form><form action={ubahUrutanProduk}><input type="hidden" name="id" value={produk.id} /><input type="hidden" name="delta" value="1" /><button aria-label={`Turunkan ${produk.nama}`} className="rounded border border-garis px-2 py-1">↓</button></form><Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">Ubah</Tombol><TombolHapusProduk action={hapusProduk.bind(null, String(produk.id))} /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
