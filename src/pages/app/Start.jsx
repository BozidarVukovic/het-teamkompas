// Het startscherm.
//
// Uitgangspunt: er is op elk moment precies één ding dat logisch is om nu te
// doen, en dat staat groot in beeld. Niet drie tellers op nul met drie knoppen
// ernaast — dan moet de gebruiker zelf bedenken waar te beginnen, en dat is
// onze taak, niet de zijne.
//
// De volgorde volgt wat er nodig is voordat de app iets kan betekenen:
//   1. je eigen profiel invullen
//   2. het delen met je team
//   3. je team erbij halen
//   4. pas dan werkt "Samenwerken met..." echt
//
// Al het andere staat eronder, klein, en pas wanneer het aan de beurt is.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { haalGedeeldVanTeam, haalTeam, haalTeamleden } from "../../lib/app/opslag";
import { KENMERKEN } from "../../data/app/kenmerken";
import { SECTIES } from "../../data/app/handleiding";

function Stappen({ nu, totaal = 3 }) {
  if (nu > totaal) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {Array.from({ length: totaal }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            width: i + 1 === nu ? 22 : 8,
            height: 8,
            borderRadius: 999,
            background: i + 1 <= nu ? "var(--tk-teal)" : "rgba(255,255,255,0.16)",
            transition: "width .2s",
          }}
        />
      ))}
      <span className="tk-fijn" style={{ marginLeft: 6 }}>
        Stap {nu} van {totaal}
      </span>
    </div>
  );
}

