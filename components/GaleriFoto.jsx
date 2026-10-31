"use client";

import { useState } from "react";

export default function GaleriFoto({ foto, fotoTambahan = [], nama }) {
  const daftar = [...new Set([foto, ...fotoTambahan].filter(Boolean))];
  const [aktif, setAktif] = useState(daftar[0] || "/produk/kopi.svg");
  return (
    <div className="flex flex-col gap-3">
      <img src={aktif} alt={nama} className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover" />
      {daftar.length > 1 && <div className="flex gap-2 overflow-x-auto">{daftar.map((src) => <button key={src} type="button" onClick={() => setAktif(src)} aria-label={`Lihat foto ${nama}`} className={`shrink-0 rounded-lg border p-1 ${aktif === src ? "border-utama" : "border-garis"}`}><img src={src} alt="" className="h-16 w-16 rounded object-cover" /></button>)}</div>}
    </div>
  );
}
