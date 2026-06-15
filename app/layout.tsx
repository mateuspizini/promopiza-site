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
  metadataBase: new URL("https://promopiza.online"),
  title: {
    default: "Promopiza — Ofertas farejadas pela capivara 🐾",
    template: "%s | Promopiza",
  },
  description:
    "Achados e promoções de Shopee, Amazon, Mercado Livre e Magalu selecionados todos os dias: casa, tecnologia, ferramentas e dia a dia.",
  keywords: [
    "ofertas",
    "promoções",
    "cupons de desconto",
    "achados",
    "Shopee",
    "Amazon",
    "Mercado Livre",
    "Magalu",
    "descontos",
  ],
  applicationName: "Promopiza",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "Promopiza — Ofertas farejadas pela capivara",
    description:
      "Achados e promoções selecionados todos os dias: casa, tecnologia, ferramentas e dia a dia.",
    url: "https://promopiza.online",
    type: "website",
    locale: "pt_BR",
    siteName: "Promopiza",
    images: [{ url: "/capivara-cabeca.png", width: 512, height: 512, alt: "Promopiza" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promopiza — Ofertas farejadas pela capivara",
    description: "Achados e promoções selecionados todos os dias.",
    images: ["/capivara-cabeca.png"],
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
