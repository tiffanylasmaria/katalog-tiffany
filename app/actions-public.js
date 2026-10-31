"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buatKlienServer } from "@/lib/supabase/server";

export async function kirimUlasan(formData) {
  const produkId = Number(formData.get("produk_id"));
  const nama = formData.get("nama")?.toString().trim().slice(0, 60) || "";
  const komentar = formData.get("komentar")?.toString().trim().slice(0, 1000) || "";
  const rating = Number(formData.get("rating"));
  const honeypot = formData.get("website")?.toString() || "";

  if (honeypot) redirect(`/produk/${produkId}?ulasan=terkirim`);
  if (!Number.isSafeInteger(produkId) || produkId <= 0 || !nama || !komentar || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/produk/${produkId || ""}?ulasan=error`);
  }

  const supabase = buatKlienServer();
  const { error } = await supabase.from("ulasan").insert({
    produk_id: produkId,
    nama,
    rating,
    komentar,
    terlihat: false,
  });

  if (error) redirect(`/produk/${produkId}?ulasan=error`);
  revalidatePath(`/produk/${produkId}`, "page");
  redirect(`/produk/${produkId}?ulasan=menunggu`);
}
