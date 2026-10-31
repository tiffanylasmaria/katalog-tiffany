"use client";

import { useEffect, useState } from "react";

export default function ModeGelap() {
  const [gelap, setGelap] = useState(false);
  useEffect(() => {
    const simpan = localStorage.getItem("tema-katalog");
    const nilai = simpan === "gelap";
    document.documentElement.classList.toggle("dark", nilai);
    setGelap(nilai);
  }, []);
  function toggle() {
    const nilai = !gelap;
    setGelap(nilai);
    document.documentElement.classList.toggle("dark", nilai);
    localStorage.setItem("tema-katalog", nilai ? "gelap" : "terang");
  }
  return <button type="button" onClick={toggle} aria-label="Ganti tema" className="rounded-lg border border-garis px-3 py-2 text-sm">{gelap ? "☀ Terang" : "☾ Gelap"}</button>;
}
