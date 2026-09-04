// Mijn team: wie er in het team zitten, wat zij hebben gedeeld, en de code om
// anderen uit te nodigen.
//
// Een team is zijn mensen, dus die staan bovenaan en de rest is ondergeschikt.
// Uitnodigen is iets wat je een paar keer doet en daarna nooit meer; dat is een
// regel in de lijst die opengaat als je hem nodig hebt, geen half scherm met
// uitleg. Het team verlaten staat onderaan, stil, waar zulke dingen horen.
//
// Wat je hier ziet is uitsluitend wat teamgenoten zelf hebben gedeeld. Ook een
// beheerder ziet niets meer dan dit; er bestaat geen weg naar de profielen van
// anderen — niet in de app en niet in de database.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import {
  bewaarHandleidingvoorstel,
  bewaarVoorstel,
  haalHandleidingvoorstellen,
  haalVoorstellen,
} from "../../lib/app/voorstellen";
import { bewaarProfiellid, hernoemProfiellid, verwijderProfiellid } from "../../lib/app/opslag";
import { sectiesAlsLijst } from "../../lib/app/gedeeldeKopie";
import {
  BEGELEIDER,
  BEHEERDER,
  LID,
  begeleiders,
  begeleidingstekst,
  deelnemers,
  magBeheren,
  magRolWijzigen,
  magVertrekken,
  overdrachtstekst,
} from "../../lib/app/teamrollen";
import { kenmerkenUitInsights } from "../../lib/app/insights";
import { deelzin } from "../../data/app/kenmerken";
import { MAX_NAAM, initialen, schoneNaam, voornaam } from "../../lib/app/naam";
import { gedeeldSamengevat } from "../../lib/app/gedeeld";
import InsightsUpload from "../../components/app/InsightsUpload";
import HandleidingKlaarzetten from "../../components/app/HandleidingKlaarzetten";
import Teamafspraken from "../../components/app/Teamafspraken";
import VolgendeStap from "../../components/app/VolgendeStap";
import useActie from "../../components/app/useActie";
import Melding from "../../components/app/Melding";

/**
 * Wat iemand met dit team deelde.
 *
 * De twaalf punten als korte regels onder elkaar in één blok — twaalf losse
 * citaatblokken met witruimte ertussen werden een muur. Daaronder alleen de
 * stukjes handleiding die iets toevoegen; zie gedeeld.js.
 */
