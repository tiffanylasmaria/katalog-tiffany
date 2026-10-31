"use client";

import { useActionState, useEffect, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

const nilaiAwal = (produk) => ({
  nama: produk.nama || "",
  harga: produk.harga == null ? "" : String(produk.harga),
  kategori: produk.kategori || "",
  foto_url: produk.foto_url || "",
  deskripsi: produk.deskripsi || "",
  stok: produk.stok == null ? "" : String(produk.stok),
  harga_diskon: produk.harga_diskon == null ? "" : String(produk.harga_diskon),
  badge: produk.badge || "",
  aktif: produk.aktif === false ? "false" : "true",
  urutan: String(produk.urutan ?? 0),
  foto_urls: Array.isArray(produk.foto_urls) ? produk.foto_urls.join("\n") : "",
  varian: Array.isArray(produk.varian_produk) ? produk.varian_produk.map((item) => `${item.nama}|${item.harga}`).join("\n") : "",
});

export default function FormProduk({ produk = {}, action, labelTombol, kategori = [] }) {
  const awal = nilaiAwal(produk);
  const [state, formAction, pending] = useActionState(action, { values: awal });
  const [values, setValues] = useState(awal);
  const [pesanAI, setPesanAI] = useState("");

  useEffect(() => {
    if (state?.values) setValues((saatIni) => ({ ...saatIni, ...state.values }));
  }, [state]);

  function ubah(event) {
    setValues((lama) => ({ ...lama, [event.target.name]: event.target.value }));
  }

  async function buatDeskripsi() {
    setPesanAI("");
    try {
      const response = await fetch("/api/ai/deskripsi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: values.nama, kategori: values.kategori }),
      });
      const hasil = await response.json();
      if (!response.ok) throw new Error(hasil.error || "Deskripsi belum dapat dibuat.");
      setValues((lama) => ({ ...lama, deskripsi: hasil.deskripsi }));
      setPesanAI("Deskripsi dibuat. Periksa dan ubah jika perlu.");
    } catch (error) {
      setPesanAI(error.message || "Layanan AI tidak tersedia.");
    }
  }

  function fieldError(nama) {
    return state?.fieldErrors?.[nama] ? <p role="alert" className="-mt-2 text-xs font-normal text-bahaya">{state.fieldErrors[nama]}</p> : null;
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4" encType="multipart/form-data">
      <Input label="Nama produk" name="nama" value={values.nama} onChange={ubah} required maxLength={120} aria-invalid={!!state?.fieldErrors?.nama} />
      {fieldError("nama")}
      <Input label="Harga (Rp)" name="harga" type="number" min="0" step="1" value={values.harga} onChange={ubah} required aria-invalid={!!state?.fieldErrors?.harga} />
      {fieldError("harga")}
      <Input label="Harga diskon (opsional)" name="harga_diskon" type="number" min="0" step="1" value={values.harga_diskon} onChange={ubah} />
      {fieldError("harga_diskon")}
      <Input label="Stok (kosongkan bila tidak dibatasi)" name="stok" type="number" min="0" step="1" value={values.stok} onChange={ubah} />
      {fieldError("stok")}
      {kategori.length ? <label className="flex flex-col gap-1.5 text-sm font-semibold">Kategori<select name="kategori" value={values.kategori} onChange={ubah} className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base">{values.kategori && !kategori.some((item) => item.nama === values.kategori) && <option value={values.kategori}>{values.kategori}</option>}<option value="">Pilih kategori</option>{kategori.map((item) => <option key={item.id || item.nama} value={item.nama}>{item.nama}</option>)}</select></label> : <Input label="Kategori" name="kategori" value={values.kategori} onChange={ubah} />}
      <Input label="Badge (opsional)" name="badge" value={values.badge} onChange={ubah} placeholder="Baru, Terlaris, Promo" />
      <Input label="Urutan tampil" name="urutan" type="number" step="1" value={values.urutan} onChange={ubah} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Status<select name="aktif" value={values.aktif} onChange={ubah} className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"><option value="true">Aktif</option><option value="false">Nonaktif</option></select></label>
      <Input label="Link foto" name="foto_url" value={values.foto_url} onChange={ubah} placeholder="https://... atau /produk/nama-file.svg" />
      <Input label="Unggah foto (maksimal 5 MB)" name="foto" type="file" accept="image/*" />
      <Input label="Foto tambahan, satu URL per baris" name="foto_urls" textarea rows={3} value={values.foto_urls} onChange={ubah} />
      <div className="flex flex-col gap-2"><Input label="Deskripsi" name="deskripsi" textarea value={values.deskripsi} onChange={ubah} maxLength={2000} /><button type="button" onClick={buatDeskripsi} className="self-start rounded-lg border border-garis px-3 py-2 text-sm font-semibold">Buat deskripsi dengan AI</button>{pesanAI && <p role="status" className="text-xs text-teks-lembut">{pesanAI}</p>}</div>
      <Input label="Varian (satu per baris: Nama|Harga)" name="varian" textarea rows={3} value={values.varian} onChange={ubah} placeholder={'250 g|45000\n500 g|80000'} />
      {fieldError("varian")}
      {state?.error && <p role="alert" className="rounded-lg bg-bahaya/10 p-3 text-sm text-bahaya">{state.error}</p>}
      <div className="flex gap-3"><Tombol type="submit" disabled={pending}>{pending ? "Menyimpan…" : labelTombol}</Tombol><Tombol href="/admin" varian="garis">Batal</Tombol></div>
    </form>
  );
}
