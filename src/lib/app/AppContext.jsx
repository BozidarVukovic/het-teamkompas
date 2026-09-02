// De gedeelde toestand van de samenwerkomgeving.
//
// Eén plek waar bekend is wie er is ingelogd, van welke teams die persoon lid
// is, welke kenmerken er van hem of haar bekend zijn en wat er per team
// gedeeld wordt. Componenten halen alles hiervandaan en praten zelf nooit met
// Firestore.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "../firebase";
import { kenmerkenUitInsights } from "./insights";
import {
  haalHandleidingvoorstel,
  haalVoorstel,
  verwijderHandleidingvoorstel,
  verwijderVoorstel,
} from "./voorstellen";
import { BEGELEIDER } from "./teamrollen";
import {
  bewaarInsights as bewaarInsightsInDb,
  bewaarProfielteksten,
  bewaarKenmerk as bewaarKenmerkInDb,
  bewaarKenmerken as bewaarKenmerkenInDb,
  bewaarSectie as bewaarSectieInDb,
  bewaarAfspraak as bewaarAfspraakInDb,
  bewaarReflectie as bewaarReflectieInDb,
  blikTerug as blikTerugInDb,
  haalAfspraken,
  haalEigenAdviessessies,
  haalEigenExperimenten,
  haalEigenReflecties,
  haalEigenRollen,
  haalGebruiker,
  startExperiment as startExperimentInDb,
  verwijderAfspraak as verwijderAfspraakInDb,
  haalGedeeldVanTeam,
  haalProfielleden,
  haalTeam,
  haalTeamleden,
  haalHandleiding,
  haalKenmerken,
  haalProfiel,
  maakGebruiker,
  maakOrganisatieMetTeam,
  treedToeMetCode,
  verlaatTeam as verlaatTeamInDb,
  verwijderTeam as verwijderTeamInDb,
  verwijderEigenGegevens as verwijderEigenGegevensInDb,
  werkAlleGedeeldBij,
  werkGebruikerBij,
  zetTeamrol as zetTeamrolInDb,
  werkLidgegevensBij,
  wisInsights as wisInsightsInDb,
} from "./opslag";

const SLEUTEL_EMAIL = "teamkompas.app.email";
const SLEUTEL_TEAM = "teamkompas.app.actiefTeam";
const SLEUTEL_CODE = "teamkompas.app.uitnodiging";

const AppContext = createContext(null);

export function useApp() {
  const waarde = useContext(AppContext);
  if (!waarde) throw new Error("useApp moet binnen AppProvider gebruikt worden.");
  return waarde;
}

function leesOpslag(sleutel) {
  try {
    return window.localStorage.getItem(sleutel);
  } catch {
    return null;
  }
}

function schrijfOpslag(sleutel, waarde) {
  try {
    if (waarde === null) window.localStorage.removeItem(sleutel);
    else window.localStorage.setItem(sleutel, waarde);
  } catch {
    /* privémodus of geblokkeerde opslag; de app werkt door */
  }
}

