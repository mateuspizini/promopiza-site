import LandingClient from "./components/LandingClient";
import { getOffers, MOCK_OFFERS } from "../lib/offers";

export default async function Home() {
  const reais = await getOffers();

  // getOffers ja retorna ordenado por data_encontrada (mais recentes primeiro).
  // A home mostra as 9 ofertas mais recentes. Mock so se a planilha estiver vazia.
  const usandoMock = reais.length === 0;
  const offers = usandoMock ? MOCK_OFFERS : reais.slice(0, 9);

  return <LandingClient offers={offers} usandoMock={usandoMock} />;
}
