import { NextResponse } from "next/server";
import { ambilProdukDenganId } from "@/lib/server-data";

export async function GET(request) {
  const ids = request.nextUrl.searchParams.getAll("id");

  try {
    const products = await ambilProdukDenganId(ids);
    return NextResponse.json(products, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
