"use client";

import { useState } from "react";

export default function TanyaProduk({ produkId }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [sibuk, setSibuk] = useState(false);

  async function kirim(event) {
    event.preventDefault();
    setJawaban("");
    setSibuk(true);
    try {
      const response = await fetch("/api/produk/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produkId, pertanyaan }),
      });
      const data = await response.json();
      setJawaban(data.jawaban || data.error || "Maaf, jawaban belum tersedia.");
    } catch {
      setJawaban("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t border-garis pt-6">
      <h2 className="text-xl font-bold">Tanya tentang produk ini</h2>
      <form onSubmit={kirim} className="flex flex-col gap-3">
        <textarea value={pertanyaan} onChange={(event) => setPertanyaan(event.target.value.slice(0, 500))} maxLength={500} required rows={3} placeholder="Tanyakan bahan, harga, atau deskripsi produk" className="rounded-lg border border-garis px-3 py-2" />
        <button disabled={sibuk} className="self-start rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{sibuk ? "Sedang menjawab…" : "Tanya"}</button>
      </form>
      {jawaban && <p role="status" className="rounded-xl bg-permukaan p-4 text-sm">{jawaban}</p>}
    </section>
  );
}
