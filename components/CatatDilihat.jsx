"use client";

import { useEffect } from "react";

export default function CatatDilihat({ produkId }) {
  useEffect(() => {
    try {
      const kunci = "katalog-terakhir-dilihat";
      const lama = JSON.parse(localStorage.getItem(kunci) || "[]");
      const berikutnya = [String(produkId), ...(Array.isArray(lama) ? lama.filter((id) => String(id) !== String(produkId)) : [])].slice(0, 10);
      localStorage.setItem(kunci, JSON.stringify(berikutnya));
      window.dispatchEvent(new Event("katalog-perubahan-lokal"));
    } catch {}
  }, [produkId]);
  return null;
}