function Gedeeld({ gedeeld }) {
  const { zinnen, secties } = gedeeldSamengevat(gedeeld);
  if (zinnen.length === 0 && secties.length === 0) return null;

  return (
    <>
      {zinnen.length > 0 && (
        <>
          <div className="tk-label">Wat deze collega deelt</div>
          <ul className="tk-zinnen">
            {zinnen.map((zin) => (
              <li key={zin}>{zin}</li>
            ))}
          </ul>
        </>
      )}

      {secties.length > 0 && (
        <>
          <div className="tk-label">In eigen woorden</div>
          {secties.map((s) => (
            <div key={s.sectieId} className="tk-sectie">
              <strong>{s.titel}</strong>
              <p>{s.tekst}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

/** Eén regel in de ledenlijst, met wat eronder tevoorschijn komt. */
function Persoon({ sleutel, naam: hunNaam, achter, onder, uitgeklapt, onKlik, children }) {
  return (
    <div className="tk-persoonrij">
      <button
        type="button"
        className={`tk-optie tk-optie-persoon${uitgeklapt ? " open" : ""}`}
        onClick={onKlik}
        aria-expanded={uitgeklapt}
      >
        <span className="tk-bol">{initialen(hunNaam)}</span>
        <span className="tk-optie-tekst">
          <strong>
            {hunNaam}
            {achter ? <span className="tk-achter"> {achter}</span> : null}
          </strong>
          <small>{onder}</small>
        </span>
        <span className="tk-optie-pijl" aria-hidden="true">›</span>
      </button>
      {uitgeklapt && <div className="tk-optie-uit" key={sleutel}>{children}</div>}
    </div>
  );
}

export default function MijnTeam() {
  const {
    gebruiker, naam, actiefTeam, lidmaatschappen, verlaatTeam, verwijderTeam, vernieuwCode,
    teamOverzicht, herlaadTeam, ikBegeleid, zetRol, magTeams,
  } = useApp();

  // Team, leden en gedeeld staan al in de context. Hier stond een tweede kopie
  // in eigen state; herlaadTeam() ververste alleen de context-kopie, dus na het
  // toevoegen of verwijderen van een profiel liepen de ledenlijst en de
  // volgende stap op ditzelfde scherm uit elkaar.
  const { team, leden, gedeeld, laden } = teamOverzicht;

  const [open, setOpen] = useState(null);
  const [paneel, setPaneel] = useState(null); // "uitnodigen" | "profiel" | null
  const [bevestigVerlaten, setBevestigVerlaten] = useState(false);
  const { bezig: bezigOpruimen, melding: opruimMelding, voerUit: voerOpruimenUit, wisMelding: wisOpruimMelding } =
    useActie();
  const [toonStappen, setToonStappen] = useState(false);
  // Een nieuwe code maken is klein werk met grote gevolgen: elke uitnodiging
  // die nog rondslingert houdt er meteen mee op. Daarom een bevestigingsstap.
  const [bevestigNieuweCode, setBevestigNieuweCode] = useState(false);
  const {
    bezig: bezigCode,
    melding: codeMelding,
    voerUit: voerCodeUit,
    wisMelding: wisCodeMelding,
  } = useActie();
  const [profielNaam, setProfielNaam] = useState("");
  const {
    melding: profielMelding,
    setMelding: setProfielMelding,
    voerUit: voerProfielUit,
    wisMelding: wisProfielMelding,
    bezig: bezigProfiel,
  } = useActie();
  const [voorstellen, setVoorstellen] = useState({});
  const [rolVoor, setRolVoor] = useState(null);
  const [begeleidVoor, setBegeleidVoor] = useState(false);
  const {
    bezig: bezigRol,
    melding: rolMelding,
    voerUit: voerRolUit,
    wisMelding: wisRolMelding,
  } = useActie();
  const [uploadVoor, setUploadVoor] = useState(null);
  const [tekstVoor, setTekstVoor] = useState(null);
  const [tekstBijProfiel, setTekstBijProfiel] = useState(null);
  const [naamBijProfiel, setNaamBijProfiel] = useState(null);
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [tekstvoorstellen, setTekstvoorstellen] = useState({});
  const [gekopieerd, setGekopieerd] = useState(null);

  // De link draagt de code mee, zodat de ontvanger niets hoeft over te typen.
  const uitnodigingslink = (code) => `https://www.mijnteamkompas.nl/app?code=${code}`;

  const uitnodigingstekst = (code, teamNaam) =>
    [
      `Ik gebruik Mijn Teamkompas om onze samenwerking wat makkelijker te maken. Doe je mee met ${teamNaam}?`,
      "",
      `1. Open ${uitnodigingslink(code)}`,
      "2. Vul je e-mailadres in — je ontvangt een e-mail met een inloglink",
      "   (die mail belandt de eerste keer nogal eens bij ongewenste berichten; kijk daar even)",
      `3. De teamcode ${code} staat dan al klaar`,
      "",
      "Je vult zelf in hoe jij samenwerkt, en bepaalt zelf wat je met het team deelt.",
    ].join("\n");

  const kopieer = async (tekst, welke) => {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(welke);
      setTimeout(() => setGekopieerd(null), 2200);
    } catch {
      /* kopiëren mag niet altijd; alles staat zichtbaar op het scherm */
    }
  };

  useEffect(() => {
    if (!actiefTeam) return;
    let actueel = true;
    // Alleen een beheerder mag deze lijst opvragen; voor een lid mislukt hij
    // en dat is precies de bedoeling.
    haalVoorstellen({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId })
      .then((v) => actueel && setVoorstellen(v))
      .catch(() => {});
    haalHandleidingvoorstellen({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId })
      .then((v) => actueel && setTekstvoorstellen(v))
      .catch(() => {});
    return () => {
      actueel = false;
    };
  }, [actiefTeam]);

  const mijnUid = gebruiker && gebruiker.uid;
  const ikBenBeheerder = useMemo(() => magBeheren(leden, mijnUid), [leden, mijnUid]);

  // Echt opruimen kan alleen wie het team beheert en er als enige in zit; een
  // team mag nooit onder de voeten van anderen weg kunnen verdwijnen.
  const kanVerwijderen = ikBenBeheerder && leden.length <= 1;

  // De laatste beheerder mag niet weglopen bij een team met anderen erin; dan
  // blijft er een team achter dat niemand meer kan beheren. Zie teamrollen.js.
  const vertrek = useMemo(() => magVertrekken({ leden, uid: mijnUid }), [leden, mijnUid]);

  // Hoeveel punten je op dit moment met dit team deelt. Nodig voor de
  // waarschuwing bij begeleiden: die kopie verdwijnt, en dat mag je niet pas
  // achteraf ontdekken.
  const aantalGedeeld = ((gedeeld[mijnUid] || {}).kenmerken || []).length;

  // De mensen die het team begeleiden staan apart; zie teamrollen.js.
  const begeleidt = useMemo(() => begeleiders(leden), [leden]);

  /**
   * Iemand beheerder maken, of die rol weer weghalen.
   *
   * De regel staat in teamrollen.js en firestore.rules houdt hem ook echt
   * tegen; deze functie zorgt alleen dat het scherm klopt met wat er gebeurt.
   */
  const wijzigRol = (l, nieuweRol) => {
    const oordeel = magRolWijzigen({
      leden,
      doorUid: mijnUid,
      doelUid: l.uid,
      nieuweRol,
    });
    if (!oordeel.mag) return;

    const eigen = l.uid === mijnUid;
    const hun = voornaam(l.naam, "deze collega");
    const Hun = voornaam(l.naam, "Deze collega");

    const teamNaam = actiefTeam.teamNaam || "dit team";
    const gelukt =
      nieuweRol === BEGELEIDER
        ? `Je begeleidt ${teamNaam} nu. Je staat niet meer tussen de teamgenoten.`
        : nieuweRol === BEHEERDER
          ? eigen
            ? `Je doet weer mee in ${teamNaam}.`
            : `${Hun} is nu beheerder van dit team.`
          : eigen
            ? "Je bent nu gewoon lid van dit team."
            : `${Hun} is nu gewoon lid van dit team.`;

    voerRolUit(
      nieuweRol === BEGELEIDER
        ? "instellen dat je dit team begeleidt"
        : nieuweRol === BEHEERDER && !eigen
          ? `${hun} beheerder maken`
          : "de beheerdersrol aanpassen",
      async () => {
        await zetRol({ uid: l.uid, rol: nieuweRol });
        setRolVoor(null);
        setBegeleidVoor(false);
      },
      gelukt
    );
  };

  const BEHEERDER_ROLLEN = [BEHEERDER, BEGELEIDER];

  /** Wat er op het bevestigingsscherm staat, per geval. */
  const rolUitleg = (l) => {
    const eigen = l.uid === mijnUid;
    const hun = voornaam(l.naam, "deze collega");
    const Hun = voornaam(l.naam, "Deze collega");

    if (!BEHEERDER_ROLLEN.includes(l.rol)) return overdrachtstekst(Hun);
    if (eigen)
      return "Je kunt daarna geen mensen meer uitnodigen en geen profielen meer toevoegen. Je blijft gewoon lid: wat je deelt en wat je van teamgenoten ziet, verandert niet.";
    return `${Hun} kan daarna geen mensen meer uitnodigen en geen profielen meer toevoegen, en blijft gewoon lid van het team. Je kunt ${hun} later weer beheerder maken.`;
  };

  const profielleden = teamOverzicht.profielleden || [];

  const wisselPaneel = (welke) => {
    setPaneel((p) => (p === welke ? null : welke));
    setOpen(null);
  };

  if (!actiefTeam) return <div className="tk-inhoud"><p className="tk-onderkop">Je hebt nog geen team.</p></div>;
  if (laden) return <div className="tk-inhoud"><p className="tk-onderkop">Even laden...</p></div>;

  const meedoeners = deelnemers(leden);
  const onderkop = [
    actiefTeam.orgNaam,
    `${meedoeners.length} ${meedoeners.length === 1 ? "lid" : "leden"}`,
    profielleden.length > 0
      ? profielleden.length === 1
        ? "1 toegevoegd profiel"
        : `${profielleden.length} toegevoegde profielen`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  /**
   * Eén persoon in de lijst. Wordt twee keer gebruikt: voor de mensen die
   * meedoen en voor wie het team begeleidt. Dezelfde rij, want de knoppen
   * eronder zijn dezelfde — alleen de plek op het scherm verschilt.
   */
  const persoonsrij = (l) => {
    const eigen = l.uid === (gebruiker && gebruiker.uid);
    const g = gedeeld[l.uid];
    const sleutel = `lid-${l.uid}`;

    // Staat er een ja-of-nee-vraag open in deze rij? Dan is dat het enige
    // waar het nu over gaat.
    const bevestigingOpen = rolVoor === l.uid || (eigen && begeleidVoor);

    return (
      <Persoon
        key={sleutel}
        sleutel={sleutel}
        naam={l.naam || "Teamgenoot"}
        achter={eigen ? "(jij)" : null}
        onder={[
          l.functie || null,
          l.rol === BEGELEIDER
            ? "Begeleidt dit team"
            : l.rol === BEHEERDER
              ? "Beheerder"
              : null,
          // Een begeleider deelt hier niets, en dat is geen tekortkoming.
          l.rol === BEGELEIDER
            ? "Doet zelf niet mee"
            : g
              ? `${g.kenmerken.length} punten gedeeld`
              : "Heeft nog niets gedeeld",
        ]
          .filter(Boolean)
          .join(" · ")}
        uitgeklapt={open === sleutel}
        onKlik={() => {
          setOpen(open === sleutel ? null : sleutel);
          setPaneel(null);
          // Een half beantwoorde vraag hoort niet te blijven staan tot
          // je deze persoon toevallig weer openklapt.
          setRolVoor(null);
          setBegeleidVoor(false);
          setTekstVoor(null);
        }}
      >
        {/* De knoppen staan boven de tekst: je klapt iemand open om iets te
            doen, niet om twintig blokken te lezen. Zolang er een bevestiging
            openstaat verdwijnen ze: één vraag tegelijk. */}
        {!bevestigingOpen && (
        <div className="tk-knoppen">
          {g && !eigen && (
            <Link
              className="tk-knop tk-knop-klein"
              to={`/app/samenwerken?met=${encodeURIComponent(l.uid)}`}
            >
              Samenwerken met {voornaam(l.naam, "deze collega")}
            </Link>
          )}
          {eigen && (
            <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel">
              Mijn profiel aanpassen
            </Link>
          )}
          {ikBenBeheerder && !eigen && (
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => setUploadVoor(uploadVoor === l.uid ? null : l.uid)}
            >
              {uploadVoor === l.uid ? "Sluiten" : "Insights-profiel klaarzetten"}
            </button>
          )}
          {/* De woorden die een team in een sessie zelf opschreef zijn het
              waardevolste wat er is, en verdwijnen anders in een presentatie.
              Hier zet je ze klaar; de eigenaar bevestigt. */}
          {ikBenBeheerder && !eigen && (
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => {
                setTekstVoor(tekstVoor === l.uid ? null : l.uid);
                setUploadVoor(null);
              }}
            >
              {tekstVoor === l.uid
                ? "Sluiten"
                : tekstvoorstellen[l.uid]
                  ? "Handleidingtekst aanpassen"
                  : "Handleidingtekst klaarzetten"}
            </button>
          )}
          {/* Beheerder maken of die rol weghalen. Een facilitator die
              een team opzet, moet het kunnen overdragen; en niemand
              mag de laatste beheerder wegnemen. */}
          {ikBenBeheerder &&
            magRolWijzigen({
              leden,
              doorUid: mijnUid,
              doelUid: l.uid,
              nieuweRol: l.rol === BEHEERDER ? LID : BEHEERDER,
            }).mag && (
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setRolVoor(rolVoor === l.uid ? null : l.uid)}
              >
                {rolVoor === l.uid
                  ? "Sluiten"
                  : l.rol === BEHEERDER
                    ? eigen
                      ? "Beheerder-rol teruggeven"
                      : "Beheerder-rol weghalen"
                    : `${voornaam(l.naam, "Deze collega")} beheerder maken`}
              </button>
            )}
        </div>
        )}

        {/* Begeleiden zet je alleen voor jezelf aan of uit: of jij bij dit
            team hoort, is niet iets wat een ander over je beslist. */}
        {eigen && ikBenBeheerder && !bevestigingOpen && (
          <div className="tk-knoppen">
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => {
                setBegeleidVoor(!begeleidVoor);
                setRolVoor(null);
              }}
            >
              {begeleidVoor
                ? "Sluiten"
                : ikBegeleid
                  ? "Ik doe zelf mee in dit team"
                  : "Ik begeleid dit team"}
            </button>
          </div>
        )}

        {eigen && begeleidVoor && (
          <div className="tk-kaart" style={{ marginTop: 12 }}>
            <p style={{ marginTop: 0 }}>
              {begeleidingstekst(!ikBegeleid, actiefTeam.teamNaam || "dit team", aantalGedeeld)}
            </p>
            <div className="tk-knoppen">
              <button
                type="button"
                className="tk-knop tk-knop-klein"
                disabled={bezigRol}
                onClick={() => wijzigRol(l, ikBegeleid ? BEHEERDER : BEGELEIDER)}
              >
                {bezigRol
                  ? "Bezig..."
                  : ikBegeleid
                    ? "Ja, ik doe weer mee"
                    : "Ja, ik begeleid dit team"}
              </button>
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setBegeleidVoor(false)}
              >
                Toch niet
              </button>
            </div>
          </div>
        )}

        {rolVoor === l.uid && (
          <div className="tk-kaart" style={{ marginTop: 12 }}>
            <p style={{ marginTop: 0 }}>{rolUitleg(l)}</p>
            <div className="tk-knoppen">
              <button
                type="button"
                className="tk-knop tk-knop-klein"
                disabled={bezigRol}
                onClick={() => wijzigRol(l, l.rol === BEHEERDER ? LID : BEHEERDER)}
              >
                {bezigRol
                  ? "Bezig..."
                  : l.rol === BEHEERDER
                    ? eigen
                      ? "Ja, geef de rol terug"
                      : "Ja, haal de rol weg"
                    : `Ja, maak ${voornaam(l.naam, "deze collega")} beheerder`}
              </button>
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setRolVoor(null)}
              >
                Toch niet
              </button>
            </div>
          </div>
        )}

        {eigen && ikBenBeheerder && !vertrek.mag && (
          <p className="tk-fijn">
            Je bent de enige beheerder van dit team. Maak eerst iemand anders beheerder;
            daarna kun je de rol teruggeven of vertrekken.
          </p>
        )}

        {ikBenBeheerder && !eigen && voorstellen[l.uid] && (
          <p className="tk-fijn">
            Er staat een profielvoorstel klaar dat {voornaam(l.naam, "deze collega")} nog moet
            overnemen.
          </p>
        )}

        {ikBenBeheerder && !eigen && tekstvoorstellen[l.uid] && (
          <p className="tk-fijn">
            Er staat handleidingtekst klaar bij{" "}
            {Object.keys(tekstvoorstellen[l.uid].secties || {}).length} stukjes.{" "}
            {voornaam(l.naam, "Deze collega")} ziet die bij Mijn handleiding.
          </p>
        )}

        {tekstVoor === l.uid && (
          <HandleidingKlaarzetten
            voorWie={voornaam(l.naam, "deze collega")}
            bestaand={tekstvoorstellen[l.uid]}
            onSluit={() => setTekstVoor(null)}
            onBewaar={async (secties) => {
              await bewaarHandleidingvoorstel({
                orgId: actiefTeam.orgId,
                teamId: actiefTeam.teamId,
                uid: l.uid,
                vanUid: gebruiker.uid,
                vanNaam: naam,
                secties,
              });
              setTekstvoorstellen((v) => ({ ...v, [l.uid]: { uid: l.uid, secties } }));
            }}
          />
        )}

        {!g && l.rol !== BEGELEIDER && (
          <p className="tk-fijn">
            {eigen
              ? "Je hebt zelf nog niets met dit team gedeeld."
              : "Zodra deze collega iets deelt, staat het hier."}
          </p>
        )}

        {l.rol === BEGELEIDER && (
          <p className="tk-fijn">
            {eigen
              ? "Je begeleidt dit team en doet er zelf niet aan mee. Je staat niet in de lijst met wie de anderen kunnen samenwerken, en je deelt hier niets."
              : "Deze persoon begeleidt het team en doet er zelf niet aan mee."}
          </p>
        )}

        {g && <Gedeeld gedeeld={g} />}

        {uploadVoor === l.uid && (
          <div style={{ marginTop: 14 }}>
            <InsightsUpload
              voorWie={l.naam || "deze persoon"}
              knopLabel="Als voorstel klaarzetten"
              onBevestig={async (gelezen) => {
                await bewaarVoorstel({
                  orgId: actiefTeam.orgId,
                  teamId: actiefTeam.teamId,
                  uid: l.uid,
                  vanUid: gebruiker.uid,
                  vanNaam: naam,
                  voorstel: gelezen,
                });
                setVoorstellen((v) => ({ ...v, [l.uid]: { uid: l.uid } }));
                setUploadVoor(null);
              }}
            />
          </div>
        )}
      </Persoon>
    );
  };

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">{actiefTeam.teamNaam || "Mijn team"}</h1>
      <p className="tk-onderkop">{onderkop}</p>

      <Melding melding={profielMelding} onSluiten={wisProfielMelding} />
      <Melding melding={rolMelding} onSluiten={wisRolMelding} />

      {/* ---------------------------------------------------------- de mensen */}
      <section className="tk-groep">
        <h2 className="tk-groep-kop">Wie doen er mee</h2>
        <div className="tk-groep-lijst">
          {deelnemers(leden).map(persoonsrij)}

          {profielleden.map((pl) => {
            const sleutel = `profiel-${pl.id}`;
            return (
              <Persoon
                key={sleutel}
                sleutel={sleutel}
                naam={pl.naam}
                onder={[
                  `${(pl.kenmerken || []).length} punten`,
                  (pl.handleiding || []).length > 0
                    ? `${(pl.handleiding || []).length} in eigen woorden`
                    : null,
                  `toegevoegd door ${pl.toegevoegdDoorNaam || "een beheerder"}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                uitgeklapt={open === sleutel}
                onKlik={() => {
                  setOpen(open === sleutel ? null : sleutel);
                  setPaneel(null);
                  setTekstBijProfiel(null);
                }}
              >
                <div className="tk-knoppen">
                  <Link
                    className="tk-knop tk-knop-klein"
                    to={`/app/samenwerken?met=${encodeURIComponent(pl.id)}`}
                  >
                    Samenwerken met {voornaam(pl.naam, "dit profiel")}
                  </Link>
                  {/* Bij een toegevoegd profiel is er niemand om iets te
                      bevestigen: die persoon heeft nog geen account. De tekst
                      die hij in een teamsessie zelf schreef, kan hier dus recht-
                      streeks bij het profiel — met erbij dat het zo gegaan is. */}
                  {ikBenBeheerder && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => {
                        setTekstBijProfiel(tekstBijProfiel === pl.id ? null : pl.id);
                        setNaamBijProfiel(null);
                      }}
                    >
                      {tekstBijProfiel === pl.id
                        ? "Sluiten"
                        : (pl.handleiding || []).length > 0
                          ? "Eigen woorden aanpassen"
                          : "Eigen woorden toevoegen"}
                    </button>
                  )}
                  {ikBenBeheerder && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => {
                        setNaamBijProfiel(naamBijProfiel === pl.id ? null : pl.id);
                        setNieuweNaam(pl.naam || "");
                        setTekstBijProfiel(null);
                      }}
                    >
                      {naamBijProfiel === pl.id ? "Sluiten" : "Naam aanpassen"}
                    </button>
                  )}
                  {ikBenBeheerder && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() =>
                        voerProfielUit(
                          `het profiel van ${pl.naam} verwijderen`,
                          async () => {
                            await verwijderProfiellid({
                              orgId: actiefTeam.orgId,
                              teamId: actiefTeam.teamId,
                              id: pl.id,
                            });
                            await herlaadTeam();
                            setOpen(null);
                          },
                          `Het profiel van ${pl.naam} is verwijderd.`
                        )
                      }
                    >
                      Verwijderen
                    </button>
                  )}
                </div>

                {naamBijProfiel === pl.id && (
                  <div style={{ marginTop: 16 }}>
                    <label className="tk-label" htmlFor={`naam-${pl.id}`}>
                      Naam
                    </label>
                    <input
                      id={`naam-${pl.id}`}
                      className="tk-invoer"
                      value={nieuweNaam}
                      maxLength={MAX_NAAM}
                      placeholder="Voor- en achternaam"
                      onChange={(e) => setNieuweNaam(e.target.value)}
                    />
                    <p className="tk-fijn" style={{ margin: "8px 0 0" }}>
                      Heten er twee mensen in dit team hetzelfde van voren, dan is de achternaam
                      het enige waaraan je ze uit elkaar houdt.
                    </p>
                    <div className="tk-knoppen" style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="tk-knop tk-knop-klein"
                        disabled={
                          bezigProfiel ||
                          !schoneNaam(nieuweNaam) ||
                          schoneNaam(nieuweNaam) === pl.naam
                        }
                        onClick={() => {
                          const naam = schoneNaam(nieuweNaam);
                          voerProfielUit(
                            "de naam bijwerken",
                            async () => {
                              await hernoemProfiellid({
                                orgId: actiefTeam.orgId,
                                teamId: actiefTeam.teamId,
                                id: pl.id,
                                naam,
                              });
                              await herlaadTeam();
                              setNaamBijProfiel(null);
                            },
                            `Dit profiel heet nu ${naam}.`
                          );
                        }}
                      >
                        {bezigProfiel ? "Bezig..." : "Bewaren"}
                      </button>
                    </div>
                  </div>
                )}

                {tekstBijProfiel === pl.id && (
                  <HandleidingKlaarzetten
                    voorWie={voornaam(pl.naam, "deze persoon")}
                    directBijProfiel
                    bestaand={{
                      secties: Object.fromEntries(
                        (pl.handleiding || []).map((s) => [s.sectieId, s.tekst])
                      ),
                    }}
                    onSluit={() => setTekstBijProfiel(null)}
                    onBewaar={async (secties) => {
                      await bewaarProfiellid({
                        orgId: actiefTeam.orgId,
                        teamId: actiefTeam.teamId,
                        id: pl.id,
                        naam: pl.naam,
                        kenmerken: pl.kenmerken || [],
                        handleiding: sectiesAlsLijst(secties),
                        insights: pl.insights || null,
                        toegevoegdDoor: gebruiker.uid,
                        toegevoegdDoorNaam: naam,
                      });
                      await herlaadTeam();
                      setTekstBijProfiel(null);
                    }}
                  />
                )}

                <p className="tk-fijn">
                  Dit profiel komt uit een Insights-rapport dat een beheerder heeft geüpload.{" "}
                  {voornaam(pl.naam, "Deze persoon")} heeft het niet zelf ingevuld of bevestigd
                  {(pl.handleiding || []).length > 0
                    ? " — ook de tekst hieronder niet, al zijn dat wel de eigen woorden uit een teamsessie."
                    : ""}
                  .{" "}
                  {(pl.handleiding || []).length > 0
                    ? `Zodra ${voornaam(pl.naam, "deze persoon")} zelf meedoet, kun je de tekst als voorstel klaarzetten en dit profiel weghalen.`
                    : ""}
                </p>

                <Gedeeld
                  gedeeld={{ kenmerken: pl.kenmerken || [], handleiding: pl.handleiding || [] }}
                />
              </Persoon>
            );
          })}

          {team && team.code && (
            <div className="tk-persoonrij">
              <button
                type="button"
                className={`tk-optie tk-optie-toevoegen${paneel === "uitnodigen" ? " open" : ""}`}
                onClick={() => wisselPaneel("uitnodigen")}
                aria-expanded={paneel === "uitnodigen"}
              >
                <span className="tk-optie-plus" aria-hidden="true">+</span>
                <span>Iemand uitnodigen</span>
                <span className="tk-optie-pijl" aria-hidden="true">›</span>
              </button>
              {paneel === "uitnodigen" && (
                <div className="tk-optie-uit">
                  {lidmaatschappen.length > 1 && (
                    <div className="tk-melding" style={{ marginBottom: 14 }}>
                      Deze code hoort bij <strong>{actiefTeam.teamNaam || "dit team"}</strong>. Je hoort bij
                      meer teams; wil je iemand voor een ander team uitnodigen, wissel dan eerst bovenin bij
                      "Je werkt in".
                    </div>
                  )}

                  <div className="tk-code" style={{ marginBottom: 14 }}>{team.code}</div>

                  <div className="tk-knoppen">
                    <button
                      type="button"
                      className="tk-knop tk-knop-klein"
                      onClick={() => kopieer(uitnodigingstekst(team.code, actiefTeam.teamNaam || "ons team"), "uitnodiging")}
                    >
                      {gekopieerd === "uitnodiging" ? "Gekopieerd" : "Kopieer de uitnodiging"}
                    </button>
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => kopieer(uitnodigingslink(team.code), "link")}
                    >
                      {gekopieerd === "link" ? "Gekopieerd" : "Alleen de link"}
                    </button>
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => kopieer(team.code, "code")}
                    >
                      {gekopieerd === "code" ? "Gekopieerd" : "Alleen de code"}
                    </button>
                  </div>

                  <p className="tk-fijn" style={{ marginTop: 14, marginBottom: 0 }}>
                    De uitnodiging bevat een link met de code erin, dus de ander hoeft niets over te typen.
                  </p>

                  <button
                    type="button"
                    className="tk-uitklap"
                    aria-expanded={toonStappen}
                    onClick={() => setToonStappen((t) => !t)}
                  >
                    <span className="tk-optie-pijl" aria-hidden="true">›</span> Wat moet de ander doen?
                  </button>

                  {toonStappen && (
                    <ol className="tk-fijn" style={{ margin: "6px 0 0", paddingLeft: 20, lineHeight: 1.8 }}>
                      <li>
                        Gaat naar <span style={{ color: "var(--tk-teal)" }}>mijnteamkompas.nl/app</span> —
                        via jouw link staat de code er meteen in
                      </li>
                      <li>
                        Vult een e-mailadres in en klikt op de inloglink in de mail — die belandt de eerste
                        keer vaak bij ongewenste berichten
                      </li>
                      <li>Vult een naam in en doet mee met de code</li>
                    </ol>
                  )}

                  {/* Een code blijft werken zolang hij bestaat, ook in een
                      mailtje van vorig jaar. Alleen wie het team beheert kan
                      hem intrekken; de regels laten niemand anders toe. */}
                  {ikBenBeheerder && (
                    <div style={{ marginTop: 18, borderTop: "1px solid var(--tk-lijn)", paddingTop: 14 }}>
                      <Melding melding={codeMelding} onSluiten={wisCodeMelding} />
                      {bevestigNieuweCode ? (
                        <>
                          <p className="tk-fijn" style={{ marginTop: 0 }}>
                            Het team krijgt een nieuwe code. Elke uitnodiging die je eerder hebt
                            verstuurd werkt daarna niet meer, ook de link erin. Wie al meedoet merkt
                            er niets van en blijft gewoon in het team.
                          </p>
                          <div className="tk-knoppen">
                            <button
                              type="button"
                              className="tk-knop tk-knop-klein"
                              disabled={bezigCode}
                              onClick={() =>
                                voerCodeUit(
                                  "een nieuwe teamcode aanmaken",
                                  async () => {
                                    await vernieuwCode({
                                      orgId: actiefTeam.orgId,
                                      teamId: actiefTeam.teamId,
                                      oudeCode: team.code,
                                    });
                                    setBevestigNieuweCode(false);
                                    setGekopieerd(null);
                                  },
                                  "Er staat een nieuwe code klaar. De oude werkt niet meer."
                                )
                              }
                            >
                              {bezigCode ? "Bezig..." : "Ja, maak een nieuwe code"}
                            </button>
                            <button
                              type="button"
                              className="tk-knop tk-knop-rand tk-knop-klein"
                              onClick={() => setBevestigNieuweCode(false)}
                            >
                              Toch niet
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="tk-stille-knop"
                          onClick={() => setBevestigNieuweCode(true)}
                        >
                          Nieuwe code aanmaken
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {ikBenBeheerder && (
            <div className="tk-persoonrij">
              <button
                type="button"
                className={`tk-optie tk-optie-toevoegen${paneel === "profiel" ? " open" : ""}`}
                onClick={() => wisselPaneel("profiel")}
                aria-expanded={paneel === "profiel"}
              >
                <span className="tk-optie-plus" aria-hidden="true">+</span>
                <span>Profiel toevoegen uit een Insights-rapport</span>
                <span className="tk-optie-pijl" aria-hidden="true">›</span>
              </button>
              {paneel === "profiel" && (
                <div className="tk-optie-uit">
                  <p>
                    Heeft iemand nog geen account, of wil je een team compleet maken voor een sessie? Vul een
                    naam in en upload het Insights-rapport. Het profiel staat meteen in het team en je kunt
                    er direct advies over vragen.
                  </p>
                  <p className="tk-fijn">
                    Bij zo'n profiel staat altijd dat jij het hebt toegevoegd. Het is niet door die persoon
                    zelf ingevuld of bevestigd, en het raakt zijn of haar eigen profiel niet — dat blijft van
                    de eigenaar alleen, ook voor jou.
                  </p>

                  <label className="tk-label" htmlFor="tk-profielnaam">Naam van deze persoon</label>
                  <input
                    id="tk-profielnaam"
                    className="tk-invoer"
                    value={profielNaam}
                    onChange={(e) => setProfielNaam(e.target.value)}
                    placeholder="Voornaam"
                  />

                  <div style={{ marginTop: 14 }}>
                    <InsightsUpload
                      knopLabel="Toevoegen en meteen delen"
                      onBevestig={async (gelezen) => {
                        const kenmerken = kenmerkenUitInsights(gelezen)
                          .map((k) => ({
                            kenmerkId: k.kenmerkId,
                            waarde: k.waarde,
                            zin: deelzin(k.kenmerkId, k.waarde) || "",
                          }))
                          .filter((k) => k.zin);

                        await bewaarProfiellid({
                          orgId: actiefTeam.orgId,
                          teamId: actiefTeam.teamId,
                          naam: profielNaam.trim() || "Naamloos profiel",
                          kenmerken,
                          insights: {
                            voorkeurskleur: gelezen.voorkeurskleur,
                            tweedeKleur: gelezen.tweedeKleur || null,
                          },
                          toegevoegdDoor: gebruiker.uid,
                          toegevoegdDoorNaam: naam,
                        });

                        await herlaadTeam();
                        setProfielMelding({
                          soort: "goed",
                          tekst: `${profielNaam.trim() || "Het profiel"} staat in het team met ${kenmerken.length} punten. Je kunt er meteen advies over vragen.`,
                        });
                        setProfielNaam("");
                        setPaneel(null);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------- begeleiding */}
      {begeleidt.length > 0 && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">
            {begeleidt.length === 1 ? "Begeleiding" : "Begeleiders"}
          </h2>
          <p className="tk-fijn" style={{ marginTop: -6 }}>
            {begeleidt.length === 1 ? "Deze persoon zet" : "Deze mensen zetten"} het team op en
            {begeleidt.length === 1 ? " beheert" : " beheren"} het, maar
            {begeleidt.length === 1 ? " doet" : " doen"} er zelf niet aan mee.
          </p>
          <div className="tk-groep-lijst">{begeleidt.map(persoonsrij)}</div>
        </section>
      )}

      {/* ----------------------------------------------------- teambeeld */}
      <section className="tk-groep">
        <h2 className="tk-groep-kop">Hoe dit team in elkaar zit</h2>
        <div className="tk-groep-lijst">
          <Link to="/app/teambeeld" className="tk-optie">
            <span className="tk-optie-tekst">
              <strong>Ons teambeeld</strong>
              <small>Waar jullie uiteenlopen en waar niet. Zonder namen.</small>
            </span>
            <span className="tk-optie-pijl" aria-hidden="true">›</span>
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------- onze afspraken */}
      <Teamafspraken magVerwijderen={ikBenBeheerder} />

      <VolgendeStap verbergAls="uitnodigen" />

      {/* ------------------------------------------------------- dit team zelf */}
      <section className="tk-stil">
        <h2 className="tk-groep-kop">Dit team</h2>
        <p className="tk-fijn">
          {ikBenBeheerder
            ? "Je bent beheerder. Dat gaat over de teamgegevens; het geeft je geen inzage in de profielen van anderen."
            : "Je bent lid van dit team."}
          {lidmaatschappen.length > 1
            ? ` Je hoort bij ${lidmaatschappen.length} teams; wissel bovenin om een ander te zien.`
            : ""}
        </p>

        {/* Een nieuw team aanmaken zat verstopt achter een link die "Bij een
            ander team aansluiten" heette. Voor wie teams begeleidt is dat juist
            de meest gebruikte weg, dus staat hij er nu gewoon naast. */}
        <div className="tk-knoppen">
          {magTeams && (
            <Link
              className="tk-knop tk-knop-rand tk-knop-klein"
              to={"/app/welkom?extra=1&nieuw=1"}
            >
              Een nieuw team aanmaken
            </Link>
          )}
          <Link
            className="tk-knop tk-knop-rand tk-knop-klein"
            to="/app/welkom?extra=1"
          >
            Bij een ander team aansluiten
          </Link>
        </div>

        {bevestigVerlaten ? (
          <>
            <p className="tk-fijn">
              {kanVerwijderen
                ? "Je bent de enige in dit team, dus het wordt echt opgeruimd: het team, de organisatie en de teamcode verdwijnen. De code werkt daarna niet meer. Je eigen profiel blijft gewoon staan."
                : "Alles wat je met dit team deelde wordt direct verwijderd. Het team zelf blijft bestaan voor de anderen."}
            </p>
            <div className="tk-knoppen">
              <button
                type="button"
                className="tk-knop tk-knop-klein tk-knop-gevaar"
                disabled={bezigOpruimen}
                onClick={() =>
                  voerOpruimenUit(
                    kanVerwijderen ? "dit team verwijderen" : "dit team verlaten",
                    () =>
                      kanVerwijderen
                        ? verwijderTeam({
                            orgId: actiefTeam.orgId,
                            teamId: actiefTeam.teamId,
                            code: team && team.code,
                          })
                        : verlaatTeam({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId })
                  )
                }
              >
                {bezigOpruimen ? "Bezig..." : kanVerwijderen ? "Ja, verwijder dit team" : "Ja, verlaat dit team"}
              </button>
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setBevestigVerlaten(false)}
              >
                Toch niet
              </button>
            </div>
            <Melding melding={opruimMelding} onSluiten={wisOpruimMelding} />
          </>
        ) : vertrek.mag ? (
          <button type="button" className="tk-stille-knop" onClick={() => setBevestigVerlaten(true)}>
            {kanVerwijderen ? "Dit team verwijderen" : "Dit team verlaten"}
          </button>
        ) : (
          <p className="tk-fijn">{vertrek.reden}</p>
        )}
      </section>

      <div style={{ height: 30 }} />
    </div>
  );
}
