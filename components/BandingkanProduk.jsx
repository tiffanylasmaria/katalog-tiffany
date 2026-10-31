"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

export default function BandingkanProduk() {
  const [produk, setProduk] = useState([]);
  const [jumlahDipilih, setJumlahDipilih] = useState(0);
  const [gagalMemuat, setGagalMemuat] = useState(false);
  useEffect(() => {
    let hidup = true;
    async function muat() {
      let ids = [];
      try { ids = JSON.parse(localStorage.getItem("katalog-banding") || "[]"); } catch { ids = []; }
      const params = new URLSearchParams();
      const pilihan = Array.isArray(ids) ? ids.slice(0, 2) : [];
      if (hidup) setJumlahDipilih(pilihan.length);
      pilihan.forEach((id) => params.append("id", id));
      if (!params.size) { if (hidup) setProduk([]); return; }
      try {
        const r = await fetch(`/api/produk?${params}`);
        if (!r.ok) throw new Error("Produk gagal dimuat.");
        const data = await r.json();
        if (hidup) {
          const produkValid = Array.isArray(data) ? data : [];
          setProduk(produkValid);
          setGagalMemuat(false);
          if (produkValid.length < pilihan.length) {
            localStorage.setItem("katalog-banding", JSON.stringify(produkValid.map((item) => String(item.id))));
          }
        }
      } catch {
        if (hidup) { setProduk([]); setGagalMemuat(true); }
      }
    }
    muat();
    return () => { hidup = false; };
  }, []);
  if (gagalMemuat) return <p role="alert" className="py-8 text-bahaya">Produk gagal dimuat. Muat ulang halaman untuk mencoba lagi.</p>;
  if (!produk.length) return <div className="py-8 text-teks-lembut">{jumlahDipilih ? <div role="alert" className="rounded-xl border border-bahaya/20 bg-bahaya/10 p-4"><h2 className="font-semibold text-bahaya">Produk tidak ditemukan</h2><p className="mt-2">Produk yang dipilih sudah tidak tersedia. Pilihan lama sudah dibersihkan.</p><Link href="/" className="mt-3 inline-block text-utama underline">Kembali ke katalog dan pilih produk</Link></div> : <p>Pilih maksimal dua produk dari katalog untuk dibandingkan.</p>}</div>;
  return <div className="grid gap-4 sm:grid-cols-2">{jumlahDipilih > produk.length && <p role="alert" className="sm:col-span-2 rounded-lg border border-bahaya/20 bg-bahaya/10 p-3 text-sm text-bahaya">Sebagian produk tidak ditemukan dan sudah dibersihkan dari pilihan.</p>}{produk.map((item) => <article key={item.id} className="rounded-2xl border border-garis p-4"><Link href={`/produk/${item.id}`}><img src={item.foto_url} alt={item.nama} className="aspect-square w-full rounded-xl object-cover" /><h2 className="mt-3 text-xl font-bold">{item.nama}</h2></Link><dl className="mt-3 space-y-2 text-sm"><div><dt className="font-semibold">Kategori</dt><dd>{item.kategori || "—"}</dd></div><div><dt className="font-semibold">Harga</dt><dd>{formatRupiah(item.harga_diskon || item.harga)}</dd></div><div><dt className="font-semibold">Deskripsi</dt><dd>{item.deskripsi || "—"}</dd></div></dl></article>)}</div>;
}
