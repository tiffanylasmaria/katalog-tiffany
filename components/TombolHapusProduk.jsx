"use client";

export default function TombolHapusProduk({ action }) {
  function konfirmasi(event) {
    if (!window.confirm("Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.")) event.preventDefault();
  }
  return <form action={action} onSubmit={konfirmasi}><button type="submit" className="inline-flex rounded-lg border border-bahaya px-3 py-2 text-sm font-semibold text-bahaya hover:bg-bahaya/10">Hapus</button></form>;
}
