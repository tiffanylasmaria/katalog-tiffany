export default function robots() {
  const basis = process.env.VERCEL_PROJECT_PRODUCTION_URL || "katalog-tiffany-wqq5.vercel.app";
  return { rules: { userAgent: "*", allow: "/", disallow: "/admin/" }, sitemap: `https://${basis}/sitemap.xml` };
}
