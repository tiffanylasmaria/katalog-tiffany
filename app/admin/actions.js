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

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi minimal 8 karakter dan kesamaan dengan konfirmasi di server.
 */
export async function gantiPassword(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const passwordBaru = formData?.get("password_baru")?.toString() || "";
  const konfirmasiPassword = formData?.get("konfirmasi_password")?.toString() || "";

  const supabase = await buatKlienAuth();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi Anda telah berakhir. Silakan login kembali.")}`);
  }

  if (!passwordBaru || passwordBaru.length < 8) {
    const pesan = "Password baru minimal 8 karakter.";
    if (arg2 instanceof FormData) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  if (passwordBaru !== konfirmasiPassword) {
    const pesan = "Konfirmasi password tidak sama dengan password baru.";
    if (arg2 instanceof FormData) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    const pesan = error.message || "Gagal mengganti password.";
    if (arg2 instanceof FormData) return { error: pesan };
    redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
  }

  const pesanBerhasil = "Password berhasil diganti.";
  if (arg2 instanceof FormData) return { berhasil: pesanBerhasil };
  redirect(`/admin/password?berhasil=${encodeURIComponent(pesanBerhasil)}`);
}
