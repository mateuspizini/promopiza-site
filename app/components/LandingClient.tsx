"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Offer } from "../../lib/offers";
import { formatPrice, capitalizar, WHATSAPP_URL } from "../../lib/offers";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  offers: Offer[];
  usandoMock: boolean;
};

/* ============ Capivara oficial (pixel art animada por sprite) ============ */

function CapivaraHero() {
  return (
    <div className="pz-capivara-hero">
      <div
        className="pz-sprite pz-sprite-fareja"
        role="img"
        aria-label="Capivara nerd do Promopiza farejando ofertas"
      />
    </div>
  );
}

function CapivaraAceno() {
  return (
    <div className="pz-capivara-cta pz-flutua">
      <div
        className="pz-sprite pz-sprite-acena"
        role="img"
        aria-label="Capivara do Promopiza acenando e convidando para o canal do WhatsApp"
      />
    </div>
  );
}

function CapivaraCaminhante() {
  return <div className="pz-sprite pz-sprite-anda" aria-hidden="true" />;
}

/* ============ Carregador de scripts CDN ============ */

const carregados: Record<string, Promise<void>> = {};

function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!carregados[src]) {
    carregados[src] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
      document.head.appendChild(s);
    });
  }
  return carregados[src];
}

/* ============ Lagoa em Three.js (shader leve) ============ */

const FRAG = `
precision mediump float;
uniform float uTime;
uniform vec2 uMouse;
uniform float uForca;
uniform vec3 uCorA;
uniform vec3 uCorB;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);

  float t = uTime * 0.14;
  float n = noise(uv * 3.0 * asp + vec2(t, -t * 0.6));
  n += 0.5 * noise(uv * 6.0 * asp + vec2(-t * 1.3, t));
  n /= 1.5;

  // ondulação do cursor
  float d = distance(uv * asp, uMouse * asp);
  float ripple = sin(d * 34.0 - uTime * 3.2) * exp(-d * 7.0) * uForca;
  n += ripple * 0.32;

  vec3 cor = mix(uCorA, uCorB, smoothstep(0.28, 0.78, n));
  // brilho suave nas cristas
  cor += smoothstep(0.72, 0.95, n) * 0.06;

  gl_FragColor = vec4(cor, 1.0);
}
`;

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

function hexParaVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ============ Componente principal ============ */

