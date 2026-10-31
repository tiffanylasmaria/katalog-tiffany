export default function AdminLoading() {
  return (
    <div role="status" aria-label="Memuat" className="flex min-h-48 animate-pulse flex-col gap-4 py-10">
      <span className="h-8 w-48 rounded bg-permukaan" />
      <span className="h-40 rounded-2xl bg-permukaan" />
      <span className="text-sm text-teks-lembut">Memuat data admin…</span>
    </div>
  );
}
