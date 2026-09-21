// De kleurvingerafdruk achter een naam.
//
// Een balk met de verhouding en bolletjes met de volgorde. Je herkent iemand
// aan zijn streep voordat je zijn naam leest -- dat is waar dit voor is.
//
// De balk verschijnt alleen als de verhouding gemeten is. Kent het profiel
// alleen een volgorde, dan staan er bolletjes en geen balk: een verhouding
// verzinnen uit "blauw voor groen" suggereert een precisie die er niet is.
//
// aria-hidden op het beeld, met de volgorde in woorden ernaast. Een rij
// gekleurde blokjes zegt niets zonder ogen; de volgorde uitgeschreven wel, en
// dat is precies de informatie die de afdruk draagt.

import { maakVingerafdruk, bolletjes, omschrijf } from "../../lib/app/vingerafdruk";

export default function Vingerafdruk({ kleuren, naam = "", klein = false }) {
  const afdruk = maakVingerafdruk(kleuren);
  if (!afdruk) return null;
  const bollen = bolletjes(afdruk);

  return <span className="tk-afdruk" data-klein={klein ? "ja" : undefined}>
    <span className="tk-verborgen">{omschrijf(afdruk, naam)}</span>
    <span aria-hidden="true">
      {afdruk.balk.length > 0 && <span className="tk-afdruk-balk">
        {afdruk.balk.map((deel) => (
          <span key={deel.id} style={{ width: `${deel.deel * 100}%`, background: deel.kleur }} />
        ))}
      </span>}
      <span className="tk-afdruk-bollen">
        {bollen.map((bol, i) => (
          <span
            key={bol.id}
            // color erbij voor de niet-gemeten bolletjes: die zijn een ring in
            // currentColor. Zonder dit werd de ring de tekstkleur en zag je
            // niet meer welke kleur het was.
            style={{ background: bol.kleur, color: bol.kleur }}
            // Zonder gemeten verhouding is de volgorde na de eerste twee niet
            // gemeten maar de vaste kleurvolgorde. Die twee zien er anders uit
            // dan de rest, zodat het beeld niet meer belooft dan het weet.
            data-gemeten={afdruk.nauwkeurig || i < 2 ? "ja" : "nee"}
          />
        ))}
      </span>
    </span>
  </span>;
}
