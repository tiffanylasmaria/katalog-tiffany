import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

/**
 * Membuat koneksi Supabase di sisi server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (katalog dan detail produk) tanpa sesi login.
 */
export function buatKlienServer() {
  const url = getCleanUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Alias untuk fleksibilitas impor
export const createServerClient = buatKlienServer;
export const createClient = buatKlienServer;
