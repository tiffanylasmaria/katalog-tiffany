import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function getCleanUrl() {
  const url = process.env.SUPABASE_URL || "";
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

/**
 * Proxy (middleware) untuk melindungi semua rute /admin kecuali /admin/login.
 * Admin yang belum login akan dialihkan ke /admin/login.
 * US-06: Proteksi halaman admin.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Lewati /admin/login — tidak perlu proteksi
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const supabaseUrl = getCleanUrl();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  // Fail closed: admin tidak boleh terbuka saat konfigurasi autentikasi hilang.
  if (!supabaseUrl || !publishableKey) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "error",
      "Konfigurasi autentikasi belum tersedia. Hubungi pemilik toko."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Siapkan response awal; akan diganti jika cookie perlu diperbarui
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Tulis cookie ke request agar sesi tersedia di handler berikutnya
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Buat ulang response agar cookie ikut dikirim ke browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Gunakan getUser() bukan getSession() — getUser() memverifikasi ke server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belum login → alihkan ke /admin/login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};

