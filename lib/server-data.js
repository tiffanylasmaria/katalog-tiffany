import { toko as dataTokoDefault } from "@/lib/toko";
import { buatKlienServer } from "@/lib/supabase/server";

export function slugKategori(nama = "") {
  return nama
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ambilPengaturanToko() {
  try {
    const { data } = await buatKlienServer()
      .from("pengaturan_toko")
      .select("nama, nomor_whatsapp, alamat, jam_buka, tagline")
      .eq("id", true)
      .maybeSingle();

    if (data) {
      return {
        ...dataTokoDefault,
        nama: data.nama || dataTokoDefault.nama,
        nomorWhatsApp: data.nomor_whatsapp || dataTokoDefault.nomorWhatsApp,
        alamat: data.alamat || dataTokoDefault.alamat,
        jamBuka: data.jam_buka || dataTokoDefault.jamBuka,
        tagline: data.tagline || dataTokoDefault.tagline,
      };
    }
  } catch {
    // Database mungkin belum dimigrasikan; pakai identitas cadangan dari kode.
  }

  return dataTokoDefault;
}

export async function ambilProdukDenganId(ids) {
  const idValid = [...new Set((ids || []).map(String))]
    .filter((id) => /^\d+$/.test(id))
    .slice(0, 20);

  if (!idValid.length) return [];

  const supabase = buatKlienServer();
  let { data, error } = await supabase
    .from("produk")
    .select("*")
    .in("id", idValid)
    .eq("aktif", true);

  if (error && /aktif/i.test(error.message)) {
    ({ data, error } = await supabase.from("produk").select("*").in("id", idValid));
  }
  return error ? [] : data || [];
}
