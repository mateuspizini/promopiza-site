import { after, NextResponse } from "next/server";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

type Offer = {
  id: string;
  loja: string;
  categoria: string;
  titulo: string;
  link_afiliado: string;
  status_global: string;
  link_status: string;
};

async function getOfferById(id: string): Promise<Offer | null> {
  const url = process.env.PROMOPIZA_SHEET_CSV_URL;

  if (!url) return null;

  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  const csv = await response.text();

  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data || [];

  const offer = rows
    .map((row) => ({
      id: row.id?.trim() || "",
      loja: row.loja?.trim() || "",
      categoria: row.categoria?.trim() || "",
      titulo: row.titulo?.trim() || "",
      link_afiliado: row.link_afiliado?.trim() || "",
      status_global: row.status_global?.trim() || "",
      link_status: row.link_status?.trim() || "",
    }))
    .find((item) => item.id === id);

  if (!offer) return null;

  if (
    offer.status_global.toLowerCase() !== "ativo" ||
    offer.link_status.toLowerCase() !== "valido" ||
    !offer.link_afiliado
  ) {
    return null;
  }

  return offer;
}

function registrarClique(offer: Offer, canal: string) {
  const webhook = process.env.PROMOPIZA_CLICK_WEBHOOK_URL;

  const payload = {
    ts: new Date().toISOString(),
    id: offer.id,
    canal,
    loja: offer.loja,
    categoria: offer.categoria,
    titulo: offer.titulo,
  };

  if (!webhook) {
    console.log("clique (sem webhook configurado):", JSON.stringify(payload));
    return;
  }

  // fire-and-forget após a resposta — não atrasa o redirect
  after(async () => {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error("erro ao registrar clique:", err);
    }
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);

  const canal =
    new URL(request.url).searchParams.get("canal")?.slice(0, 30) || "site";

  const offer = await getOfferById(decodedId);

  if (!offer) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // bots e crawlers de preview (Facebook, WhatsApp, Telegram...) não contam como clique
  const ua = request.headers.get("user-agent") || "";
  const ehBot =
    /facebookexternalhit|meta-externalagent|facebookcatalog|whatsapp|telegrambot|twitterbot|pinterest|googlebot|bingbot|applebot|duckduckbot|linkedinbot|discordbot|slackbot|vercel-screenshot|bot|crawler|spider|preview/i.test(
      ua
    );

  if (!ehBot) {
    registrarClique(offer, canal);
  }

  return NextResponse.redirect(offer.link_afiliado, 302);
}
