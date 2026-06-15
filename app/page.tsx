import LandingClient from "./components/LandingClient";
import { getOffers, MOCK_OFFERS, numero } from "../lib/offers";

export default async function Home() {
  const reais = await getOffers();

  // landing mostra as melhores; mock só se a planilha estiver vazia
  const usandoMock = reais.length === 0;
  const offers = usandoMock
    ? MOCK_OFFERS
    : [...reais]
        .sort((a, b) => numero(b.desconto_percentual) - numero(a.desconto_percentual))
        .slice(0, 9);

  return <LandingClient offers={offers} usandoMock={usandoMock} />;
}
