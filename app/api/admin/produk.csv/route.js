import { buatKlienAuth } from "@/lib/supabase/auth";

function escapeCsv(nilai) {
  const teks = String(nilai ?? "");
  return `"${teks.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await buatKlienAuth();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Tidak diizinkan.", { status: 401 });

  const { data, error } = await supabase.from("produk").select("id,nama,harga,kategori,foto_url,deskripsi,stok,aktif").order("id");
  if (error) return new Response("Gagal mengekspor produk.", { status: 503 });
  const baris = [
    ["id", "nama", "harga", "kategori", "foto_url", "deskripsi", "stok", "aktif"],
    ...(data || []).map((item) => [item.id, item.nama, item.harga, item.kategori, item.foto_url, item.deskripsi, item.stok, item.aktif]),
  ].map((kolom) => kolom.map(escapeCsv).join(",")).join("\r\n");
  return new Response(`\uFEFF${baris}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="produk.csv"',
      "Cache-Control": "no-store",
    },
  });
}
