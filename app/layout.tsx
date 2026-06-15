import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./landing.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Promopiza — Ofertas farejadas pela capivara 🐾",
    template: "%s | Promopiza",
  },
  description:
    "Achados e promoções de Shopee, Amazon e Magalu selecionados todos os dias: casa, tecnologia, ferramentas e dia a dia.",
  openGraph: {
    title: "Promopiza — Ofertas farejadas pela capivara",
    description:
      "Achados e promoções selecionados todos os dias: casa, tecnologia, ferramentas e dia a dia.",
    type: "website",
    locale: "pt_BR",
    siteName: "Promopiza",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
