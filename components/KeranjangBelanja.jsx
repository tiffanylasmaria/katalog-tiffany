"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";

const KUNCI = "katalog-keranjang";
const EVENT_PERUBAHAN = "katalog-perubahan-lokal";

function simpanIsi(isi) {
  localStorage.setItem(KUNCI, JSON.stringify(isi));
  window.dispatchEvent(new Event(EVENT_PERUBAHAN));
}

export default function KeranjangBelanja({ nomorWhatsApp }) {
  const [isi, setIsi] = useState({});
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    let hidup = true;
    async function muat() {
      let data = {};
      try { data = JSON.parse(localStorage.getItem(KUNCI) || "{}"); } catch { data = {}; }
      if (hidup) setIsi(data);
      const ids = Object.keys(data).filter((id) => Number(data[id]) > 0);
      if (!ids.length) { if (hidup) setProduk([]); return; }
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("id", id));
      try {
        const response = await fetch(`/api/produk?${params.toString()}`);
        if (hidup) setProduk(await response.json());
      } catch { if (hidup) setProduk([]); }
    }
    muat();
    window.addEventListener(EVENT_PERUBAHAN, muat);
    return () => { hidup = false; window.removeEventListener(EVENT_PERUBAHAN, muat); };
  }, []);

  const total = useMemo(() => produk.reduce((sum, item) => sum + Number(item.harga_diskon || item.harga) * Number(isi[String(item.id)] || 0), 0), [produk, isi]);
  const pesan = produk.map((item) => `${item.nama} x${isi[String(item.id)]} — ${formatRupiah(item.harga_diskon || item.harga)}`).join("\n");
  const link = `https://wa.me/${(nomorWhatsApp || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Halo, saya ingin memesan:\n${pesan}\nTotal: ${formatRupiah(total)}`)}`;

  function ubahJumlah(id, nilai) {
    const jumlah = Math.min(99, Math.max(1, Number.parseInt(nilai, 10) || 1));
    const berikutnya = { ...isi, [String(id)]: jumlah };
    setIsi(berikutnya);
    simpanIsi(berikutnya);
  }

  function hapusItem(id) {
    const berikutnya = { ...isi };
    delete berikutnya[String(id)];
    setIsi(berikutnya);
    simpanIsi(berikutnya);
    setProduk((lama) => lama.filter((item) => String(item.id) !== String(id)));
  }

  if (!produk.length) return null;
  return (
    <section className="rounded-2xl border border-utama/30 bg-permukaan p-4">
      <h2 className="font-bold">Keranjang ({produk.reduce((sum, item) => sum + Number(isi[String(item.id)] || 0), 0)} item)</h2>
      <ul className="my-3 space-y-3 text-sm">{produk.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-garis p-3"><span className="min-w-0 flex-1 font-medium">{item.nama}<span className="mt-1 block text-xs text-teks-lembut">{formatRupiah(item.harga_diskon || item.harga)} per item</span></span><label className="flex items-center gap-2">Jumlah<input type="number" min="1" max="99" value={isi[String(item.id)] || 1} onChange={(event) => ubahJumlah(item.id, event.target.value)} aria-label={`Jumlah ${item.nama}`} className="w-20 rounded-lg border border-garis bg-latar px-2 py-1.5" /></label><button type="button" onClick={() => hapusItem(item.id)} className="rounded-lg border border-bahaya/40 px-3 py-1.5 text-bahaya hover:bg-bahaya/10" aria-label={`Hapus ${item.nama} dari keranjang`}>Hapus</button></li>)}</ul>
      <p className="mb-3 font-semibold">Total {formatRupiah(total)}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white">Pesan semua via WhatsApp</a>
    </section>
  );
}