export function AppProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(null);
  const [authKlaar, setAuthKlaar] = useState(false);
  const [gebruikerDoc, setGebruikerDoc] = useState(null);
  const [kenmerken, setKenmerken] = useState([]);
  const [handleiding, setHandleiding] = useState({});
  const [profiel, setProfiel] = useState(null);
  const [gegevensKlaar, setGegevensKlaar] = useState(false);
  const [voorstellen, setVoorstellen] = useState([]);
  const [mijnRollen, setMijnRollen] = useState({});
  const [tekstvoorstellen, setTekstvoorstellen] = useState([]);
  const [experimenten, setExperimenten] = useState([]);
  const [sessies, setSessies] = useState([]);
  const [reflecties, setReflecties] = useState([]);
  const [teamOverzicht, setTeamOverzicht] = useState({
    team: null,
    leden: [],
    gedeeld: {},
    profielleden: [],
    afspraken: [],
    laden: true,
  });
  const [actiefTeamSleutel, setActiefTeamSleutel] = useState(() => leesOpslag(SLEUTEL_TEAM));

  // Een uitnodigingslink draagt de teamcode mee: /app?code=ABCD-1234. Die halen
  // we er meteen uit en onthouden we, want inloggen gaat via een e-mail en dan
  // is de link met de code allang weg.
  const [uitnodigingscode, setUitnodigingscode] = useState(() => {
    try {
      const uitLink = new URLSearchParams(window.location.search).get("code");
      if (uitLink) {
        const schoon = uitLink.trim().toUpperCase();
        schrijfOpslag(SLEUTEL_CODE, schoon);
        return schoon;
      }
    } catch {
      /* geen geldige url; dan is er ook geen code */
    }
    return leesOpslag(SLEUTEL_CODE);
  });

  const vergeetUitnodiging = useCallback(() => {
    schrijfOpslag(SLEUTEL_CODE, null);
    setUitnodigingscode(null);
  }, []);

  /* ------------------------------------------------------------- inloggen */

  useEffect(() => {
    let vorigeUid = null;

    const stop = onAuthStateChanged(auth, (u) => {
      const uid = u ? u.uid : null;
      const gewisseld = uid !== vorigeUid;
      vorigeUid = uid;

      setGebruiker(u || null);
      setAuthKlaar(true);
      if (!gewisseld) return;

      // Bij elke wissel gaan de gegevens van de vorige situatie weg — ook bij
      // inloggen, niet alleen bij uitloggen. Deden we dat niet, dan was er na
      // opnieuw inloggen één render waarin de app een ingelogde gebruiker zag
      // met nul teams: de gegevens van de vorige waren al gewist en die van de
      // nieuwe nog niet binnen. Op grond daarvan stuurde hij door naar het
      // welkomscherm, en dat adres bleef staan als de gegevens er eenmaal
      // waren. Je logde in en kwam uit bij "Bij een ander team aansluiten".
      setGebruikerDoc(null);
      setKenmerken([]);
      setHandleiding({});
      setProfiel(null);
      setVoorstellen([]);

      // Zonder gebruiker valt er niets op te halen en zijn we meteen klaar.
      // Mét gebruiker begint het ophalen juist, dus zijn we dat nog niet.
      setGegevensKlaar(!u);
    });

    return () => stop();
  }, []);

/**
 * Het adres waar de inloglink naar terugkeert.
 *
 * Bewust vast op www voor de echte site: vraag je de inloglink aan op
 * mijnteamkompas.nl en kom je terug op www.mijnteamkompas.nl (of andersom), dan
 * zijn dat voor de browser twee verschillende adressen. Het onthouden
 * e-mailadres staat dan aan de andere kant en de app vraagt er onnodig opnieuw
 * om. Lokaal ontwikkelen blijft gewoon werken.
 */
