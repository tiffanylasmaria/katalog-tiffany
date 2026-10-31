import { NextResponse } from "next/server";
import { buatKlienAuth } from "@/lib/supabase/auth";

export async function POST(request) {
  const sesi = await buatKlienAuth();
  const { data: { user }, error } = await sesi.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Login admin diperlukan." }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 }); }
  const nama = typeof body.nama === "string" ? body.nama.trim().slice(0, 120) : "";
  const kategori = typeof body.kategori === "string" ? body.kategori.trim().slice(0, 80) : "";
  if (!nama) return NextResponse.json({ error: "Nama produk wajib diisi." }, { status: 400 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY belum diatur di server." }, { status: 503 });
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Buat deskripsi katalog yang singkat, menarik, dan tidak mengarang spesifikasi. Gunakan hanya nama dan kategori yang diberikan." }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ nama, kategori }) }] }],
        generationConfig: { maxOutputTokens: 180, temperature: 0.4 },
      }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Gemini gagal membuat deskripsi. Coba lagi." }, { status: 502 });
    const deskripsi = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    return deskripsi ? NextResponse.json({ deskripsi }) : NextResponse.json({ error: "Gemini tidak mengembalikan deskripsi." }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: error?.name === "AbortError" ? "Permintaan AI melewati batas waktu." : "Layanan AI tidak tersedia." }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
