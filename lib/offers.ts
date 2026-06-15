import Papa from "papaparse";

export type Offer = {
  id: string;
  loja: string;
  categoria: string;
  titulo: string;
  preco: string;
  preco_normal: string;
  desconto_percentual: string;
  cupom: string;
  link_afiliado: string;
  image_url: string;
  status_global: string;
  link_status: string;
  data_encontrada: string;
};

export async function getOffers(): Promise<Offer[]> {
  const url = process.env.PROMOPIZA_SHEET_CSV_URL;

  if (!url) return [];

  let csv = "";
  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    csv = await response.text();
  } catch {
    return [];
  }

  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data || [];

  return rows
    .map((row) => ({
      id: row.id?.trim() || "",
      loja: row.loja?.trim() || "",
      categoria: row.categoria?.trim() || "",
      titulo: row.titulo?.trim() || "",
      preco: row.preco?.trim() || "",
      preco_normal: row.preco_normal?.trim() || "",
      desconto_percentual: row.desconto_percentual?.trim() || "",
      cupom: row.cupom?.trim() || "",
      link_afiliado: row.link_afiliado?.trim() || "",
      image_url: row.image_url?.trim() || "",
      status_global: row.status_global?.trim() || "",
      link_status: row.link_status?.trim() || "",
      data_encontrada: row.data_encontrada?.trim() || "",
    }))
    .filter((offer) => {
      return (
        offer.id &&
        offer.titulo &&
        offer.link_afiliado &&
        offer.status_global.toLowerCase() === "ativo" &&
        offer.link_status.toLowerCase() === "valido"
      );
    })
    .sort((a, b) => {
      const dataA = new Date(a.data_encontrada || 0).getTime();
      const dataB = new Date(b.data_encontrada || 0).getTime();
      if (dataB !== dataA) return dataB - dataA;
      return numero(b.desconto_percentual) - numero(a.desconto_percentual);
    });
  // sem corte aqui: o /api/card e o /go precisam enxergar TODAS as ofertas ativas.
  // Limites de exibição são responsabilidade de cada página.
}

export function numero(value: string) {
  const n = Number(String(value || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function formatPrice(value: string) {
  const number = numero(value);
  if (number <= 0) return "";
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function capitalizar(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_PROMOPIZA_WHATSAPP_URL ||
  "https://whatsapp.com/channel/0029Vb8QUIx0AgWApxc17N2s";

/** Ofertas de demonstração — usadas só quando a planilha está vazia */
export const MOCK_OFFERS: Offer[] = [
  {
    id: "mock-1",
    loja: "Shopee",
    categoria: "Áudio",
    titulo: "Fone Bluetooth TWS com Cancelamento de Ruído",
    preco: "89.90",
    preco_normal: "179.90",
    desconto_percentual: "50",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
  {
    id: "mock-2",
    loja: "Amazon",
    categoria: "Casa",
    titulo: "Air Fryer 4L Digital Antiaderente",
    preco: "249.90",
    preco_normal: "429.90",
    desconto_percentual: "42",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
  {
    id: "mock-3",
    loja: "Magalu",
    categoria: "Informática",
    titulo: "SSD NVMe 1TB Leitura 3500MB/s",
    preco: "319.90",
    preco_normal: "549.90",
    desconto_percentual: "42",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
  {
    id: "mock-4",
    loja: "Shopee",
    categoria: "Gamer",
    titulo: "Mouse Gamer RGB 12800 DPI",
    preco: "79.90",
    preco_normal: "149.90",
    desconto_percentual: "47",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
  {
    id: "mock-5",
    loja: "Amazon",
    categoria: "Smart Home",
    titulo: "Lâmpada Inteligente WiFi RGB",
    preco: "34.90",
    preco_normal: "69.90",
    desconto_percentual: "50",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
  {
    id: "mock-6",
    loja: "Magalu",
    categoria: "Ferramentas",
    titulo: "Parafusadeira e Furadeira sem Fio 12V",
    preco: "159.90",
    preco_normal: "289.90",
    desconto_percentual: "45",
    cupom: "",
    link_afiliado: "#",
    image_url: "",
    status_global: "ativo",
    link_status: "valido",
    data_encontrada: "",
  },
];
