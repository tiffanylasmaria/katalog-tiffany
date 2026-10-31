"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { buatKlienAuth } from "@/lib/supabase/auth";
import { buatKlienServer } from "@/lib/supabase/server";

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
  const fieldErrors = {};

  if (!nama) fieldErrors.nama = "Nama produk wajib diisi.";
  if (!hargaTeks || !Number.isSafeInteger(harga) || harga < 0) fieldErrors.harga = "Harga harus berupa bilangan bulat minimal 0.";
  const hargaDiskonTeks = formData?.get("harga_diskon")?.toString()?.trim() || "";
  const hargaDiskon = hargaDiskonTeks ? Number(hargaDiskonTeks) : null;
  if (hargaDiskonTeks && (!Number.isSafeInteger(hargaDiskon) || hargaDiskon < 0 || hargaDiskon >= harga)) fieldErrors.harga_diskon = "Harga diskon harus berupa bilangan bulat yang lebih rendah dari harga normal.";
  const stokTeks = formData?.get("stok")?.toString()?.trim() || "";
  const stok = stokTeks ? Number(stokTeks) : null;
  if (stokTeks && (!Number.isSafeInteger(stok) || stok < 0)) fieldErrors.stok = "Stok harus berupa bilangan bulat minimal 0.";
  const varianBaris = (formData?.get("varian")?.toString() || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (varianBaris.some((item) => {
    const [namaVarian, hargaVarian] = item.split("|").map((bagian) => bagian.trim());
    return !namaVarian || !Number.isSafeInteger(Number(hargaVarian)) || Number(hargaVarian) < 0;
  })) fieldErrors.varian = "Tulis satu varian per baris dengan format Nama|Harga.";

  const values = Object.fromEntries(["nama", "harga", "kategori", "foto_url", "deskripsi", "stok", "harga_diskon", "badge", "urutan", "foto_urls", "varian"].map((key) => [key, formData?.get(key)?.toString() || ""]));
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  return {
    data: {
      nama,
      harga,
      kategori: formData.get("kategori")?.toString()?.trim() || null,
      foto_url: formData.get("foto_url")?.toString()?.trim() || null,
      deskripsi: formData.get("deskripsi")?.toString()?.trim() || null,
      stok,
      harga_diskon: hargaDiskon,
      badge: formData.get("badge")?.toString()?.trim() || null,
      aktif: formData.get("aktif")?.toString() !== "false",
      urutan: Number.isSafeInteger(Number(formData.get("urutan"))) ? Number(formData.get("urutan")) : 0,
      foto_urls: (formData.get("foto_urls")?.toString() || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    },
    values,
  };
}

function arahkanDenganPesan(path, pesan) {
  redirect(`${path}?error=${encodeURIComponent(pesan)}`);
}

async function unggahFoto(supabase, formData, pathPrefix) {
  const file = formData?.get("foto");
  if (!file || typeof file === "string" || file.size === 0) return { url: null };
  if (!file.type?.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    return { error: "Foto harus berupa gambar dan maksimal 5 MB." };
  }
  const ekstensi = file.name?.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const namaFile = `${pathPrefix}/${randomUUID()}.${ekstensi}`;
  const { error } = await supabase.storage.from("produk").upload(namaFile, file, { upsert: false, contentType: file.type });
  if (error) return { error: `Foto gagal diunggah: ${error.message}` };
  const { data } = supabase.storage.from("produk").getPublicUrl(namaFile);
  return { url: data.publicUrl };
}

async function simpanVarian(supabase, produkId, formData) {
  const baris = (formData.get("varian")?.toString() || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const daftar = [];
  for (const item of baris) {
    const [nama, hargaText] = item.split("|").map((bagian) => bagian.trim());
    const harga = Number(hargaText);
    if (!nama || !Number.isSafeInteger(harga) || harga < 0) return "Varian harus ditulis satu per baris dengan format Nama|Harga.";
    daftar.push({ produk_id: produkId, nama: nama.slice(0, 80), harga });
  }
  const { error: hapusError } = await supabase.from("varian_produk").delete().eq("produk_id", produkId);
  if (hapusError) return hapusError.message;
  if (daftar.length) {
    const { error } = await supabase.from("varian_produk").insert(daftar);
    if (error) return error.message;
  }
  return null;
}

async function catatAktivitas(supabase, aksi, detail) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("log_aktivitas").insert({ admin_id: user?.id || null, aksi, detail });
  } catch {}
}

