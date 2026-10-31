import { NextResponse } from "next/server";
import { buatKlienServer } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { produkId } = await request.json();
    if (!Number.isSafeInteger(Number(produkId)) || Number(produkId) <= 0) {
      return NextResponse.json({ error: "Produk tidak valid." }, { status: 400 });
    }

    const { error } = await buatKlienServer()
      .from("klik_pesan")
      .insert({ produk_id: Number(produkId) });

    if (error) return NextResponse.json({ error: "Pencatatan gagal." }, { status: 503 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    // Kegagalan pencatatan tidak boleh menghambat WhatsApp terbuka.
    return NextResponse.json({ error: "Pencatatan tidak tersedia." }, { status: 503 });
  }
}
