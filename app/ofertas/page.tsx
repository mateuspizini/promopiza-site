import type { Metadata } from "next";
import Link from "next/link";
import {
  getOffers,
  formatPrice,
  capitalizar,
  numero,
  WHATSAPP_URL,
  type Offer,
} from "../../lib/offers";

export const metadata: Metadata = {
  title: "Todas as ofertas",
  description:
    "Todas as promoções ativas farejadas pela capivara: Shopee, Amazon e Magalu com desconto de verdade.",
};

function topValores(offers: Offer[], campo: "categoria" | "loja", max: number) {
  const contagem = new Map<string, number>();
  for (const offer of offers) {
    const valor = offer[campo].toLowerCase();
    if (!valor) continue;
    contagem.set(valor, (contagem.get(valor) || 0) + 1);
  }
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([valor]) => valor);
}

function buildHref(cat: string, loja: string) {
  const params = new URLSearchParams();
  if (cat) params.set("cat", cat);
  if (loja) params.set("loja", loja);
  const qs = params.toString();
  return qs ? `/ofertas?${qs}` : "/ofertas";
}

export default async function OfertasPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; loja?: string }>;
}) {
  const { cat = "", loja = "" } = await searchParams;
  const catAtiva = cat.toLowerCase();
  const lojaAtiva = loja.toLowerCase();

  const todas = await getOffers();

  const categorias = topValores(todas, "categoria", 8);
  const lojas = topValores(todas, "loja", 5);

  const offers = todas
    .filter((offer) => {
      if (catAtiva && offer.categoria.toLowerCase() !== catAtiva) return false;
      if (lojaAtiva && offer.loja.toLowerCase() !== lojaAtiva) return false;
      return true;
    })
    .slice(0, 200);

  return (
    <main className="min-h-screen bg-orange-50 text-zinc-900">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
                <Link href="/">← Promopiza</Link>
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Todas as ofertas 🐾
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-600">
                Tudo que a capivara farejou e ainda está valendo. Os preços
                podem mudar a qualquer momento.
              </p>
            </div>

            <Link
              href="/links"
              className="hidden shrink-0 rounded-2xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-200 sm:block"
            >
              Nossos canais
            </Link>
          </div>
        </header>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 block rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-sm transition hover:shadow-md"
        >
          <p className="text-lg font-black">
            💬 Receba as ofertas em primeira mão no WhatsApp
          </p>
          <p className="mt-1 text-sm text-green-50">
            As melhores promoções chegam no canal antes de aparecerem aqui.
            Toque para entrar — é grátis.
          </p>
        </a>

        {(categorias.length > 1 || lojas.length > 1) && (
          <nav className="mb-6 flex flex-wrap items-center gap-2">
            <Link
              href={buildHref("", lojaAtiva)}
              className={
                !catAtiva
                  ? "rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold text-white"
                  : "rounded-full bg-white px-4 py-1.5 text-sm font-bold text-zinc-600 shadow-sm hover:bg-orange-100"
              }
            >
              Tudo
            </Link>

            {categorias.map((categoria) => (
              <Link
                key={categoria}
                href={buildHref(
                  catAtiva === categoria ? "" : categoria,
                  lojaAtiva
                )}
                className={
                  catAtiva === categoria
                    ? "rounded-full bg-orange-500 px-4 py-1.5 text-sm font-bold text-white"
                    : "rounded-full bg-white px-4 py-1.5 text-sm font-bold text-zinc-600 shadow-sm hover:bg-orange-100"
                }
              >
                {capitalizar(categoria)}
              </Link>
            ))}

            <span className="mx-1 hidden text-zinc-300 sm:inline">|</span>

            {lojas.map((nomeLoja) => (
              <Link
                key={nomeLoja}
                href={buildHref(
                  catAtiva,
                  lojaAtiva === nomeLoja ? "" : nomeLoja
                )}
                className={
                  lojaAtiva === nomeLoja
                    ? "rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-bold text-white"
                    : "rounded-full bg-white px-4 py-1.5 text-sm font-bold text-zinc-500 shadow-sm hover:bg-zinc-100"
                }
              >
                {capitalizar(nomeLoja)}
              </Link>
            ))}
          </nav>
        )}

        {offers.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Nenhuma oferta ativa agora.</h2>
            <p className="mt-2 text-zinc-600">
              {catAtiva || lojaAtiva ? (
                <Link
                  href="/ofertas"
                  className="font-bold text-orange-600 underline"
                >
                  Limpar filtros e ver tudo
                </Link>
              ) : (
                "Volte em breve para novas promoções."
              )}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const preco = formatPrice(offer.preco);
              const precoNormal = formatPrice(offer.preco_normal);
              const economia =
                numero(offer.preco_normal) > numero(offer.preco)
                  ? formatPrice(
                      String(numero(offer.preco_normal) - numero(offer.preco))
                    )
                  : "";

              return (
                <article
                  key={offer.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-zinc-100">
                    {offer.desconto_percentual && (
                      <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white">
                        -{offer.desconto_percentual}%
                      </span>
                    )}

                    {offer.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.image_url}
                        alt={offer.titulo}
                        loading="lazy"
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="p-6 text-center text-5xl">🐾</div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {capitalizar(offer.loja) || "Oferta"}
                      </span>

                      {offer.categoria && (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
                          {capitalizar(offer.categoria)}
                        </span>
                      )}
                    </div>

                    <h2 className="line-clamp-3 min-h-[4.5rem] text-base font-bold">
                      {offer.titulo}
                    </h2>

                    <div className="mt-4">
                      {precoNormal && (
                        <p className="text-sm text-zinc-400 line-through">
                          {precoNormal}
                        </p>
                      )}

                      <p className="text-2xl font-black text-orange-600">
                        {preco || "Ver preço"}
                      </p>

                      {economia && (
                        <p className="text-xs font-bold text-green-700">
                          Você economiza {economia}
                        </p>
                      )}
                    </div>

                    {offer.cupom && offer.cupom.toUpperCase() !== "SEM CUPOM" && (
                      <p className="mt-3 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-center text-sm font-black text-orange-700">
                        🎟️ Cupom: {offer.cupom}
                      </p>
                    )}

                    <a
                      href={`/go/${encodeURIComponent(offer.id)}?canal=site`}
                      className="mt-5 block rounded-2xl bg-orange-500 px-4 py-3 text-center font-black text-white transition hover:bg-orange-600"
                    >
                      Ver oferta{offer.loja ? ` na ${capitalizar(offer.loja)}` : ""}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="mt-10 rounded-3xl bg-white p-5 text-sm text-zinc-500 shadow-sm">
          <p>
            O Promopiza pode receber comissão por compras feitas pelos links.
            Isso não altera o preço para você.
          </p>
          <p className="mt-2">
            <Link href="/links" className="font-bold text-orange-600">
              Siga nossos canais →
            </Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
