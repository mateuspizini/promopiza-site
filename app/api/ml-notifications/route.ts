import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "promopiza-mercadolivre-notifications",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    console.log("Mercado Livre notification:", body);

    return NextResponse.json({
      ok: true,
      received: true,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      received: false,
    });
  }
}