function VolgendeStap({ stap, nummer, kopieerCode, gekopieerd }) {
  return (
    <div className="tk-advies" style={{ marginBottom: 26 }}>
      <Stappen nu={nummer} />
      <h2 style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.25 }}>{stap.kop}</h2>
      <p style={{ color: "var(--tk-zacht)", lineHeight: 1.7, margin: "0 0 18px" }}>{stap.uitleg}</p>

      {stap.code && (
        <div style={{ marginBottom: 18 }}>
          <div className="tk-label" style={{ marginBottom: 6 }}>Teamcode</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span className="tk-code">{stap.code}</span>
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={kopieerCode}>
              {gekopieerd ? "Gekopieerd" : "Kopieer"}
            </button>
          </div>
        </div>
      )}

      {stap.naar ? (
        <Link className="tk-knop" to={stap.naar} style={{ textDecoration: "none", display: "inline-block" }}>
          {stap.knop}
        </Link>
      ) : (
        <button type="button" className="tk-knop" onClick={stap.actie} disabled={stap.bezig}>
          {stap.bezig ? "Bezig..." : stap.knop}
        </button>
      )}

      {stap.tweede && (
        <div style={{ marginTop: 12 }}>
          <Link to={stap.tweede.naar} className="tk-fijn" style={{ color: "var(--tk-teal)" }}>
            {stap.tweede.label}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Start() {
  const { gebruiker, naam, actiefTeam, kenmerken, handleiding, bewaarMeerKenmerken } = useApp();

  const [leden, setLeden] = useState([]);
  const [gedeeldInTeam, setGedeeldInTeam] = useState({});
  const [team, setTeam] = useState(null);
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);

  useEffect(() => {
    if (!actiefTeam) return undefined;
    let actueel = true;
    setLaden(true);
    Promise.all([
      haalTeam(actiefTeam.orgId, actiefTeam.teamId),
      haalTeamleden(actiefTeam.orgId, actiefTeam.teamId),
      haalGedeeldVanTeam(actiefTeam.orgId, actiefTeam.teamId),
    ])
      .then(([t, l, g]) => {
        if (!actueel) return;
        setTeam(t);
        setLeden(l);
        setGedeeldInTeam(g);
      })
      .catch(() => {})
      .finally(() => actueel && setLaden(false));
    return () => {
      actueel = false;
    };
  }, [actiefTeam]);

  const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;
  const bruikbaar = kenmerken.filter((k) => k.waarde && k.bevestigd !== "nee");
  const gedeeld = sleutel ? bruikbaar.filter((k) => (k.gedeeldMet || []).includes(sleutel)).length : 0;
  const sectiesIngevuld = SECTIES.filter((s) => handleiding[s.id] && handleiding[s.id].tekst).length;

  const anderen = useMemo(
    () => leden.filter((l) => l.uid !== (gebruiker && gebruiker.uid)),
    [leden, gebruiker]
  );
  const anderenMetGedeeld = anderen.filter((l) => gedeeldInTeam[l.uid]).length;

  const deelAlles = async () => {
    if (!sleutel || bruikbaar.length === 0) return;
    setBezig(true);
    try {
      await bewaarMeerKenmerken(
        bruikbaar.map((k) => ({
          ...k,
          gedeeldMet: [...new Set([...(k.gedeeldMet || []), sleutel])],
        }))
      );
    } finally {
      setBezig(false);
    }
  };

  const kopieerCode = async () => {
    if (!team || !team.code) return;
    try {
      await navigator.clipboard.writeText(team.code);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch {
      /* kopiëren mag niet altijd; de code staat er zichtbaar bij */
    }
  };

  /* ------------------------------------------------- wat is nu aan de beurt */

  let nummer = 4;
  let stap = null;

  if (bruikbaar.length === 0) {
    nummer = 1;
    stap = {
      kop: "Begin bij jezelf",
      uitleg:
        "Vul in hoe jij werkt en samenwerkt. Twaalf korte vragen — of upload je Insights Discovery-profiel, dan staat het er in een minuut op. Zonder dit weet de app nog niets over jou.",
      knop: "Mijn profiel invullen",
      naar: "/app/profiel",
    };
  } else if (gedeeld === 0) {
    nummer = 2;
    stap = {
      kop: "Deel het met je team",
      uitleg: `Je hebt ${bruikbaar.length} ${
        bruikbaar.length === 1 ? "punt" : "punten"
      } ingevuld. Zolang je niets deelt, ziet niemand er iets van — en kan niemand er rekening mee houden. Je bepaalt zelf wat je deelt en kunt het altijd weer intrekken.`,
      knop: `Alles delen met ${actiefTeam ? actiefTeam.teamNaam || "mijn team" : "mijn team"}`,
      actie: deelAlles,
      bezig,
      tweede: { naar: "/app/profiel", label: "Liever per punt kiezen" },
    };
  } else if (anderen.length === 0) {
    nummer = 3;
    stap = {
      kop: "Nu je team nog",
      uitleg:
        "Jij staat klaar. Geef deze code aan de mensen met wie je samenwerkt; zodra zij meedoen en hun profiel delen, kun je advies vragen over de samenwerking met hen.",
      knop: "Naar mijn team",
      naar: "/app/team",
      code: team && team.code,
    };
  } else if (anderenMetGedeeld === 0) {
    nummer = 3;
    stap = {
      kop: "Je teamgenoten moeten nog delen",
      uitleg: `${
        anderen.length === 1 ? "Er is één teamgenoot" : `Er zijn ${anderen.length} teamgenoten`
      }, maar nog niemand heeft iets gedeeld. Vraag ze hun profiel in te vullen en te delen — dan kan de app pas iets zeggen over de samenwerking met hen.`,
      knop: "Naar mijn team",
      naar: "/app/team",
      code: team && team.code,
    };
  } else {
    stap = {
      kop: "Loop je ergens tegenaan?",
      uitleg:
        "Kies met wie het speelt en wat er aan de hand is. Je krijgt een kort advies dat je meteen kunt gebruiken in het gesprek.",
      knop: "Samenwerken met...",
      naar: "/app/samenwerken",
    };
  }

  /* ------------------------------------------------------------- weergave */

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Hallo {naam || "daar"}</h1>
      <p className="tk-onderkop">
        {actiefTeam
          ? `Je werkt nu in ${actiefTeam.teamNaam || "je team"}${
              actiefTeam.orgNaam ? ` van ${actiefTeam.orgNaam}` : ""
            }.`
          : "Je hebt nog geen team gekozen."}
      </p>

      {laden ? (
        <div className="tk-kaart">
          <p style={{ marginBottom: 0 }}>Even kijken waar je gebleven was...</p>
        </div>
      ) : (
        <VolgendeStap stap={stap} nummer={nummer} kopieerCode={kopieerCode} gekopieerd={gekopieerd} />
      )}

      {!laden && nummer > 1 && (
        <div className="tk-kaart">
          <h2>Je profiel</h2>
          <div className="tk-rij">
            <div>
              <strong>{bruikbaar.length} van {KENMERKEN.length} punten ingevuld</strong>
              <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
                Hoe completer, hoe gerichter het advies dat anderen over de samenwerking met jou
                krijgen.
              </p>
            </div>
            <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel" style={{ textDecoration: "none" }}>
              Bekijken
            </Link>
          </div>

          {gedeeld > 0 && (
            <div className="tk-rij">
              <div>
                <strong>{gedeeld} gedeeld met dit team</strong>
                <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
                  Alleen wat je zelf aanvinkt is zichtbaar. Intrekken kan altijd.
                </p>
              </div>
              <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel" style={{ textDecoration: "none" }}>
                Aanpassen
              </Link>
            </div>
          )}

          {nummer > 3 && (
            <div className="tk-rij">
              <div>
                <strong>
                  {sectiesIngevuld === 0
                    ? "Nog geen handleiding geschreven"
                    : `${sectiesIngevuld} van ${SECTIES.length} stukjes handleiding`}
                </strong>
                <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
                  Optioneel. Een korte gebruiksaanwijzing bij jezelf, in je eigen woorden.
                </p>
              </div>
              <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/handleiding" style={{ textDecoration: "none" }}>
                {sectiesIngevuld === 0 ? "Beginnen" : "Aanvullen"}
              </Link>
            </div>
          )}
        </div>
      )}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze zijn
        bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
