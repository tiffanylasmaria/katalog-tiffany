import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

/**
 * Membuat koneksi Supabase untuk sesi admin menggunakan @supabase/ssr dan cookie.
 * Menggunakan SUPABASE_PUBLISHABLE_KEY.
 * Digunakan untuk login, keluar, ganti password, dan aksi data admin.
 */
export async function buatKlienAuth() {
  const cookieStore = await cookies();
  const url = getCleanUrl();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Abaikan jika dipanggil dari Server Component yang tidak mengizinkan penulisan cookie langsung
        }
      },
    },
  });
}

export const createAuthClient = buatKlienAuth;

