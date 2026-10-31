import Link from "next/link";
import { keluar } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-garis pb-4 text-sm">
      <Link href="/admin" className="font-semibold hover:text-utama">
        Produk
      </Link>
      <Link href="/admin/password" className="font-semibold hover:text-utama">
        Ganti password
      </Link>
      <details className="relative">
        <summary className="cursor-pointer font-semibold hover:text-utama">Fitur admin</summary>
        <div className="absolute left-0 top-full z-20 mt-2 grid min-w-48 gap-2 rounded-xl border border-garis bg-latar p-3 shadow-lg">
          <Link href="/admin/kategori">Kategori</Link>
          <Link href="/admin/ulasan">Ulasan</Link>
          <Link href="/admin/banner">Banner</Link>
          <Link href="/admin/pengaturan">Pengaturan toko</Link>
          <Link href="/admin/akun">Akun admin</Link>
          <Link href="/admin/log">Log aktivitas</Link>
          <Link href="/admin/impor">Impor CSV</Link>
          <Link href="/api/admin/produk.csv">Ekspor CSV</Link>
        </div>
      </details>
      <form action={keluar} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya">
          Keluar
        </button>
      </form>
    </nav>
  );
}
