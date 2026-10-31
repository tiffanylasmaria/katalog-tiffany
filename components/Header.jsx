import Link from "next/link";
import ModeGelap from "@/components/ModeGelap";
import { ambilPengaturanToko } from "@/lib/server-data";

export default async function Header() {
  const toko = await ambilPengaturanToko();
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tentang" className="hover:text-utama">Tentang</Link>
          <Link href="/favorit" className="hover:text-utama">Favorit</Link>
          <Link href="/bandingkan" className="hover:text-utama">Bandingkan</Link>
          <ModeGelap />
        </nav>
      </div>
    </header>
  );
}
