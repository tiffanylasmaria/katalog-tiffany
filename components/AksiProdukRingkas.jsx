"use client";

import { useEffect, useState } from "react";

const KUNCI_FAVORIT = "katalog-favorit";
const KUNCI_BANDING = "katalog-banding";
const KUNCI_KERANJANG = "katalog-keranjang";
const EVENT_PERUBAHAN = "katalog-perubahan-lokal";

function bacaDaftar(kunci) {
  try {
    const nilai = JSON.parse(localStorage.getItem(kunci) || "[]");
    return Array.isArray(nilai) ? nilai : [];
  } catch {
    return [];
  }
}

function umumkanPerubahan() {
  window.dispatchEvent(new Event(EVENT_PERUBAHAN));
}

export default function AksiProdukRingkas({ produk }) {
  const id = String(produk.id);
  const [favorit, setFavorit] = useState(false);
  const [dibandingkan, setDibandingkan] = useState(false);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    const muat = () => {
      setFavorit(bacaDaftar(KUNCI_FAVORIT).includes(id));
      setDibandingkan(bacaDaftar(KUNCI_BANDING).includes(id));
    };
    muat();
    window.addEventListener(EVENT_PERUBAHAN, muat);
    return () => window.removeEventListener(EVENT_PERUBAHAN, muat);
  }, [id]);

  function ubahFavorit() {
    const daftar = bacaDaftar(KUNCI_FAVORIT);
    const berikutnya = favorit ? daftar.filter((item) => item !== id) : [id, ...daftar.filter((item) => item !== id)];
    localStorage.setItem(KUNCI_FAVORIT, JSON.stringify(berikutnya));
    setFavorit(!favorit);
    umumkanPerubahan();
  }

  function ubahBanding() {
    const daftar = bacaDaftar(KUNCI_BANDING);
    if (dibandingkan) {
      localStorage.setItem(KUNCI_BANDING, JSON.stringify(daftar.filter((item) => item !== id)));
      setDibandingkan(false);
      setPesan("");
    } else if (daftar.length >= 2) {
      setPesan("Perbandingan maksimal dua produk.");
    } else {
      localStorage.setItem(KUNCI_BANDING, JSON.stringify([...daftar, id]));
      setDibandingkan(true);
      setPesan("Produk ditambahkan ke perbandingan.");
    }
    umumkanPerubahan();
  }

  function tambahKeKeranjang() {
    let keranjang = {};
    try {
      keranjang = JSON.parse(localStorage.getItem(KUNCI_KERANJANG) || "{}");
    } catch {
      keranjang = {};
    }
    keranjang[id] = (Number(keranjang[id]) || 0) + 1;
    localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(keranjang));
    setPesan("Produk ditambahkan ke keranjang.");
    umumkanPerubahan();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={ubahFavorit} aria-pressed={favorit} className="rounded-lg border border-garis px-3 py-2 text-sm">
        {favorit ? "♥ Favorit" : "♡ Favorit"}
      </button>
      <button type="button" onClick={ubahBanding} aria-pressed={dibandingkan} className="rounded-lg border border-garis px-3 py-2 text-sm">
        {dibandingkan ? "Hapus perbandingan" : "Bandingkan"}
      </button>
      <button type="button" onClick={tambahKeKeranjang} className="rounded-lg border border-garis px-3 py-2 text-sm">
        Tambah ke keranjang
      </button>
      {pesan && <span role="status" className="text-xs text-teks-lembut">{pesan}</span>}
    </div>
  );
}
