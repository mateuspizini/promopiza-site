import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade do Promopiza.",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-orange-50 text-zinc-900">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
          <Link href="/">← Promopiza</Link>
        </p>

        <h1 className="text-3xl font-black tracking-tight">
          Política de Privacidade
        </h1>

        <div className="mt-6 space-y-5 leading-relaxed text-zinc-700">
          <p>
            O Promopiza (www.promopiza.online) é um site de divulgação de
            ofertas e promoções de lojas parceiras, como Shopee, Amazon e
            Magalu. Esta página explica, de forma direta, quais dados tratamos.
          </p>

          <h2 className="text-xl font-black text-zinc-900">
            O que coletamos
          </h2>
          <p>
            Não exigimos cadastro e não coletamos dados pessoais como nome,
            e-mail, CPF ou endereço. Ao clicar em uma oferta, registramos de
            forma anônima e agregada: o identificador da oferta clicada, o
            canal de origem do clique (por exemplo, site, WhatsApp ou
            Telegram), a loja, a categoria do produto e a data e hora. Esses
            dados não identificam você e são usados apenas para entender quais
            ofertas são mais úteis para a audiência.
          </p>

          <h2 className="text-xl font-black text-zinc-900">
            Cookies e armazenamento local
          </h2>
          <p>
            Não usamos cookies de rastreamento próprios. Utilizamos apenas o
            armazenamento local do navegador para lembrar sua preferência de
            tema (claro ou escuro). As lojas parceiras, ao receberem seu
            clique, podem aplicar os próprios cookies conforme as políticas de
            privacidade delas.
          </p>

          <h2 className="text-xl font-black text-zinc-900">
            Links de afiliado
          </h2>
          <p>
            Os links do Promopiza podem ser links de afiliado: ao comprar por
            eles, podemos receber uma comissão da loja, sem nenhum custo
            adicional para você. O preço é o mesmo.
          </p>

          <h2 className="text-xl font-black text-zinc-900">
            Serviços de terceiros
          </h2>
          <p>
            O site é hospedado na Vercel e publica conteúdo em redes sociais
            (WhatsApp, Telegram, Instagram, Facebook e Pinterest). Cada
            plataforma trata seus dados conforme a própria política de
            privacidade.
          </p>

          <h2 className="text-xl font-black text-zinc-900">Contato</h2>
          <p>
            Dúvidas sobre esta política? Fale com a gente:{" "}
            <a
              href="mailto:promopiza@gmail.com"
              className="font-bold text-orange-600 underline"
            >
              promopiza@gmail.com
            </a>
            .
          </p>

          <p className="text-sm text-zinc-500">
            Última atualização: junho de 2026.
          </p>
        </div>
      </section>
    </main>
  );
}
