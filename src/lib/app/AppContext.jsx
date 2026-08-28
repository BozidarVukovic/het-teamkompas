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
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { kenmerkenUitInsights } from "./insights";
import { haalVoorstel, verwijderVoorstel } from "./voorstellen";
import {
  bewaarInsights as bewaarInsightsInDb,
  bewaarProfielteksten,
  bewaarKenmerk as bewaarKenmerkInDb,
  bewaarKenmerken as bewaarKenmerkenInDb,
  bewaarSectie as bewaarSectieInDb,
  haalGebruiker,
  haalHandleiding,
  haalKenmerken,
  haalProfiel,
  maakGebruiker,
  maakOrganisatieMetTeam,
  treedToeMetCode,
  verlaatTeam as verlaatTeamInDb,
  verwijderEigenGegevens as verwijderEigenGegevensInDb,
  werkAlleGedeeldBij,
  werkGebruikerBij,
  wisInsights as wisInsightsInDb,
} from "./opslag";

const SLEUTEL_EMAIL = "teamkompas.app.email";
const SLEUTEL_TEAM = "teamkompas.app.actiefTeam";

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
  const [actiefTeamSleutel, setActiefTeamSleutel] = useState(() => leesOpslag(SLEUTEL_TEAM));

  /* ------------------------------------------------------------- inloggen */

  useEffect(() => {
    const stop = onAuthStateChanged(auth, (u) => {
      setGebruiker(u || null);
      setAuthKlaar(true);
      if (!u) {
        setGebruikerDoc(null);
        setKenmerken([]);
        setHandleiding({});
        setProfiel(null);
        setVoorstellen([]);
        setGegevensKlaar(true);
      }
    });
    return () => stop();
  }, []);

  const stuurInloglink = useCallback(async (email) => {
    const schoon = String(email || "").trim().toLowerCase();
    if (!schoon) throw new Error("Vul een e-mailadres in.");
    await sendSignInLinkToEmail(auth, schoon, {
      url: `${window.location.origin}/app/inloggen`,
      handleCodeInApp: true,
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
    // De koppeling staat nog in de adresbalk en is eenmalig. Laten we hem
    // staan, dan blijft de app denken dat er nog ingelogd moet worden en komt
    // hij niet voorbij het aanmeldscherm. Bovendien is een gebruikte
    // inlogkoppeling niets om in de geschiedenis te bewaren.
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
    const openstaand = (
      await Promise.all(
        ((doc && doc.lidmaatschappen) || []).map((l) =>
          haalVoorstel({ orgId: l.orgId, teamId: l.teamId, uid }).catch(() => null)
        )
      )
    ).filter(Boolean);

    setGebruikerDoc(doc);
    setKenmerken(eigenKenmerken);
    setHandleiding(eigenHandleiding);
    setProfiel(eigenProfiel);
    setVoorstellen(openstaand);
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

  const kiesTeam = useCallback((sleutel) => {
    setActiefTeamSleutel(sleutel);
    schrijfOpslag(SLEUTEL_TEAM, sleutel);
  }, []);

  /* --------------------------------------------------------------- acties */

  const naam = (gebruikerDoc && gebruikerDoc.naam) || "";

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

  const zetNaam = useCallback(
    async (nieuweNaam) => {
      if (!gebruiker) return;
      await werkGebruikerBij(gebruiker.uid, { naam: nieuweNaam });
      setGebruikerDoc((d) => ({ ...(d || {}), naam: nieuweNaam }));
    },
    [gebruiker]
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
    async ({ organisatieNaam, teamNaam, mijnNaam }) => {
      if (!gebruiker) return null;
      if (mijnNaam && mijnNaam !== naam) await zetNaam(mijnNaam);
      const lidmaatschap = await maakOrganisatieMetTeam({
        uid: gebruiker.uid,
        naam: mijnNaam || naam,
        organisatieNaam,
        teamNaam,
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
      lidmaatschappen,
      actiefTeam,
      kenmerken,
      handleiding,
      profiel,
      voorstellen,
      neemInsightsOver,
      neemVoorstelOver,
      wijsVoorstelAf,
      kiesTeam,
      stuurInloglink,
      isInloglink,
      voltooiInloggen,
      logUit,
      zetNaam,
      bewaarKenmerk,
      bewaarMeerKenmerken,
      bewaarSectie,
      bewaarInsights,
      wisInsights,
      maakTeam,
      doeMee,
      verlaatTeam,
      verwijderAlles,
      herlaad: () => (gebruiker ? laadGegevens(gebruiker.uid, gebruiker.email) : null),
    }),
    [
      gebruiker, authKlaar, gegevensKlaar, gebruikerDoc, naam, lidmaatschappen, actiefTeam,
      kenmerken, handleiding, profiel, voorstellen, neemInsightsOver, neemVoorstelOver,
      wijsVoorstelAf, kiesTeam, stuurInloglink, isInloglink, voltooiInloggen,
      logUit, zetNaam, bewaarKenmerk, bewaarMeerKenmerken, bewaarSectie, bewaarInsights,
      wisInsights, maakTeam, doeMee, verlaatTeam, verwijderAlles, laadGegevens,
    ]
  );

  return <AppContext.Provider value={waarde}>{children}</AppContext.Provider>;
}

export default AppProvider;
