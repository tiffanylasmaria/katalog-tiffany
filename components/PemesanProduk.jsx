"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";

export default function PemesanProduk({ produk, varian = [], nomorWhatsApp }) {
  const [varianId, setVarianId] = useState(varian[0]?.id ? String(varian[0].id) : "");
  const [jumlah, setJumlah] = useState(1);
  const varianDipilih = varian.find((item) => String(item.id) === varianId);
  const hargaDasar = Number(varianDipilih?.harga ?? produk.harga_diskon ?? produk.harga);
  const harga = useMemo(() => hargaDasar * jumlah, [hargaDasar, jumlah]);
  const stokHabis = produk.stok === 0;
  const pesan = `Halo, saya ingin memesan ${produk.nama}${varianDipilih ? ` (${varianDipilih.nama})` : ""}, jumlah ${jumlah}, total ${formatRupiah(harga)}.`;
  const nomor = (nomorWhatsApp || "").replace(/\D/g, "");
  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  function catatKlik() {
    fetch("/api/klik", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produkId: produk.id }), keepalive: true }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-3">
      {varian.length > 0 && <label className="flex flex-col gap-1 text-sm font-semibold">Pilih varian<select value={varianId} onChange={(event) => setVarianId(event.target.value)} className="rounded-lg border border-garis bg-latar px-3 py-2">{varian.map((item) => <option key={item.id} value={item.id}>{item.nama} — {formatRupiah(item.harga)}</option>)}</select></label>}
      <label className="flex flex-col gap-1 text-sm font-semibold">Jumlah<input type="number" min="1" max={produk.stok == null ? 99 : Math.max(1, produk.stok)} value={jumlah} onChange={(event) => setJumlah(Math.min(Math.max(1, Number(event.target.value) || 1), produk.stok == null ? 99 : Math.max(1, produk.stok)))} className="w-28 rounded-lg border border-garis px-3 py-2" /></label>
      <p className="font-bold">Total: {formatRupiah(harga)}</p>
      {stokHabis ? <p className="font-semibold text-bahaya">Stok habis</p> : <a href={url} target="_blank" rel="noopener noreferrer" onClick={catatKlik} className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto">Pesan via WhatsApp</a>}
    </div>
  );
}
