"use client";

import { useState } from "react";

export default function BagikanProduk({ judul }) {
  const [pesan, setPesan] = useState("");
  async function bagikan() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: judul, url });
      else {
        await navigator.clipboard.writeText(url);
        setPesan("Link tersalin.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") setPesan("Link tidak dapat dibagikan.");
    }
  }
  return <div className="flex items-center gap-2"><button type="button" onClick={bagikan} className="rounded-lg border border-garis px-3 py-2 text-sm">Bagikan atau salin link</button>{pesan && <span role="status" className="text-sm text-teks-lembut">{pesan}</span>}</div>;
}
