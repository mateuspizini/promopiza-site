import Papa from "papaparse";

export const revalidate = 300;

type Clique = {
  ts: string;
  id: string;
  canal: string;
  loja: string;
  categoria: string;
  titulo: string;
  ua: string;
};

function ehBot(ua: string): boolean {
  if (!ua || ua.length < 20) return true;
  return /bot|crawler|spider|preview|scraper|fetch|monitor|uptime|lighthouse|gtmetrix|pingdom|headless|phantom|electron|facebookexternalhit|meta-externalagent|facebookcatalog|whatsapp|telegram|twitter|pinterest|google|bing|yandex|baidu|applebot|duckduck|linkedin|discord|slack|vercel|python-requests|axios|node-fetch|go-http-client|libwww|java\/|curl|wget|postman|insomnia/i.test(
    ua
  );
}

function contar(rows: Clique[], chave: keyof Clique): [string, number][] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = (r[chave] || "(vazio)").toString().trim() || "(vazio)";
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Barras({ dados, cor }: { dados: [string, number][]; cor: string }) {
  const max = Math.max(1, ...dados.map((d) => d[1]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {dados.map(([nome, n]) => (
        <div key={nome} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 130, fontSize: 14, color: "#5f3f28", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nome}
          </div>
          <div style={{ flex: 1, background: "#efe6d6", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${(n / max) * 100}%`, background: cor, height: 22, borderRadius: 6, minWidth: 2 }} />
          </div>
          <div style={{ width: 44, fontSize: 14, fontWeight: 700, color: "#2e2218" }}>{n}</div>
        </div>
      ))}
    </div>
  );
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const chaveCerta = process.env.PROMOPIZA_METRICS_KEY;
  if (chaveCerta && sp.key !== chaveCerta) {
    return (
      <main style={{ maxWidth: 600, margin: "80px auto", padding: 24, fontFamily: "system-ui", color: "#2e2218" }}>
        <h1>Acesso restrito</h1>
        <p>Adicione <code>?key=SUA_CHAVE</code> na URL.</p>
      </main>
    );
  }

  const url = process.env.PROMOPIZA_CLIQUES_CSV_URL;
  if (!url) {
    return (
      <main style={{ maxWidth: 700, margin: "60px auto", padding: 24, fontFamily: "system-ui", color: "#2e2218" }}>
        <h1>Painel de cliques</h1>
        <p>Configure a variavel <code>PROMOPIZA_CLIQUES_CSV_URL</code> (aba Cliques publicada como CSV) para ver os dados.</p>
      </main>
    );
  }

  let rows: Clique[] = [];
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const csv = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
    rows = (parsed.data || []).map((r) => ({
      ts: r.ts || "",
      id: r.id || "",
      canal: r.canal || "",
      loja: r.loja || "",
      categoria: r.categoria || "",
      titulo: r.titulo || "",
      ua: r.ua || "",
    })).filter((r) => r.id || r.canal);
  } catch {
    rows = [];
  }

  const total = rows.length;
  const semUa = rows.filter((r) => !r.ua).length;
  const comUa = rows.filter((r) => r.ua);
  const bots = comUa.filter((r) => ehBot(r.ua)).length;
  const humanos = comUa.filter((r) => !ehBot(r.ua)).length;

  const porCanal = contar(rows, "canal");
  const porLoja = contar(rows, "loja");

  // por dia (ultimos 14)
  const porDiaMap = new Map<string, number>();
  for (const r of rows) {
    const dia = (r.ts || "").slice(0, 10);
    if (dia) porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + 1);
  }
  const porDia = [...porDiaMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14);

  const recentes = [...rows].sort((a, b) => (b.ts || "").localeCompare(a.ts || "")).slice(0, 30);

  const card = { background: "#fffdf8", borderRadius: 14, padding: "18px 20px", boxShadow: "0 6px 18px rgba(94,63,40,0.08)" } as const;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24, fontFamily: "system-ui", color: "#2e2218", background: "#f7efe2", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#5f3f28", marginBottom: 4 }}>Painel de cliques</h1>
      <p style={{ color: "#8b5e3c", marginBottom: 24 }}>Cliques registrados pelo redirect /go (humano vs bot estimado pelo User-Agent).</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        <div style={card}><div style={{ fontSize: 13, color: "#8b5e3c" }}>Total</div><div style={{ fontSize: 30, fontWeight: 900 }}>{total}</div></div>
        <div style={card}><div style={{ fontSize: 13, color: "#8b5e3c" }}>Humanos (estim.)</div><div style={{ fontSize: 30, fontWeight: 900, color: "#5a6e4a" }}>{humanos}</div></div>
        <div style={card}><div style={{ fontSize: 13, color: "#8b5e3c" }}>Bots (estim.)</div><div style={{ fontSize: 30, fontWeight: 900, color: "#c45a2a" }}>{bots}</div></div>
        <div style={card}><div style={{ fontSize: 13, color: "#8b5e3c" }}>Sem UA (dados antigos)</div><div style={{ fontSize: 30, fontWeight: 900, color: "#9b8a76" }}>{semUa}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div style={card}><h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Por canal</h2><Barras dados={porCanal} cor="#8b5e3c" /></div>
        <div style={card}><h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Por loja</h2><Barras dados={porLoja} cor="#c45a2a" /></div>
      </div>

      <div style={{ ...card, marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Por dia (ultimos 14)</h2>
        <Barras dados={porDia} cor="#5a6e4a" />
      </div>

      <div style={{ ...card, marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Cliques recentes</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8b5e3c", borderBottom: "2px solid #efe6d6" }}>
                <th style={{ padding: "8px 6px" }}>Quando</th>
                <th style={{ padding: "8px 6px" }}>Canal</th>
                <th style={{ padding: "8px 6px" }}>Loja</th>
                <th style={{ padding: "8px 6px" }}>Produto</th>
                <th style={{ padding: "8px 6px" }}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((r, i) => {
                const tipo = !r.ua ? "?" : ehBot(r.ua) ? "bot" : "humano";
                const corTipo = tipo === "humano" ? "#5a6e4a" : tipo === "bot" ? "#c45a2a" : "#9b8a76";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f0e8d8" }}>
                    <td style={{ padding: "7px 6px", whiteSpace: "nowrap" }}>{r.ts.replace("T", " ").slice(0, 16)}</td>
                    <td style={{ padding: "7px 6px" }}>{r.canal}</td>
                    <td style={{ padding: "7px 6px" }}>{r.loja}</td>
                    <td style={{ padding: "7px 6px", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.titulo}</td>
                    <td style={{ padding: "7px 6px", fontWeight: 700, color: corTipo }}>{tipo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
