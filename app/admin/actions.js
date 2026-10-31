"use server";

import { redirect } from "next/navigation";
import { buatKlienAuth } from "@/lib/supabase/auth";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 * Login berhasil diarahkan ke /admin.
 * Login gagal diarahkan kembali ke /admin/login dengan pesan error.
 */
export async function masuk(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const email = formData?.get("email")?.toString()?.trim() || "";
  const password = formData?.get("password")?.toString() || "";

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (arg2 instanceof FormData) return { error: pesan };
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  const supabase = await buatKlienAuth();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      pesan = "Email atau password salah. Periksa kembali akun Anda.";
    }
    if (arg2 instanceof FormData) return { error: pesan };
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi login (logout).
 * Mengakhiri sesi lalu kembali ke /admin/login.
 */
export async function keluar() {
  const supabase = await buatKlienAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

