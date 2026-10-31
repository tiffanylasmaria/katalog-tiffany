"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

export default function BandingkanProduk() {
  const [produk, setProduk] = useState([]);
  useEffect(() => {
    let hidup = true;
    async function muat() {
      let ids = [];
      try { ids = JSON.parse(localStorage.getItem("katalog-banding") || "[]"); } catch { ids = []; }
      const params = new URLSearchParams();
      (Array.isArray(ids) ? ids.slice(0, 2) : []).forEach((id) => params.append("id", id));
      if (!params.size) { if (hidup) setProduk([]); return; }
      try { const r = await fetch(`/api/produk?${params}`); if (hidup) setProduk(await r.json()); } catch { if (hidup) setProduk([]); }
    }
    muat();
    return () => { hidup = false; };
  }, []);
  if (!produk.length) return <p className="py-8 text-teks-lembut">Pilih maksimal dua produk dari katalog untuk dibandingkan.</p>;
  return <div className="grid gap-4 sm:grid-cols-2">{produk.map((item) => <article key={item.id} className="rounded-2xl border border-garis p-4"><Link href={`/produk/${item.id}`}><img src={item.foto_url} alt={item.nama} className="aspect-square w-full rounded-xl object-cover" /><h2 className="mt-3 text-xl font-bold">{item.nama}</h2></Link><dl className="mt-3 space-y-2 text-sm"><div><dt className="font-semibold">Kategori</dt><dd>{item.kategori || "—"}</dd></div><div><dt className="font-semibold">Harga</dt><dd>{formatRupiah(item.harga_diskon || item.harga)}</dd></div><div><dt className="font-semibold">Deskripsi</dt><dd>{item.deskripsi || "—"}</dd></div></dl></article>)}</div>;
}
