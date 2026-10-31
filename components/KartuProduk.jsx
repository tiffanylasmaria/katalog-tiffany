import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { slugKategori } from "@/lib/server-data";
import AksiProdukRingkas from "@/components/AksiProdukRingkas";

export default function KartuProduk({ produk }) {
  const harga = Number(produk.harga_diskon || produk.harga);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <Link href={`/produk/${produk.id}`} className="group relative">
        <img src={produk.foto_url} alt={produk.nama} className="aspect-square w-full bg-permukaan object-cover" />
        {(produk.harga_diskon || produk.badge) && (
          <span className="absolute left-2 top-2 rounded-full bg-bahaya px-2 py-1 text-xs font-bold text-white">
            {produk.badge || "Promo"}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {produk.kategori && <Link href={`/kategori/${slugKategori(produk.kategori)}`} className="text-xs text-teks-lembut underline">{produk.kategori}</Link>}
        <Link href={`/produk/${produk.id}`} className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</Link>
        {produk.stok === 0 && <span className="text-xs font-semibold text-bahaya">Habis</span>}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <p className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">{formatRupiah(harga)}</p>
          {produk.harga_diskon && <del className="text-xs text-teks-lembut">{formatRupiah(produk.harga)}</del>}
        </div>
        <AksiProdukRingkas produk={produk} />
      </div>
    </article>
  );
}