function terugkeeradres() {
  const host = window.location.hostname;
  if (host.endsWith("mijnteamkompas.nl")) return "https://www.mijnteamkompas.nl/app/inloggen";
  return `${window.location.origin}/app/inloggen`;
}

  /**
   * Vraagt een inloglink aan.
   *
   * Ging via Firebase zelf, gaat nu via onze eigen functie. Reden: de afzender
   * van Firebase is noreply@<project>.firebaseapp.com, en die mail belandt bij
   * vrijwel iedereen in de spammap. Het sjabloon van de inloglink is bovendien
   * als enige niet aan te passen — vandaar de Engelse datum en het "u".
   *
   * Het inloggen zelf is niet veranderd: dezelfde link, dezelfde eenmalige
   * code, dezelfde controle door Firebase. Alleen het versturen is van ons.
   */
  const stuurInloglink = useCallback(async (email) => {
    const schoon = String(email || "").trim().toLowerCase();
    if (!schoon) throw new Error("Vul een e-mailadres in.");

    const functies = getFunctions(undefined, "us-central1");
    await httpsCallable(functies, "stuurInloglink")({
      email: schoon,
      terug: terugkeeradres(),
    });

    schrijfOpslag(SLEUTEL_EMAIL, schoon);
    return schoon;
  }, []);

  const isInloglink = useCallback(() => isSignInWithEmailLink(auth, window.location.href), []);

  const voltooiInloggen = useCallback(async (emailAlsGevraagd) => {
    const email = emailAlsGevraagd || leesOpslag(SLEUTEL_EMAIL);
    if (!email) return { nodig: "email" };
    await signInWithEmailLink(auth, email, window.location.href);
    schrijfOpslag(SLEUTEL_EMAIL, null);
    // De inloglink staat nog in de adresbalk en is eenmalig. Laten we hem
    // staan, dan blijft de app denken dat er nog ingelogd moet worden en komt
    // hij niet voorbij het aanmeldscherm. Bovendien is een gebruikte
    // inloglink niets om in de geschiedenis te bewaren.
    window.history.replaceState({}, "", "/app");
    return { nodig: null };
  }, []);

  const logUit = useCallback(async () => {
    await signOut(auth);
    schrijfOpslag(SLEUTEL_TEAM, null);
    setActiefTeamSleutel(null);
  }, []);

  /* -------------------------------------------------------------- gegevens */

  const laadGegevens = useCallback(async (uid, email) => {
    setGegevensKlaar(false);
    let doc = await haalGebruiker(uid);
    if (!doc) doc = await maakGebruiker(uid, { naam: "", email: email || "" });

    const [eigenKenmerken, eigenHandleiding, eigenProfiel] = await Promise.all([
      haalKenmerken(uid),
      haalHandleiding(uid),
      haalProfiel(uid),
    ]);

    // Staat er ergens een profielvoorstel van een facilitator klaar? Dat halen
    // we op zodat de app het kan tonen; overnemen doet de gebruiker zelf.
    const lidmaatschappenUitDoc = (doc && doc.lidmaatschappen) || [];

    const [
      openstaandeVoorstellen,
      eigenExperimenten,
      openstaandeTeksten,
      rollen,
      eigenSessies,
      eigenReflecties,
    ] = await Promise.all([
      Promise.all(
        lidmaatschappenUitDoc.map((l) =>
          haalVoorstel({ orgId: l.orgId, teamId: l.teamId, uid }).catch(() => null)
        )
      ),
      // Wat je aan jezelf probeert te veranderen. Strikt van jou: niet zichtbaar
      // voor je team en ook niet voor de makers.
      haalEigenExperimenten(uid).catch(() => []),
      // Tekst die een facilitator uit een teamsessie voor je klaarzette. Staat
      // los van het profielvoorstel: dat komt uit een Insights-PDF en verdwijnt
      // zodra je het overneemt, dit zijn je eigen woorden en blijft staan tot
      // jij zegt dat je ermee klaar bent.
      Promise.all(
        lidmaatschappenUitDoc.map((l) =>
          haalHandleidingvoorstel({ orgId: l.orgId, teamId: l.teamId, uid }).catch(() => null)
        )
      ),
      // Je rol per team; zie haalEigenRollen. Nodig om te weten in welke teams
      // je meedoet en welke je alleen begeleidt.
      haalEigenRollen(uid, lidmaatschappenUitDoc).catch(() => ({})),
      // Waar je advies over vroeg, om na een dag of wat te kunnen vragen hoe
      // dat gesprek ging. Er staat geen persoon bij, en dat blijft zo.
      haalEigenAdviessessies(uid).catch(() => []),
      haalEigenReflecties(uid).catch(() => []),
    ]);
    const openstaand = openstaandeVoorstellen.filter(Boolean);

    setGebruikerDoc(doc);
    setKenmerken(eigenKenmerken);
    setHandleiding(eigenHandleiding);
    setProfiel(eigenProfiel);
    setVoorstellen(openstaand);
    setTekstvoorstellen(openstaandeTeksten.filter(Boolean));
    setExperimenten(eigenExperimenten);
    setSessies(eigenSessies);
    setReflecties(eigenReflecties);
    setMijnRollen(rollen);
    setGegevensKlaar(true);
    return doc;
  }, []);

  useEffect(() => {
    if (!gebruiker) return;
    laadGegevens(gebruiker.uid, gebruiker.email).catch(() => setGegevensKlaar(true));
  }, [gebruiker, laadGegevens]);

  const lidmaatschappen = useMemo(
    () => (gebruikerDoc && gebruikerDoc.lidmaatschappen) || [],
    [gebruikerDoc]
  );

  const actiefTeam = useMemo(() => {
    if (lidmaatschappen.length === 0) return null;
    const gevonden = lidmaatschappen.find(
      (l) => `${l.orgId}/${l.teamId}` === actiefTeamSleutel
    );
    return gevonden || lidmaatschappen[0];
  }, [lidmaatschappen, actiefTeamSleutel]);

  // Begeleid je een team, dan doe je er zelf niet aan mee: je hoort niet tussen
  // de teamgenoten en de app vraagt je niet je profiel met die klant te delen.
  // De rol staat in het ledendocument — dezelfde plek waar de securityregels
  // naar kijken — en wordt hier één keer per team afgeleid, zodat elk scherm
  // hetzelfde zegt. Ook voor teams waar je nu niet in werkt: op je profiel
  // staat een vinkje per team, en daar hoort een team dat je begeleidt niet bij.
  const begeleideTeams = useMemo(
    () =>
      Object.keys(mijnRollen || {}).filter((sleutel) => mijnRollen[sleutel] === BEGELEIDER),
    [mijnRollen]
  );

  const ikBegeleid = useMemo(
    () => Boolean(actiefTeam) && begeleideTeams.includes(`${actiefTeam.orgId}/${actiefTeam.teamId}`),
    [actiefTeam, begeleideTeams]
  );

  /**
   * Het team waar je nu in werkt: wie erin zitten en wat zij gedeeld hebben.
   * Eén keer ophalen op deze plek, zodat elk scherm hetzelfde weet en de
   * volgende stap overal gelijk uitpakt.
   */
  const laadTeamOverzicht = useCallback(async (l) => {
    if (!l) {
      setTeamOverzicht({
        team: null, leden: [], gedeeld: {}, profielleden: [], afspraken: [], laden: false,
      });
      return;
    }
    setTeamOverzicht((t) => ({ ...t, laden: true }));
    try {
      const [team, leden, gedeeld, profielleden, afspraken] = await Promise.all([
        haalTeam(l.orgId, l.teamId),
        haalTeamleden(l.orgId, l.teamId),
        haalGedeeldVanTeam(l.orgId, l.teamId),
        haalProfielleden(l.orgId, l.teamId).catch(() => []),
        haalAfspraken(l.orgId, l.teamId).catch(() => []),
      ]);
      setTeamOverzicht({ team, leden, gedeeld, profielleden, afspraken, laden: false });
    } catch {
      setTeamOverzicht({
        team: null, leden: [], gedeeld: {}, profielleden: [], afspraken: [], laden: false,
      });
    }
  }, []);

  useEffect(() => {
    if (!gebruiker) return;
    laadTeamOverzicht(actiefTeam);
  }, [gebruiker, actiefTeam, laadTeamOverzicht]);

  const kiesTeam = useCallback((sleutel) => {
    setActiefTeamSleutel(sleutel);
    schrijfOpslag(SLEUTEL_TEAM, sleutel);
  }, []);

  /* --------------------------------------------------------------- acties */

  const naam = (gebruikerDoc && gebruikerDoc.naam) || "";
  const functie = (gebruikerDoc && gebruikerDoc.functie) || "";

  const synchroniseerGedeeld = useCallback(
    async (nieuweKenmerken, nieuweHandleiding) => {
      if (!gebruiker) return;
      await werkAlleGedeeldBij({
        uid: gebruiker.uid,
        naam,
        lidmaatschappen,
        kenmerken: nieuweKenmerken,
        handleiding: nieuweHandleiding,
      });
    },
    [gebruiker, naam, lidmaatschappen]
  );

  /**
   * Je naam en je functie: het eerste is verplicht, het tweede optioneel.
   *
   * Allebei gaan ze mee naar elk team waar je lid van bent — daar is een
   * functie voor. Wat je met een team deelt aan kenmerken en handleiding staat
   * hier los van; dat blijft jouw keuze per punt.
   */
  const zetProfielgegevens = useCallback(
    async ({ naam: nieuweNaam, functie: nieuweFunctie } = {}) => {
      if (!gebruiker) return;

      const velden = {};
      if (nieuweNaam !== undefined) velden.naam = nieuweNaam;
      if (nieuweFunctie !== undefined) velden.functie = nieuweFunctie;
      if (Object.keys(velden).length === 0) return;

      await werkGebruikerBij(gebruiker.uid, velden);
      setGebruikerDoc((d) => ({ ...(d || {}), ...velden }));

      await werkLidgegevensBij({
        uid: gebruiker.uid,
        lidmaatschappen,
        naam: velden.naam !== undefined ? velden.naam : naam,
        functie: velden.functie !== undefined ? velden.functie : functie,
      });
    },
    [gebruiker, lidmaatschappen, naam, functie]
  );

  const zetNaam = useCallback(
    (nieuweNaam) => zetProfielgegevens({ naam: nieuweNaam }),
    [zetProfielgegevens]
  );

  const bewaarKenmerk = useCallback(
    async (kenmerk) => {
      if (!gebruiker) return;
      const opgeslagen = await bewaarKenmerkInDb(gebruiker.uid, kenmerk);
      const nieuw = [
        ...kenmerken.filter((k) => k.kenmerkId !== opgeslagen.kenmerkId),
        opgeslagen,
      ];
      setKenmerken(nieuw);
      await synchroniseerGedeeld(nieuw, handleiding);
    },
    [gebruiker, kenmerken, handleiding, synchroniseerGedeeld]
  );

  const bewaarMeerKenmerken = useCallback(
    async (lijst) => {
      if (!gebruiker || lijst.length === 0) return;
      const opgeslagen = await bewaarKenmerkenInDb(gebruiker.uid, lijst);
      const ids = opgeslagen.map((k) => k.kenmerkId);
      const nieuw = [...kenmerken.filter((k) => !ids.includes(k.kenmerkId)), ...opgeslagen];
      setKenmerken(nieuw);
      await synchroniseerGedeeld(nieuw, handleiding);
    },
    [gebruiker, kenmerken, handleiding, synchroniseerGedeeld]
  );

  const bewaarSectie = useCallback(
    async (sectieGegevens) => {
      if (!gebruiker) return;
      const opgeslagen = await bewaarSectieInDb(gebruiker.uid, sectieGegevens);
      const nieuw = { ...handleiding, [opgeslagen.sectieId]: opgeslagen };
      setHandleiding(nieuw);
      await synchroniseerGedeeld(kenmerken, nieuw);
    },
    [gebruiker, handleiding, kenmerken, synchroniseerGedeeld]
  );

  /**
   * Zet de rol van iemand in het team waar je nu in werkt.
   *
   * Eén bijzonderheid: wie zichzelf op begeleiden zet, doet niet meer mee aan
   * dit team. Dan hoort er ook niets meer van hem gedeeld te staan. Alleen de
   * gedeelde kopie weggooien is niet genoeg — dan blijven de vinkjes op je
   * eigen profiel staan en zegt het profielscherm dat je nog deelt terwijl je
   * teamgenoten niets zien. De vinkjes gaan dus eerst weg, en de kopie volgt
   * daar vanzelf uit.
   */
  const zetRol = useCallback(
    async ({ uid, rol }) => {
      if (!gebruiker || !actiefTeam) return;
      const { orgId, teamId } = actiefTeam;
      const sleutel = `${orgId}/${teamId}`;

      if (rol === BEGELEIDER && uid === gebruiker.uid) {
        const zonderDitTeam = (lijst) => (lijst || []).filter((s) => s !== sleutel);

        const geraakteKenmerken = kenmerken
          .filter((k) => (k.gedeeldMet || []).includes(sleutel))
          .map((k) => ({ ...k, gedeeldMet: zonderDitTeam(k.gedeeldMet) }));

        const geraakteSecties = Object.values(handleiding || {})
          .filter((s) => s && (s.gedeeldMet || []).includes(sleutel))
          .map((s) => ({ ...s, gedeeldMet: zonderDitTeam(s.gedeeldMet) }));

        if (geraakteKenmerken.length > 0) await bewaarMeerKenmerken(geraakteKenmerken);
        for (const sectie of geraakteSecties) await bewaarSectie(sectie);
      }

      await zetTeamrolInDb({ orgId, teamId, uid, rol });
      // Je eigen rol staat ook in de kaart die bij het inloggen is opgehaald.
      // Die hier meteen bijwerken scheelt een volledige herlaadronde — en zonder
      // dit blijft het profielscherm een vinkje tonen voor een team dat je net
      // bent gaan begeleiden.
      if (uid === gebruiker.uid) setMijnRollen((r) => ({ ...r, [sleutel]: rol }));
      await laadTeamOverzicht(actiefTeam);
    },
    [
      gebruiker,
      actiefTeam,
      kenmerken,
      handleiding,
      bewaarMeerKenmerken,
      bewaarSectie,
      laadTeamOverzicht,
    ]
  );

  /**
   * De klaargezette handleidingtekst wegdoen.
   *
   * Overnemen gebeurt per stukje in het tekstvak, want het zijn jouw woorden en
   * je moet ze kunnen bijstellen voordat ze ergens staan. Ben je ze langsgelopen,
   * dan haal je het voorstel hier weg — daarna staat er niets meer over jou op
   * een plek waar de beheerder bij kan.
   */
  const wijsTekstvoorstelAf = useCallback(
    async (voorstel) => {
      if (!gebruiker || !voorstel) return;
      await verwijderHandleidingvoorstel({
        orgId: voorstel.orgId,
        teamId: voorstel.teamId,
        uid: gebruiker.uid,
      });
      setTekstvoorstellen((lijst) =>
        lijst.filter((v) => !(v.orgId === voorstel.orgId && v.teamId === voorstel.teamId))
      );
    },
    [gebruiker]
  );

  /**
   * Een teamafspraak opschrijven of bijstellen.
   *
   * Van het team samen: iedereen mag het, en er staat bij wie hem opschreef.
   * Geef je een id mee, dan stel je een bestaande bij en blijft de herkomst
   * staan; zonder id komt er een nieuwe bij. Zie afspraken.js.
   */
  const bewaarAfspraak = useCallback(
    async ({ id, tekst, toelichting }) => {
      if (!gebruiker || !actiefTeam) return null;
      const uit = await bewaarAfspraakInDb({
        orgId: actiefTeam.orgId,
        teamId: actiefTeam.teamId,
        id,
        tekst,
        toelichting,
        uid: gebruiker.uid,
        naam,
      });
      await laadTeamOverzicht(actiefTeam);
      return uit;
    },
    [gebruiker, actiefTeam, naam, laadTeamOverzicht]
  );

  /** Een afspraak weghalen. Alleen de beheerder; zie firestore.rules. */
  const verwijderAfspraak = useCallback(
    async (id) => {
      if (!actiefTeam) return;
      await verwijderAfspraakInDb({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId, id });
      await laadTeamOverzicht(actiefTeam);
    },
    [actiefTeam, laadTeamOverzicht]
  );

  /**
   * Een kleine actie dertig dagen proberen.
   *
   * Waar het advies over ging slaan we niet op — geen naam, geen collega. Wat
   * er blijft staan is de actie. Zie experimenten.js.
   */
  const startExperiment = useCallback(
    async ({ actie, situatieId, situatieLabel }) => {
      if (!gebruiker) return null;
      const id = await startExperimentInDb({
        uid: gebruiker.uid,
        actie,
        situatieId,
        situatieLabel,
      });
      setExperimenten(await haalEigenExperimenten(gebruiker.uid).catch(() => experimenten));
      return id;
    },
    [gebruiker, experimenten]
  );

  /**
   * Terugkijken op een gesprek dat je hebt gevoerd.
   *
   * De sessie waar het bij hoort gaat mee, zodat dezelfde vraag niet morgen
   * opnieuw gesteld wordt. Wie erbij was, gaat niet mee — dat weet de app niet
   * en het hoort ook niet ergens te komen staan. Zie reflecties.js.
   */
  const bewaarReflectie = useCallback(
    async ({ sessieId, situatieId, situatieLabel, terugblik, tekst }) => {
      if (!gebruiker) return null;
      const id = await bewaarReflectieInDb({
        uid: gebruiker.uid,
        sessieId,
        situatieId,
        situatieLabel,
        terugblik,
        tekst,
      });
      setReflecties(await haalEigenReflecties(gebruiker.uid).catch(() => reflecties));
      return id;
    },
    [gebruiker, reflecties]
  );

  const blikTerug = useCallback(
    async ({ id, uitkomst, tekst }) => {
      if (!gebruiker) return;
      await blikTerugInDb({ id, uitkomst, tekst });
      setExperimenten(await haalEigenExperimenten(gebruiker.uid).catch(() => experimenten));
    },
    [gebruiker, experimenten]
  );

  const bewaarInsights = useCallback(
    async (insights) => {
      if (!gebruiker) return;
      await bewaarInsightsInDb(gebruiker.uid, insights);
      setProfiel((p) => ({ ...(p || {}), insights }));
    },
    [gebruiker]
  );

  const wisInsights = useCallback(async () => {
    if (!gebruiker) return;
    await wisInsightsInDb(gebruiker.uid);
    setProfiel((p) => ({ ...(p || {}), insights: null }));
  }, [gebruiker]);

  /**
   * Neemt een ingelezen Insights-profiel over.
   *
   * Wat je zelf hebt ingevuld of bevestigd blijft staan: de suggesties vullen
   * alleen de gaten. De punten uit de profieltekst worden apart bewaard als
   * naslag; ze komen nooit vanzelf in een handleidingtekst en worden nooit
   * vanzelf gedeeld.
   */
  const neemInsightsOver = useCallback(
    async ({ voorkeurskleur, tweedeKleur, teksten }) => {
      if (!gebruiker || !voorkeurskleur) return 0;
      const nieuweInsights = { voorkeurskleur, tweedeKleur: tweedeKleur || null };
      await bewaarInsightsInDb(gebruiker.uid, nieuweInsights);

      const heeftTeksten = teksten && Object.keys(teksten).length > 0;
      if (heeftTeksten) await bewaarProfielteksten(gebruiker.uid, teksten);

      setProfiel((p) => ({
        ...(p || {}),
        insights: nieuweInsights,
        ...(heeftTeksten ? { insightsTeksten: teksten } : {}),
      }));

      const bestaand = {};
      kenmerken.forEach((k) => {
        bestaand[k.kenmerkId] = k;
      });

      const nieuw = kenmerkenUitInsights(nieuweInsights)
        .filter((a) => {
          const b = bestaand[a.kenmerkId];
          return !b || (!b.bevestigd && b.bron === "insights_discovery");
        })
        .map((a) => ({
          ...a,
          gedeeldMet: (bestaand[a.kenmerkId] && bestaand[a.kenmerkId].gedeeldMet) || [],
        }));

      if (nieuw.length > 0) await bewaarMeerKenmerken(nieuw);
      return nieuw.length;
    },
    [gebruiker, kenmerken, bewaarMeerKenmerken]
  );

  const wijsVoorstelAf = useCallback(async (voorstel) => {
    await verwijderVoorstel(voorstel);
    setVoorstellen((lijst) =>
      lijst.filter((v) => !(v.orgId === voorstel.orgId && v.teamId === voorstel.teamId))
    );
  }, []);

  const neemVoorstelOver = useCallback(
    async (voorstel) => {
      const aantal = await neemInsightsOver(voorstel);
      await wijsVoorstelAf(voorstel);
      return aantal;
    },
    [neemInsightsOver, wijsVoorstelAf]
  );

  const maakTeam = useCallback(
    async ({ organisatieNaam, teamNaam, mijnNaam, begeleid = false }) => {
      if (!gebruiker) return null;
      if (mijnNaam && mijnNaam !== naam) await zetNaam(mijnNaam);
      const lidmaatschap = await maakOrganisatieMetTeam({
        uid: gebruiker.uid,
        naam: mijnNaam || naam,
        organisatieNaam,
        teamNaam,
        begeleid,
      });
      await laadGegevens(gebruiker.uid, gebruiker.email);
      kiesTeam(`${lidmaatschap.orgId}/${lidmaatschap.teamId}`);
      return lidmaatschap;
    },
    [gebruiker, naam, zetNaam, laadGegevens, kiesTeam]
  );

  const doeMee = useCallback(
    async ({ code, mijnNaam }) => {
      if (!gebruiker) return null;
      if (mijnNaam && mijnNaam !== naam) await zetNaam(mijnNaam);
      const lidmaatschap = await treedToeMetCode({
        uid: gebruiker.uid,
        naam: mijnNaam || naam,
        code,
      });
      if (!lidmaatschap) return null;
      await laadGegevens(gebruiker.uid, gebruiker.email);
      kiesTeam(`${lidmaatschap.orgId}/${lidmaatschap.teamId}`);
      return lidmaatschap;
    },
    [gebruiker, naam, zetNaam, laadGegevens, kiesTeam]
  );

  const verlaatTeam = useCallback(
    async ({ orgId, teamId }) => {
      if (!gebruiker) return;
      await verlaatTeamInDb({ uid: gebruiker.uid, orgId, teamId });
      await laadGegevens(gebruiker.uid, gebruiker.email);
    },
    [gebruiker, laadGegevens]
  );

  const verwijderTeam = useCallback(
    async ({ orgId, teamId, code }) => {
      if (!gebruiker) return;
      await verwijderTeamInDb({ uid: gebruiker.uid, orgId, teamId, code });
      kiesTeam(null);
      await laadGegevens(gebruiker.uid, gebruiker.email);
    },
    [gebruiker, kiesTeam, laadGegevens]
  );

  const verwijderAlles = useCallback(async () => {
    if (!gebruiker) return;
    await verwijderEigenGegevensInDb(gebruiker.uid);
    await logUit();
  }, [gebruiker, logUit]);

  const waarde = useMemo(
    () => ({
      gebruiker,
      authKlaar,
      gegevensKlaar,
      gebruikerDoc,
      naam,
      functie,
      lidmaatschappen,
      actiefTeam,
      kenmerken,
      handleiding,
      profiel,
      uitnodigingscode,
      vergeetUitnodiging,
      teamOverzicht,
      ikBegeleid,
      begeleideTeams,
      zetRol,
      bewaarAfspraak,
      verwijderAfspraak,
      experimenten,
      startExperiment,
      blikTerug,
      sessies,
      reflecties,
      bewaarReflectie,
      herlaadTeam: () => laadTeamOverzicht(actiefTeam),
      voorstellen,
      tekstvoorstellen,
      wijsTekstvoorstelAf,
      neemInsightsOver,
      neemVoorstelOver,
      wijsVoorstelAf,
      kiesTeam,
      stuurInloglink,
      isInloglink,
      voltooiInloggen,
      logUit,
      zetNaam,
      zetProfielgegevens,
      bewaarKenmerk,
      bewaarMeerKenmerken,
      bewaarSectie,
      bewaarInsights,
      wisInsights,
      maakTeam,
      doeMee,
      verlaatTeam,
      verwijderTeam,
      verwijderAlles,
      herlaad: () => (gebruiker ? laadGegevens(gebruiker.uid, gebruiker.email) : null),
    }),
    [
      gebruiker, authKlaar, gegevensKlaar, gebruikerDoc, naam, functie, lidmaatschappen, actiefTeam,
      kenmerken, handleiding, profiel, uitnodigingscode, vergeetUitnodiging, teamOverzicht, ikBegeleid, begeleideTeams, zetRol, bewaarAfspraak, verwijderAfspraak, experimenten, startExperiment, blikTerug, sessies, reflecties, bewaarReflectie, laadTeamOverzicht, voorstellen, tekstvoorstellen, wijsTekstvoorstelAf, neemInsightsOver, neemVoorstelOver,
      wijsVoorstelAf, kiesTeam, stuurInloglink, isInloglink, voltooiInloggen,
      logUit, zetNaam, bewaarKenmerk, bewaarMeerKenmerken, bewaarSectie, bewaarInsights,
      wisInsights, maakTeam, doeMee, verlaatTeam, verwijderTeam, verwijderAlles, laadGegevens,
    ]
  );

  return <AppContext.Provider value={waarde}>{children}</AppContext.Provider>;
}

export default AppProvider;
