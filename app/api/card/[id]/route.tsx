import { ImageResponse } from "next/og";
import { getOffers, formatPrice, numero, capitalizar } from "../../../../lib/offers";

export const revalidate = 1800;

/* fontes (woff é suportado pelo Satori; jsDelivr com versão pinada = estável) */
const FONTE_900 =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-900-normal.woff";
const FONTE_700 =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff";

let fontesCache: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;

function carregarFontes() {
  if (!fontesCache) {
    fontesCache = Promise.all([
      fetch(FONTE_900).then((r) => r.arrayBuffer()),
      fetch(FONTE_700).then((r) => r.arrayBuffer()),
    ]);
  }
  return fontesCache;
}

const CORES = {
  creme: "#f7efe2",
  card: "#fffdf8",
  terracota: "#c45a2a",
  capivara: "#8b5e3c",
  capivaraEscuro: "#5f3f28",
  verde: "#5a6e4a",
  tinta: "#2e2218",
};

/* Satori (next/og) não decodifica WebP — só PNG/JPEG/GIF/SVG.
   Imagens do Mercado Livre (mlstatic) chegam como .webp e saem em branco no card.
   O mlstatic serve a mesma imagem em .jpg, então trocamos a extensão. */
function normalizarImagem(url?: string): string | undefined {
  if (!url) return url;
  return url.replace(/\.webp(\?.*)?$/i, ".jpg$1");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);

  const reqUrl = new URL(request.url);
  const formato = reqUrl.searchParams.get("f");
  const story = formato === "story";
  const pin = formato === "pin";
  const tall = story || pin;

  const offers = await getOffers();
  const offer = offers.find((o) => o.id === decodedId);

  if (!offer) {
    return new Response("Oferta não encontrada", { status: 404 });
  }

  const [f900, f700] = await carregarFontes();

  const origem = reqUrl.origin;
  const imagemProduto = normalizarImagem(offer.image_url);
  const preco = formatPrice(offer.preco) || "Ver preço";
  const precoNormal = formatPrice(offer.preco_normal);
  const desconto = Math.round(numero(offer.desconto_percentual));
  const temCupom =
    offer.cupom && offer.cupom.trim().toUpperCase() !== "SEM CUPOM";
  const titulo =
    offer.titulo.length > 90 ? offer.titulo.slice(0, 88) + "…" : offer.titulo;

  const W = pin ? 1000 : 1080;
  const H = pin ? 1500 : story ? 1920 : 1080;
  const padX = 48;
  const padTop = pin ? 64 : story ? 230 : 48;
  const padBottom = pin ? 64 : story ? 230 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          backgroundColor: CORES.creme,
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padTop,
          paddingBottom: padBottom,
          fontFamily: "Inter",
          color: CORES.tinta,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${origem}/capivara-cabeca.png`}
              width={tall ? 110 : 88}
              height={tall ? 110 : 88}
              alt=""
            />
            <div
              style={{
                display: "flex",
                fontSize: tall ? 56 : 46,
                fontWeight: 900,
                color: CORES.capivaraEscuro,
              }}
            >
              PROMOPIZA
            </div>
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: CORES.capivara,
              color: "#fff",
              fontSize: tall ? 36 : 30,
              fontWeight: 700,
              padding: "10px 28px",
              borderRadius: 999,
            }}
          >
            {capitalizar(offer.loja) || "Oferta"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: tall ? 56 : 36,
            marginBottom: tall ? 56 : 36,
            backgroundColor: CORES.card,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 16px 40px rgba(94,63,40,0.18)",
          }}
        >
          {imagemProduto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagemProduto}
              width={tall ? 640 : 460}
              height={tall ? 640 : 460}
              style={{ objectFit: "contain" }}
              alt=""
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${origem}/capivara-cabeca.png`}
              width={300}
              height={300}
              alt=""
            />
          )}

          {desconto > 0 && (
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 32,
                right: 32,
                backgroundColor: CORES.verde,
                color: "#fff",
                fontSize: tall ? 68 : 56,
                fontWeight: 900,
                padding: "18px 36px",
                borderRadius: 999,
              }}
            >
              -{desconto}%
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: tall ? 54 : 44,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 28,
            marginTop: tall ? 36 : 24,
          }}
        >
          {precoNormal && (
            <div
              style={{
                display: "flex",
                fontSize: tall ? 52 : 44,
                fontWeight: 700,
                color: "#9b8a76",
                textDecoration: "line-through",
              }}
            >
              {precoNormal}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: tall ? 116 : 96,
              fontWeight: 900,
              color: CORES.terracota,
              lineHeight: 1,
            }}
          >
            {preco}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: tall ? 44 : 28,
          }}
        >
          {temCupom ? (
            <div
              style={{
                display: "flex",
                border: `4px dashed ${CORES.terracota}`,
                color: CORES.terracota,
                fontSize: tall ? 42 : 36,
                fontWeight: 900,
                padding: "12px 30px",
                borderRadius: 20,
                backgroundColor: "#fff6ec",
              }}
            >
              CUPOM: {offer.cupom.toUpperCase()}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div
            style={{
              display: "flex",
              fontSize: tall ? 40 : 34,
              fontWeight: 700,
              color: CORES.capivaraEscuro,
            }}
          >
            promopiza.online
          </div>
        </div>

        {story && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 56,
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: CORES.terracota,
                color: "#fff",
                fontSize: 44,
                fontWeight: 900,
                padding: "22px 56px",
                borderRadius: 999,
              }}
            >
              Link na bio → promopiza.online
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Inter", data: f900, weight: 900 },
        { name: "Inter", data: f700, weight: 700 },
      ],
    }
  );
}