export default function LandingClient({ offers, usandoMock }: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caminhanteRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState(true);
  const [escuro, setEscuro] = useState(false);

  /* tema */
  useEffect(() => {
    const salvo = window.localStorage.getItem("pz-tema");
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const ativo = salvo ? salvo === "escuro" : prefereEscuro;
    setEscuro(ativo);
    document.documentElement.classList.toggle("pz-dark", ativo);
  }, []);

  function alternarTema() {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle("pz-dark", novo);
    window.localStorage.setItem("pz-tema", novo ? "escuro" : "claro");
  }

  /* animações + lagoa */
  useEffect(() => {
    const root = raiz.current;
    if (!root) return;

    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // checa WebGL antes de tudo
    let temWebgl = false;
    try {
      const c = document.createElement("canvas");
      temWebgl = !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch {
      temWebgl = false;
    }
    if (!temWebgl || reduz) setWebglOk(false);

    if (reduz) return; // conteúdo estático, tudo visível

    let vivo = true;
    let lenis: any = null;
    let renderer: any = null;
    let raf = 0;
    const limpadores: Array<() => void> = [];

    /* --- a capivara se inclina em direção ao cursor --- */
    const cabeca = root.querySelector<HTMLElement>(".pz-capivara-hero .pz-sprite");
    if (cabeca) {
      let alvoX = 0;
      let alvoY = 0;
      let atualX = 0;
      let atualY = 0;
      const aoMover = (e: MouseEvent) => {
        const r = cabeca.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        alvoX = Math.max(-1, Math.min(1, (e.clientX - cx) / 400));
        alvoY = Math.max(-1, Math.min(1, (e.clientY - cy) / 400));
      };
      let rafNariz = 0;
      const anima = () => {
        atualX += (alvoX - atualX) * 0.08;
        atualY += (alvoY - atualY) * 0.08;
        cabeca.style.transform = `rotate(${atualX * 3.5}deg) translate(${atualX * 6}px, ${atualY * 4}px)`;
        rafNariz = requestAnimationFrame(anima);
      };
      window.addEventListener("mousemove", aoMover);
      rafNariz = requestAnimationFrame(anima);
      limpadores.push(() => {
        window.removeEventListener("mousemove", aoMover);
        cancelAnimationFrame(rafNariz);
      });
    }

    /* --- scripts pesados --- */
    const promessas = [
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js").then(() =>
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js")
      ),
      loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js").catch(() => {}),
      temWebgl
        ? loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.147.0/three.min.js").catch(() => {
            setWebglOk(false);
          })
        : Promise.resolve(),
    ];

    Promise.all(promessas)
      .then(() => {
        if (!vivo) return;
        const w = window as any;
        const gsap = w.gsap;
        const ScrollTrigger = w.ScrollTrigger;
        if (!gsap || !ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        /* Lenis + ScrollTrigger */
        if (w.Lenis) {
          lenis = new w.Lenis({ lerp: 0.11, smoothWheel: true });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time: number) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
          limpadores.push(() => lenis?.destroy());
        }

        /* liga estados iniciais de animação só agora (sem JS, tudo fica visível) */
        root.classList.add("pz-anim");

        /* hero: cena de abertura */
        gsap.fromTo(
          ".pz-capivara-hero",
          { scale: 0.82, y: 36, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.9, ease: "back.out(1.5)" }
        );
        gsap.fromTo(
          ".pz-hero .pz-entra",
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power3.out", delay: 0.18 }
        );

        /* elementos que entram por seção */
        root.querySelectorAll<HTMLElement>(".pz-secao:not(.pz-hero) .pz-entra").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 34, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 86%" },
            }
          );
        });

        /* cards em stagger */
        ScrollTrigger.batch(".pz-card-oferta", {
          start: "top 90%",
          onEnter: (lote: Element[]) => {
            gsap.fromTo(
              lote,
              { y: 44, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: "power3.out" }
            );
            // risca o preço antigo logo depois que o card aparece
            lote.forEach((card) => {
              const preco = card.querySelector(".pz-preco-antigo");
              if (preco) {
                gsap.to(preco, { "--risco": 1, duration: 0.5, delay: 0.45, ease: "power2.inOut" });
              }
            });
          },
        });

        /* transição de cor de fundo por capítulo (CSS faz o fade) */
        const capitulos: Array<[string, string]> = [
          [".pz-hero", "var(--pz-bg-hero)"],
          ["#como", "var(--pz-bg-como)"],
          ["#ofertas", "var(--pz-bg-ofertas)"],
          ["#canal", "var(--pz-bg-cta)"],
        ];
        capitulos.forEach(([sel, cor]) => {
          ScrollTrigger.create({
            trigger: sel,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (st: any) => {
              if (st.isActive) root.style.backgroundColor = cor;
            },
          });
        });

        /* capivara caminha pela página conforme o scroll */
        if (caminhanteRef.current && window.innerWidth >= 640) {
          gsap.fromTo(
            caminhanteRef.current,
            { x: -90 },
            {
              x: () => window.innerWidth + 90,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self: any) => {
                  // scroll pra cima: capivara vira e "volta"
                  caminhanteRef.current?.classList.toggle("pz-voltando", self.direction === -1);
                },
              },
            }
          );
        } else if (caminhanteRef.current) {
          caminhanteRef.current.style.display = "none";
        }

        limpadores.push(() => {
          ScrollTrigger.getAll().forEach((st: any) => st.kill());
        });

        /* --- lagoa Three.js --- */
        const THREE = w.THREE;
        const canvas = canvasRef.current;
        if (THREE && canvas && temWebgl) {
          try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
            const dprMax = window.innerWidth < 768 ? 1 : 1.5;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
            renderer.setSize(window.innerWidth, window.innerHeight, false);

            const cena = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

            const lerCor = (nome: string) =>
              hexParaVec3(getComputedStyle(document.documentElement).getPropertyValue(nome) || "#7fa08a");

            const uniforms = {
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector2(0.5, 0.5) },
              uForca: { value: 0 },
              uCorA: { value: new THREE.Vector3(...lerCor("--pz-lagoa")) },
              uCorB: { value: new THREE.Vector3(...lerCor("--pz-creme-2")) },
              uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            };

            const atualizaCores = () => {
              const a = lerCor("--pz-lagoa");
              const b = lerCor("--pz-creme-2");
              uniforms.uCorA.value.set(a[0], a[1], a[2]);
              uniforms.uCorB.value.set(b[0], b[1], b[2]);
            };
            const observador = new MutationObserver(atualizaCores);
            observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
            limpadores.push(() => observador.disconnect());

            const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
            cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

            let forcaAlvo = 0;
            const aoMoverLagoa = (e: MouseEvent) => {
              uniforms.uMouse.value.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
              forcaAlvo = 1;
            };
            window.addEventListener("mousemove", aoMoverLagoa, { passive: true });
            limpadores.push(() => window.removeEventListener("mousemove", aoMoverLagoa));

            const aoRedimensionar = () => {
              renderer.setSize(window.innerWidth, window.innerHeight, false);
              uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", aoRedimensionar);
            limpadores.push(() => window.removeEventListener("resize", aoRedimensionar));

            let escondido = false;
            const aoVisibilidade = () => {
              escondido = document.hidden;
            };
            document.addEventListener("visibilitychange", aoVisibilidade);
            limpadores.push(() => document.removeEventListener("visibilitychange", aoVisibilidade));

            const inicio = performance.now();
            const desenha = () => {
              if (!vivo) return;
              raf = requestAnimationFrame(desenha);
              if (escondido) return;
              uniforms.uTime.value = (performance.now() - inicio) / 1000;
              // a força do ripple decai suavemente quando o cursor para
              uniforms.uForca.value += (forcaAlvo - uniforms.uForca.value) * 0.06;
              forcaAlvo *= 0.985;
              renderer.render(cena, camera);
            };
            desenha();
          } catch {
            setWebglOk(false);
          }
        }
      })
      .catch(() => {
        /* sem scripts: página segue 100% legível */
      });

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      limpadores.forEach((fn) => fn());
      renderer?.dispose?.();
      root.classList.remove("pz-anim");
    };
  }, []);

  const cards = offers.slice(0, 9);

  return (
    <div className="pz-landing" ref={raiz}>
      {webglOk ? (
        <canvas ref={canvasRef} className="pz-lagoa-canvas" aria-hidden="true" />
      ) : (
        <div className="pz-lagoa-fallback" aria-hidden="true" />
      )}

      <header className="pz-header">
        <Link href="/" className="pz-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/capivara-cabeca.png" alt="" width={26} height={26} />
          Promopiza
        </Link>
        <div className="pz-header-acoes">
          <Link href="/ofertas" className="pz-link-header">
            Todas as ofertas
          </Link>
          <button
            type="button"
            className="pz-tema"
            onClick={alternarTema}
            aria-label={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {escuro ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="pz-conteudo">
        {/* ===== Capítulo 1: Hero ===== */}
        <section className="pz-secao pz-hero">
          <div>
            <h1 className="pz-titulo pz-entra">
              Ofertas farejadas pela capivara 🐾
            </h1>
            <p className="pz-subtitulo pz-entra">
              A capivara nerd mergulha nas promoções de Shopee, Amazon e Magalu
              todos os dias e só traz pra superfície o que vale o seu dinheiro.
            </p>
            <div className="pz-entra" style={{ marginTop: "2rem", display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "inherit" }}>
              <a href="#ofertas" className="pz-botao">
                Ver achados de hoje
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="pz-botao-secundario">
                💬 Canal no WhatsApp
              </a>
            </div>
          </div>
          <CapivaraHero />
        </section>

        {/* ===== Capítulo 2: Como a capivara fareja ===== */}
        <section className="pz-secao" id="como">
          <h2 className="pz-titulo-secao pz-entra">Como a capivara fareja 👃</h2>
          <p className="pz-subtitulo pz-entra">
            Nada de timeline infinita de “promoção” duvidosa. O faro aqui é seletivo.
          </p>
          <div className="pz-passos">
            <div className="pz-passo pz-entra">
              <span className="pz-passo-numero">1</span>
              <span className="pz-passo-emoji">🔍</span>
              <h3>Encontra</h3>
              <p>
                A capivara vasculha milhares de produtos por dia nas grandes
                lojas, atrás de desconto de verdade — não “de R$ 99 por R$ 98”.
              </p>
            </div>
            <div className="pz-passo pz-entra">
              <span className="pz-passo-numero">2</span>
              <span className="pz-passo-emoji">⚖️</span>
              <h3>Compara</h3>
              <p>
                Preço antigo, nota dos compradores, reputação do vendedor.
                Oferta suspeita não passa do focinho dela.
              </p>
            </div>
            <div className="pz-passo pz-entra">
              <span className="pz-passo-numero">3</span>
              <span className="pz-passo-emoji">📢</span>
              <h3>Avisa</h3>
              <p>
                Os melhores achados vão direto pro canal — antes de esgotar.
                Quem chega primeiro, paga menos.
              </p>
            </div>
          </div>
        </section>

        {/* ===== Capítulo 3: Ofertas ===== */}
        <section className="pz-secao" id="ofertas">
          <h2 className="pz-titulo-secao pz-entra">Achados fresquinhos 🔥</h2>
          <p className="pz-subtitulo pz-entra">
            {usandoMock
              ? "A capivara está farejando novidades agora — exemplos do que costuma aparecer:"
              : "Direto da lagoa pro seu carrinho. Preços podem mudar a qualquer momento."}
          </p>

          <div className="pz-grid-ofertas">
            {cards.map((offer) => {
              const preco = formatPrice(offer.preco);
              const precoNormal = formatPrice(offer.preco_normal);
              const href = usandoMock
                ? WHATSAPP_URL
                : `/go/${encodeURIComponent(offer.id)}?canal=site`;
              return (
                <article key={offer.id} className="pz-card-oferta">
                  <div className="pz-card-img">
                    {offer.desconto_percentual && (
                      <span className="pz-badge-desconto">-{offer.desconto_percentual}%</span>
                    )}
                    {offer.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={offer.image_url} alt={offer.titulo} loading="lazy" />
                    ) : (
                      <span className="pz-card-emoji">🐾</span>
                    )}
                  </div>
                  <div className="pz-card-corpo">
                    <span className="pz-badge-loja">{capitalizar(offer.loja) || "Oferta"}</span>
                    <h3 className="pz-card-titulo">{offer.titulo}</h3>
                    {precoNormal && <span className="pz-preco-antigo">{precoNormal}</span>}
                    <span className="pz-preco-novo">{preco || "Ver preço"}</span>
                    <div className="pz-card-botao">
                      <a
                        href={href}
                        target={usandoMock ? "_blank" : undefined}
                        rel={usandoMock ? "noopener noreferrer" : undefined}
                      >
                        Pegar oferta
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="pz-entra" style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/ofertas" className="pz-botao-secundario">
              Ver todas as ofertas →
            </Link>
          </p>
        </section>

        {/* ===== Capítulo 4: CTA ===== */}
        <section className="pz-secao pz-cta" id="canal">
          <CapivaraAceno />
          <h2 className="pz-titulo-secao pz-entra">
            Entra na lagoa com a gente 💬
          </h2>
          <p className="pz-subtitulo pz-entra" style={{ margin: "1rem auto 0" }}>
            As melhores ofertas chegam no canal do WhatsApp antes de qualquer
            lugar. É grátis, sem spam — só achado bom.
          </p>
          <div className="pz-entra" style={{ marginTop: "2rem" }}>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="pz-botao">
              Entrar no canal do WhatsApp
            </a>
          </div>
          <p className="pz-entra" style={{ marginTop: "1rem", opacity: 0.7, fontSize: "0.9rem" }}>
            Prefere outro canto da lagoa? <Link href="/links" style={{ fontWeight: 800, textDecoration: "underline" }}>Veja todos os nossos canais</Link>.
          </p>
        </section>

        <footer className="pz-rodape">
          <p>
            O Promopiza pode receber comissão por compras feitas pelos links.
            Isso não altera o preço para você.
          </p>
          <p style={{ marginTop: "0.6rem" }}>
            Feito com 🧉 pela capivara nerd · <Link href="/links" style={{ fontWeight: 700 }}>Nossos canais</Link>
          </p>
        </footer>
      </div>

      <div className="pz-caminhante" ref={caminhanteRef} aria-hidden="true">
        <CapivaraCaminhante />
      </div>
    </div>
  );
}
