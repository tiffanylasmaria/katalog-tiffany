import { kirimUlasan } from "@/app/actions-public";

export default function GaleriUlasan({ produkId, ulasan = [] }) {
  const rataRata = ulasan.length ? (ulasan.reduce((jumlah, item) => jumlah + item.rating, 0) / ulasan.length).toFixed(1) : null;
  return (
    <section className="flex flex-col gap-4 border-t border-garis pt-6">
      <div><h2 className="text-xl font-bold">Ulasan pembeli</h2>{rataRata && <p className="text-sm text-teks-lembut">Rata-rata {rataRata}/5 dari {ulasan.length} ulasan</p>}</div>
      {ulasan.length > 0 ? <ul className="space-y-3">{ulasan.map((item) => <li key={item.id} className="rounded-xl border border-garis p-4"><p className="font-semibold">{item.nama} · {item.rating}/5</p><p className="mt-1 text-sm text-teks-lembut">{item.komentar}</p></li>)}</ul> : <p className="text-sm text-teks-lembut">Belum ada ulasan.</p>}
      <form action={kirimUlasan} className="grid gap-3 rounded-xl bg-permukaan p-4">
        <input type="hidden" name="produk_id" value={produkId} />
        <label className="flex flex-col gap-1 text-sm font-semibold">Nama<input name="nama" maxLength={60} required className="rounded-lg border border-garis px-3 py-2" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Rating<select name="rating" defaultValue="5" className="rounded-lg border border-garis px-3 py-2">{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} dari 5</option>)}</select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Komentar<textarea name="komentar" maxLength={1000} required rows={3} className="rounded-lg border border-garis px-3 py-2" /></label>
        <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">Jangan isi<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <button className="justify-self-start rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white">Kirim ulasan</button>
        <p className="text-xs text-teks-lembut">Ulasan akan tampil setelah disetujui admin.</p>
      </form>
    </section>
  );
}