export async function tambahProduk(prevState, formData) {
  if (prevState instanceof FormData) formData = prevState;
  const supabase = await dapatkanKlienAdmin();
  const hasil = bacaDataProduk(formData);

  if (!hasil.data) return { fieldErrors: hasil.fieldErrors, values: hasil.values };

  const unggahan = await unggahFoto(supabase, formData, "produk");
  if (unggahan.error) return { error: unggahan.error, values: hasil.values };
  if (unggahan.url) hasil.data.foto_url = unggahan.url;

  const { data: produk, error } = await supabase.from("produk").insert(hasil.data).select("id").single();

  if (error) {
    return { error: error.message || "Produk gagal disimpan. Silakan coba lagi.", values: hasil.values };
  }

  const errorVarian = await simpanVarian(supabase, produk.id, formData);
  if (errorVarian) return { error: `Produk tersimpan, tetapi varian gagal diperbarui: ${errorVarian}`, values: hasil.values };
  await catatAktivitas(supabase, "tambah_produk", `Menambahkan produk ${hasil.data.nama} (#${produk.id})`);

  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?berhasil=Produk+berhasil+ditambahkan.");
}

export async function ubahProduk(id, prevState, formData) {
  if (prevState instanceof FormData) formData = prevState;
  const supabase = await dapatkanKlienAdmin();
  const hasil = bacaDataProduk(formData);

  if (!hasil.data) return { fieldErrors: hasil.fieldErrors, values: hasil.values };

  const unggahan = await unggahFoto(supabase, formData, `produk/${id}`);
  if (unggahan.error) return { error: unggahan.error, values: hasil.values };
  if (unggahan.url) hasil.data.foto_url = unggahan.url;

  const { data, error } = await supabase
    .from("produk")
    .update(hasil.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: error?.message || "Produk tidak ditemukan atau gagal diperbarui.", values: hasil.values };

  const errorVarian = await simpanVarian(supabase, id, formData);
  if (errorVarian) return { error: `Produk diperbarui, tetapi varian gagal diperbarui: ${errorVarian}`, values: hasil.values };
  await catatAktivitas(supabase, "ubah_produk", `Memperbarui produk ${hasil.data.nama} (#${id})`);

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

export async function hapusProduk(id) {
  const supabase = await dapatkanKlienAdmin();
  const { data, error } = await supabase.from("produk").delete().eq("id", id).select("nama").maybeSingle();
  if (error || !data) redirect(`/admin?error=${encodeURIComponent(error?.message || "Produk tidak ditemukan.")}`);
  await catatAktivitas(supabase, "hapus_produk", `Menghapus produk ${data.nama} (#${id})`);
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?berhasil=Produk+berhasil+dihapus.");
}

export async function ubahStatusProduk(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const aktif = formData.get("aktif")?.toString() === "true";
  const { error } = await supabase.from("produk").update({ aktif }).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  await catatAktivitas(supabase, "ubah_status_produk", `Status produk #${id}: ${aktif ? "aktif" : "nonaktif"}`);
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?berhasil=Status+produk+diperbarui.");
}

export async function ubahUrutanProduk(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const delta = Number(formData.get("delta"));
  if (!Number.isSafeInteger(Number(id)) || ![-1, 1].includes(delta)) redirect("/admin?error=Urutan+produk+tidak+valid.");
  const { data, error } = await supabase.from("produk").select("urutan").eq("id", id).single();
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  const { error: updateError } = await supabase.from("produk").update({ urutan: (data.urutan || 0) + delta }).eq("id", id);
  if (updateError) redirect(`/admin?error=${encodeURIComponent(updateError.message)}`);
  await catatAktivitas(supabase, "ubah_urutan_produk", `Mengubah urutan produk #${id}`);
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect("/admin?berhasil=Urutan+produk+diperbarui.");
}

export async function tambahKategori(formData) {
  const supabase = await dapatkanKlienAdmin();
  const nama = formData.get("nama")?.toString().trim().slice(0, 80) || "";
  if (!nama) redirect("/admin/kategori?error=Nama+kategori+wajib+diisi.");
  const { error } = await supabase.from("kategori_produk").insert({ nama });
  if (error) redirect(`/admin/kategori?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "page");
  redirect("/admin/kategori?berhasil=Kategori+ditambahkan.");
}

export async function ubahKategori(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const nama = formData.get("nama")?.toString().trim().slice(0, 80) || "";
  if (!nama || !Number.isSafeInteger(Number(id))) redirect("/admin/kategori?error=Data+kategori+tidak+valid.");
  const { data: lama } = await supabase.from("kategori_produk").select("nama").eq("id", id).single();
  const { error } = await supabase.from("kategori_produk").update({ nama }).eq("id", id);
  if (error) redirect(`/admin/kategori?error=${encodeURIComponent(error.message)}`);
  if (lama?.nama) await supabase.from("produk").update({ kategori: nama }).eq("kategori", lama.nama);
  revalidatePath("/", "page");
  redirect("/admin/kategori?berhasil=Kategori+diperbarui.");
}

export async function hapusKategori(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const { data: kategori } = await supabase.from("kategori_produk").select("nama").eq("id", id).maybeSingle();
  if (!kategori) redirect("/admin/kategori?error=Kategori+tidak+ditemukan.");
  const { count } = await supabase.from("produk").select("id", { count: "exact", head: true }).eq("kategori", kategori.nama);
  if (count) redirect(`/admin/kategori?error=${encodeURIComponent("Kategori masih dipakai oleh produk.")}`);
  const { error } = await supabase.from("kategori_produk").delete().eq("id", id);
  if (error) redirect(`/admin/kategori?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "page");
  redirect("/admin/kategori?berhasil=Kategori+dihapus.");
}

export async function tambahBanner(formData) {
  const supabase = await dapatkanKlienAdmin();
  const judul = formData.get("judul")?.toString().trim().slice(0, 120) || "";
  if (!judul) redirect("/admin/banner?error=Judul+wajib+diisi.");
  const { error } = await supabase.from("banner").insert({
    judul,
    teks: formData.get("teks")?.toString().trim().slice(0, 500) || null,
    gambar_url: formData.get("gambar_url")?.toString().trim() || null,
    tautan: formData.get("tautan")?.toString().trim() || null,
    aktif: formData.get("aktif")?.toString() === "on",
  });
  if (error) redirect(`/admin/banner?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "page");
  redirect("/admin/banner?berhasil=Banner+disimpan.");
}

export async function toggleBanner(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const aktif = formData.get("aktif")?.toString() === "true";
  const { error } = await supabase.from("banner").update({ aktif }).eq("id", id);
  if (error) redirect(`/admin/banner?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "page");
  redirect("/admin/banner?berhasil=Banner+diperbarui.");
}

export async function ubahBanner(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const judul = formData.get("judul")?.toString().trim().slice(0, 120) || "";
  if (!judul) redirect("/admin/banner?error=Judul+wajib+diisi.");
  const { error } = await supabase.from("banner").update({
    judul,
    teks: formData.get("teks")?.toString().trim().slice(0, 500) || null,
    gambar_url: formData.get("gambar_url")?.toString().trim() || null,
    tautan: formData.get("tautan")?.toString().trim() || null,
  }).eq("id", id);
  if (error) redirect(`/admin/banner?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "page");
  redirect("/admin/banner?berhasil=Banner+diperbarui.");
}

export async function simpanPengaturanToko(formData) {
  const supabase = await dapatkanKlienAdmin();
  const nomor = formData.get("nomor_whatsapp")?.toString().replace(/\D/g, "") || "";
  if (nomor.length < 10 || nomor.length > 15) redirect("/admin/pengaturan?error=Nomor+WhatsApp+harus+10–15+digit.");
  const data = {
    id: true,
    nama: formData.get("nama")?.toString().trim().slice(0, 100) || "",
    nomor_whatsapp: nomor,
    alamat: formData.get("alamat")?.toString().trim().slice(0, 250) || null,
    jam_buka: formData.get("jam_buka")?.toString().trim().slice(0, 160) || null,
    tagline: formData.get("tagline")?.toString().trim().slice(0, 250) || null,
  };
  if (!data.nama) redirect("/admin/pengaturan?error=Nama+toko+wajib+diisi.");
  const { error } = await supabase.from("pengaturan_toko").upsert(data, { onConflict: "id" });
  if (error) redirect(`/admin/pengaturan?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect("/admin/pengaturan?berhasil=Pengaturan+disimpan.");
}

export async function moderasiUlasan(formData) {
  const supabase = await dapatkanKlienAdmin();
  const id = formData.get("id")?.toString();
  const aksi = formData.get("aksi")?.toString();
  if (aksi === "hapus") {
    const { error } = await supabase.from("ulasan").delete().eq("id", id);
    if (error) redirect(`/admin/ulasan?error=${encodeURIComponent(error.message)}`);
  } else {
    const terlihat = aksi === "tampilkan";
    const { error } = await supabase.from("ulasan").update({ terlihat }).eq("id", id);
    if (error) redirect(`/admin/ulasan?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/produk/[id]", "page");
  redirect("/admin/ulasan?berhasil=Ulasan+diperbarui.");
}

export async function buatAdmin(formData) {
  const supabase = await dapatkanKlienAdmin();
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) redirect("/admin/akun?error=Email+atau+password+tidak+valid.");
  const admin = buatKlienServer();
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) redirect(`/admin/akun?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/akun?berhasil=Akun+admin+dibuat.");
}

export async function hapusAdmin(formData) {
  const supabase = await dapatkanKlienAdmin();
  const { data: { user } } = await supabase.auth.getUser();
  const id = formData.get("id")?.toString();
  if (!id || id === user?.id) redirect("/admin/akun?error=Akun+yang+sedang+dipakai+tidak+bisa+dihapus.");
  const { error } = await buatKlienServer().auth.admin.deleteUser(id);
  if (error) redirect(`/admin/akun?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/akun?berhasil=Akun+admin+dihapus.");
}

function pecahBarisCsv(baris) {
  const hasil = [];
  let nilai = "";
  let kutip = false;
  for (let i = 0; i < baris.length; i++) {
    const karakter = baris[i];
    if (karakter === '"' && kutip && baris[i + 1] === '"') { nilai += '"'; i++; }
    else if (karakter === '"') kutip = !kutip;
    else if (karakter === "," && !kutip) { hasil.push(nilai); nilai = ""; }
    else nilai += karakter;
  }
  hasil.push(nilai);
  return hasil;
}

export async function imporProduk(formData) {
  const supabase = await dapatkanKlienAdmin();
  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size > 2 * 1024 * 1024) redirect("/admin/impor?error=Unggah+CSV+maksimal+2+MB.");
  const baris = (await file.text()).split(/\r?\n/).filter((item) => item.trim());
  if (baris.length < 2 || baris.length > 501) redirect("/admin/impor?error=CSV+harus+berisi+header+dan+maksimal+500+baris.");
  const header = pecahBarisCsv(baris[0]).map((item) => item.trim().toLowerCase());
  const kolom = ["nama", "harga", "kategori", "foto_url", "deskripsi"];
  if (!kolom.every((item) => header.includes(item))) redirect("/admin/impor?error=Header+wajib:+nama,harga,kategori,foto_url,deskripsi.");
  const produk = [];
  const gagal = [];
  for (let i = 1; i < baris.length; i++) {
    const nilai = pecahBarisCsv(baris[i]);
    const item = Object.fromEntries(header.map((key, index) => [key, nilai[index] || ""]));
    const harga = Number(item.harga);
    if (!item.nama.trim() || !Number.isSafeInteger(harga) || harga < 0) gagal.push(i + 1);
    else produk.push({ nama: item.nama.trim().slice(0, 120), harga, kategori: item.kategori.trim() || null, foto_url: item.foto_url.trim() || null, deskripsi: item.deskripsi.trim() || null });
  }
  if (produk.length) {
    const { error } = await supabase.from("produk").insert(produk);
    if (error) redirect(`/admin/impor?error=${encodeURIComponent(error.message)}`);
    await catatAktivitas(supabase, "impor_produk", `Mengimpor ${produk.length} produk dari CSV`);
  }
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
  redirect(`/admin/impor?berhasil=${produk.length}&gagal=${gagal.join(",")}`);
}
