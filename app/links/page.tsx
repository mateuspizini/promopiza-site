import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Promopiza — Links",
  description:
    "Receba as melhores ofertas farejadas pela capivara: WhatsApp, Telegram e site.",
};

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_PROMOPIZA_WHATSAPP_URL ||
  "https://whatsapp.com/channel/0029Vb8QUIx0AgWApxc17N2s";

const TELEGRAM_URL = process.env.NEXT_PUBLIC_PROMOPIZA_TELEGRAM_URL || "";

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_PROMOPIZA_INSTAGRAM_URL || "";

type BioLink = {
  href: string;
  label: string;
  emoji: string;
  destaque?: boolean;
  externo?: boolean;
};

const links: BioLink[] = [
  {
    href: WHATSAPP_URL,
    label: "Canal no WhatsApp — ofertas em primeira mão",
    emoji: "💬",
    destaque: true,
    externo: true,
  },
  ...(TELEGRAM_URL
    ? [
        {
          href: TELEGRAM_URL,
          label: "Canal no Telegram",
          emoji: "✈️",
          externo: true,
        },
      ]
    : []),
  {
    href: "/",
    label: "Ver as ofertas de hoje",
    emoji: "🔥",
  },
  ...(INSTAGRAM_URL
    ? [
        {
          href: INSTAGRAM_URL,
          label: "Instagram",
          emoji: "📸",
          externo: true,
        },
      ]
    : []),
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-orange-50 text-zinc-900">
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/capivara-cabeca.png"
            alt="Capivara nerd do Promopiza"
            className="h-24 w-24 object-contain"
          />
        </div>

        <h1 className="mt-4 text-2xl font-black tracking-tight">Promopiza</h1>

        <p className="mt-2 text-center text-zinc-600">
          A capivara nerd que fareja as melhores ofertas da internet.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          {links.map((link) =>
            link.externo ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  link.destaque
                    ? "rounded-2xl bg-orange-500 px-5 py-4 text-center font-black text-white shadow-sm transition hover:bg-orange-600"
                    : "rounded-2xl bg-white px-5 py-4 text-center font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                }
              >
                {link.emoji} {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl bg-white px-5 py-4 text-center font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {link.emoji} {link.label}
              </Link>
            )
          )}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-500">
          O Promopiza pode receber comissão por compras feitas pelos links. Isso
          não altera o preço para você.
        </p>
      </section>
    </main>
  );
}
