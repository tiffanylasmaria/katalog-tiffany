"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

const EVENT_PERUBAHAN = "katalog-perubahan-lokal";
const KUNCI = {
  recent: "katalog-terakhir-dilihat",
  favorites: "katalog-favorit",
  compare: "katalog-banding",
};

export default function DaftarLokal({ jenis, judul }) {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    let hidup = true;
    async function muat() {
      let ids = [];
      try {
        ids = JSON.parse(localStorage.getItem(KUNCI[jenis]) || "[]");
      } catch {
        ids = [];
      }
      if (!Array.isArray(ids) || ids.length === 0) {
        if (hidup) setProduk([]);
        return;
      }
      const params = new URLSearchParams();
      ids.slice(0, 20).forEach((id) => params.append("id", id));
      try {
        const response = await fetch(`/api/produk?${params.toString()}`);
        const data = await response.json();
        if (hidup) {
          const urutan = new Map(ids.map((id, index) => [String(id), index]));
          setProduk((data || []).sort((a, b) => urutan.get(String(a.id)) - urutan.get(String(b.id))));
        }
      } catch {
        if (hidup) setProduk([]);
      }
    }
    muat();
    window.addEventListener(EVENT_PERUBAHAN, muat);
    return () => {
      hidup = false;
      window.removeEventListener(EVENT_PERUBAHAN, muat);
    };
  }, [jenis]);

  if (!produk.length) return null;

  return (
    <section className="flex flex-col gap-3" aria-label={judul}>
      <h2 className="text-lg font-bold">{judul}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {produk.map((item) => (
          <li key={item.id} className="rounded-xl border border-garis p-3">
            <Link href={`/produk/${item.id}`} className="font-semibold hover:text-utama">{item.nama}</Link>
            <p className="mt-1 text-sm text-teks-lembut">{formatRupiah(item.harga_diskon || item.harga)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
