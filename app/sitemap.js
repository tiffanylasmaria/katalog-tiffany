import { buatKlienServer } from "@/lib/supabase/server";

export default async function sitemap() {
  const basis = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "katalog-tiffany-wqq5.vercel.app"}`;
  const rute = [{ url: basis, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, { url: `${basis}/tentang`, changeFrequency: "monthly", priority: 0.5 }];
  try {
    const supabase = buatKlienServer();
    let { data, error } = await supabase.from("produk").select("id, created_at").eq("aktif", true);
    if (error) ({ data } = await supabase.from("produk").select("id, created_at"));
    for (const produk of data || []) rute.push({ url: `${basis}/produk/${produk.id}`, lastModified: produk.created_at || new Date(), changeFrequency: "weekly", priority: 0.7 });
  } catch {}
  return rute;
}
