import BandingkanProduk from "@/components/BandingkanProduk";

export const metadata = { title: "Bandingkan Produk | serba serbi" };

export default function HalamanBandingkan() {
  return <section className="flex flex-col gap-5 py-10"><h1 className="text-3xl font-extrabold">Bandingkan produk</h1><BandingkanProduk /></section>;
}
