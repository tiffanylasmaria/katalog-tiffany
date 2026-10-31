"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKlienAuth } from "@/lib/supabase/auth";

async function dapatkanKlienAdmin() {
  const supabase = await buatKlienAuth();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Sesi Anda telah berakhir. Silakan login kembali.")}`
    );
  }

  return supabase;
}

function bacaDataProduk(formData) {
  const nama = formData?.get("nama")?.toString()?.trim() || "";
  const hargaTeks = formData?.get("harga")?.toString()?.trim() || "";
  const harga = Number(hargaTeks);

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (!hargaTeks || !Number.isSafeInteger(harga) || harga < 0) {
    return { error: "Harga harus berupa bilangan bulat minimal 0." };
  }

  return {
    data: {
      nama,
      harga,
      kategori: formData.get("kategori")?.toString()?.trim() || null,
      foto_url: formData.get("foto_url")?.toString()?.trim() || null,
      deskripsi: formData.get("deskripsi")?.toString()?.trim() || null,
    },
  };
}

function arahkanDenganPesan(path, pesan) {
  redirect(`${path}?error=${encodeURIComponent(pesan)}`);
}

export async function tambahProduk(formData) {
  const supabase = await dapatkanKlienAdmin();
  const hasil = bacaDataProduk(formData);

  if (hasil.error) {
    arahkanDenganPesan("/admin/produk/baru", hasil.error);
  }

  const { error } = await supabase.from("produk").insert(hasil.data);

  if (error) {
    arahkanDenganPesan(
      "/admin/produk/baru",
      error.message || "Produk gagal disimpan. Silakan coba lagi."
    );
  }

  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?berhasil=Produk+berhasil+ditambahkan.");
}

export async function ubahProduk(id, formData) {
  const supabase = await dapatkanKlienAdmin();
  const hasil = bacaDataProduk(formData);

  if (hasil.error) {
    arahkanDenganPesan(`/admin/produk/${id}/ubah`, hasil.error);
  }

  const { data, error } = await supabase
    .from("produk")
    .update(hasil.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    arahkanDenganPesan(
      `/admin/produk/${id}/ubah`,
      error?.message || "Produk tidak ditemukan atau gagal diperbarui."
    );
  }

  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  revalidatePath(`/produk/${id}`, "page");
  redirect("/admin?berhasil=Produk+berhasil+diperbarui.");
}

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

  const supabase = await dapatkanKlienAdmin();

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
