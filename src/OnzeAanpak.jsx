import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
<<<<<<< HEAD
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDgl6gj1LmOZ-1Mcin1jNfkkZg82c2Jtz0",
  authDomain: "mijn-teamkompas-6de84.firebaseapp.com",
  projectId: "mijn-teamkompas-6de84",
  storageBucket: "mijn-teamkompas-6de84.firebasestorage.app",
  messagingSenderId: "820620515571",
  appId: "1:820620515571:web:86a4e792eebe4c7cf03f86",
};
const EMAILJS_SERVICE_ID = "service_eytet3a";
const EMAILJS_TEMPLATE_ID = "pysvu9a";
const EMAILJS_PUBLIC_KEY = "aXtk48FJxZBI-fBNQ";
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
=======
import ContactModal from "./ContactModal";
>>>>>>> 7bf14c5 (update homepage met klantreis keuze)

const PUB = {
  donker: "#0D1B2A",
  navy: "#1A2E4A",
  teal: "#0F766E",
  tealDark: "#0B5F5A",
  tealGlow: "rgba(0,168,150,0.15)",
  groen: "#5A8C3C",
  blauw: "#3A7DBF",
  paars: "#6B4E9E",
  oranje: "#E8821A",
  licht: "#F4F7F9",
  wit: "#FFFFFF",
  sub: "#6B7A8D",
  lijn: "#dde4ed",
};

const images = {
  hero: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=90&fit=crop&crop=faces",
  team: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&fit=crop&crop=center",
  workshop: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&fit=crop&crop=center",
  zorg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&fit=crop&crop=center",
};

function KompasDot({ size = 26 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${PUB.groen}, ${PUB.blauw}, ${PUB.oranje}, ${PUB.paars}, ${PUB.groen})`, padding: 3 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: PUB.donker }} />
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>{children}</div>;
}

function Card({ children, topColor }) {
  return (
    <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderTop: topColor ? `5px solid ${topColor}` : `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 24, boxShadow: "0 14px 34px rgba(13,27,42,0.06)", height: "100%" }}>
      {children}
    </div>
  );
}

export default function OnzeAanpakPage() {
  const ctaStyle = { background: PUB.teal, color: PUB.wit, padding: "14px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "none", display: "inline-block", boxShadow: "0 12px 28px rgba(15,118,110,0.24)", border: "none" };
  const [modalOpen, setModalOpen] = useState(false);
<<<<<<< HEAD
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ naam: "", organisatie: "", teamgrootte: "", email: "", telefoon: "", gewensteStap: "Kennismaking", bericht: "" });

  const openModal = () => {
    setStatus("idle");
    setForm({ naam: "", organisatie: "", teamgrootte: "", email: "", telefoon: "", gewensteStap: "Kennismaking", bericht: "" });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    if (!form.naam || !form.email) { setStatus("error"); return; }
    setStatus("sending");
    try {
      await addDoc(collection(db, "contactaanvragen"), { ...form, status: "Nieuw", bron: "Onze aanpak", aangemaakt_op: serverTimestamp() });
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_naam: form.naam,
            from_organisatie: form.organisatie,
            from_email: form.email,
            from_telefoon: form.telefoon,
            teamgrootte: form.teamgrootte,
            gewenste_stap: form.gewensteStap,
            bericht: form.bericht,
            to_email: "info@mijnteamkompas.nl",
          },
        }),
      });
      if (!res.ok) console.warn("EmailJS gaf geen 200-response");
      setStatus("sent");
    } catch (error) {
      console.error("Fout bij versturen:", error);
      setStatus("error");
    }
  };
=======
  const openModal = () => setModalOpen(true);

  const closeModal = () => setModalOpen(false);
>>>>>>> 7bf14c5 (update homepage met klantreis keuze)

  const domeinen = [
    ["Veiligheid & leiderschap", PUB.groen, "We kijken of mensen zich vrij voelen om eerlijk te zijn, vragen te stellen en initiatief te nemen. Zonder veiligheid ontstaat weinig echte beweging."],
    ["Energie & motivatie", PUB.oranje, "We onderzoeken waar het werk energie geeft en waar het team structureel leegloopt. Kleine dagelijkse frustraties zijn vaak groter dan ze lijken."],
    ["Verandering & betekenis", PUB.teal, "We kijken hoe verandering wordt ervaren. Begrijpen mensen waarom iets nodig is, voelt het haalbaar en sluit het aan bij wat vertrouwd is?"],
    ["Verbeteren & leren", PUB.paars, "We kijken of verbeterideeën zichtbaar worden, besproken worden en landen in dagelijks gedrag. Leren wordt pas waardevol als het praktisch wordt."],
  ];

  const stappen = [
    ["1", "Waarnemen", "We starten met luisteren, kijken en zorgvuldig ophalen wat er speelt."],
    ["2", "Duiden", "We verbinden signalen uit de teamscan, gesprekken en context tot een helder beeld."],
    ["3", "Bewegen", "We vertalen het beeld naar een workshop, teamdag of gerichte interventie."],
    ["4", "Borgen", "We zorgen dat inzichten niet verdwijnen, maar terugkomen in werkafspraken en gedrag."],
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Onze aanpak | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek hoe Mijn Teamkompas teamontwikkeling benadert via vier teamscandomeinen en Insights Discovery als gedragslens." />
      </Helmet>

      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, background: PUB.wit }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(13,27,42,0.97)", borderBottom: "1px solid rgba(0,168,150,0.2)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <KompasDot />
            <span style={{ color: PUB.wit, fontWeight: 700, fontSize: 18 }}>Mijn Teamkompas</span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.68)", textDecoration: "none", fontSize: 13 }}>Home</a>
            <a href="/#teamscan" style={{ color: "rgba(255,255,255,0.68)", textDecoration: "none", fontSize: 13 }}>Teamscan</a>
            <button type="button" onClick={openModal} style={{ background: "transparent", border: "none", padding: 0, color: "rgba(255,255,255,0.68)", textDecoration: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Contact</button>
            <button type="button" onClick={openModal} style={{ background: PUB.licht, color: PUB.donker, padding: "10px 18px", borderRadius: 999, fontSize: 12, fontWeight: 800, textDecoration: "none", border: "none", cursor: "pointer" }}>Neem contact op</button>
          </nav>
        </header>

        <section style={{ background: `linear-gradient(135deg, ${PUB.donker} 0%, ${PUB.navy} 62%, #10253A 100%)`, minHeight: "72vh", display: "grid", gridTemplateColumns: "1.05fr .95fr", alignItems: "center", overflow: "hidden" }}>
          <div style={{ padding: "78px 58px 78px 72px", position: "relative", zIndex: 2 }}>
            <SectionLabel>Onze aanpak</SectionLabel>
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, color: PUB.wit, margin: "0 0 20px", letterSpacing: "-0.03em" }}>We maken zichtbaar wat samenwerking helpt of belemmert.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 680, marginBottom: 26 }}>Mijn Teamkompas combineert een praktische teamscan met veranderkundige duiding. De teamscan brengt vier domeinen in beeld. Insights Discovery gebruiken we als gedragslens om te begrijpen hoe dit specifieke team communiceert, reageert en samenwerkt.</p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={openModal} style={ctaStyle}>Bespreek jullie situatie</button>
              <span style={{ color: "rgba(255,255,255,0.58)", fontSize: 14 }}>Van teamscan naar gesprek, duiding en concrete beweging.</span>
            </div>
          </div>
          <div style={{ minHeight: "72vh", position: "relative" }}>
            <img src={images.hero} alt="Teamcoaching sessie waarin teamleden in gesprek zijn over samenwerking en leiderschap" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", opacity: 0.92, filter: "saturate(0.94) contrast(1.04)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,27,42,0.94) 0%, rgba(13,27,42,0.54) 38%, rgba(13,27,42,0.06) 100%)" }} />
            <div style={{ position: "absolute", left: 34, bottom: 34, maxWidth: 340, background: "rgba(13,27,42,0.72)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: "18px 20px", backdropFilter: "blur(8px)", boxShadow: "0 22px 50px rgba(0,0,0,0.26)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: PUB.teal, marginBottom: 8 }}>Reflectie en begeleiding</div>
              <div style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 800, color: PUB.wit }}>Niet harder werken, maar anders kijken naar wat samenwerking helpt of belemmert.</div>
            </div>
          </div>
        </section>

        <section style={{ padding: "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 42, alignItems: "center" }}>
            <div>
              <SectionLabel>Waarom deze aanpak</SectionLabel>
              <h2 style={{ fontSize: 42, lineHeight: 1.12, margin: "0 0 16px" }}>Teams lopen zelden vast op één oorzaak.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>In teams spelen meerdere lagen tegelijk. Veiligheid, motivatie, veranderbeleving en dagelijkse verbeterkracht beïnvloeden elkaar. Daarom kijken we niet naar één losse score, maar naar de samenhang tussen wat mensen ervaren, nodig hebben en bespreekbaar durven maken.</p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>De kracht zit in het combineren van data met menselijk gesprek. De teamscan geeft richting, de begeleiding zorgt dat inzichten worden vertaald naar concreet gedrag.</p>
            </div>
            <img src={images.team} alt="Professioneel team dat samenwerkt aan een vraagstuk" style={{ width: "100%", borderRadius: 22, objectFit: "cover", minHeight: 420, boxShadow: "0 24px 70px rgba(13,27,42,0.16)" }} />
          </div>
        </section>

        <section style={{ padding: "86px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 38px" }}>
              <SectionLabel>Vier domeinen en één gedragslens</SectionLabel>
              <h2 style={{ fontSize: 42, lineHeight: 1.12, margin: "0 0 14px" }}>De teamscan laat zien wat er speelt. Insights Discovery helpt begrijpen hoe het team daarmee omgaat.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>De teamscan brengt vier domeinen in beeld: veiligheid en leiderschap, energie en motivatie, verandering en betekenis, en verbeteren en leren. De gedragsvoorkeuren uit Insights Discovery gebruiken we als verdiepende lens om te begrijpen hoe mensen binnen deze domeinen communiceren, reageren en samenwerken.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
              {domeinen.map(([titel, kleur, tekst]) => (
                <Card key={titel} topColor={kleur}>
                  <h3 style={{ fontSize: 20, margin: "0 0 10px", color: PUB.donker }}>{titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub, margin: 0 }}>{tekst}</p>
                </Card>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <Card topColor={PUB.blauw}>
                <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 22, alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 24, margin: "0 0 10px", color: PUB.donker }}>Insights Discovery als gedragslens</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: PUB.sub, margin: 0 }}>Insights Discovery is geen vijfde teamscandomein, maar een lens op het team. Het laat zien welke gedragsvoorkeuren aanwezig zijn en hoe die invloed hebben op communicatie, besluitvorming, spanning en verandering.</p>
                  </div>
                  <div style={{ background: PUB.licht, borderRadius: 16, padding: 22, border: `1px solid ${PUB.lijn}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: PUB.teal, marginBottom: 8 }}>Kort gezegd</div>
                    <div style={{ fontSize: 18, lineHeight: 1.55, color: PUB.donker, fontWeight: 700 }}>De teamscan laat zien wat er speelt. Insights Discovery helpt begrijpen hoe dit team daarmee omgaat.</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section style={{ padding: "86px 60px", background: PUB.donker, color: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 42, alignItems: "center" }}>
            <img src={images.workshop} alt="Workshop waarin mensen samen inzichten vertalen naar actie" style={{ width: "100%", borderRadius: 22, objectFit: "cover", minHeight: 440, boxShadow: "0 24px 70px rgba(0,0,0,0.34)" }} />
            <div>
              <SectionLabel>Van inzicht naar gedrag</SectionLabel>
              <h2 style={{ fontSize: 42, lineHeight: 1.12, margin: "0 0 16px", color: PUB.wit }}>De aanpak blijft pas waardevol als het team er iets mee gaat doen.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.68)" }}>Daarom eindigt de teamscan niet bij een score. We gebruiken de uitkomsten om het juiste gesprek te voeren, patronen te herkennen en kleine stappen te kiezen die passen bij het team.</p>
              <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
                {stappen.map(([nr, titel, tekst]) => (
                  <div key={nr} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 14, alignItems: "start", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 18 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{nr}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{titel}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.62)" }}>{tekst}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 42, alignItems: "center" }}>
            <div>
              <SectionLabel>Wat we bewust niet doen</SectionLabel>
              <h2 style={{ fontSize: 42, lineHeight: 1.12, margin: "0 0 16px" }}>Geen modelshow. Geen standaardtraject. Geen rapport dat in een la verdwijnt.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>We geven voldoende uitleg om vertrouwen te bouwen, maar houden de echte waarde in de begeleiding: het scherp duiden van jullie specifieke context, de teamscanuitkomsten en de gedragsvoorkeuren van het team.</p>
              <button type="button" onClick={openModal} style={ctaStyle}>Plan een verkennend gesprek</button>
            </div>
            <img src={images.zorg} alt="Samenwerking in een professionele zorgcontext" style={{ width: "100%", borderRadius: 22, objectFit: "cover", minHeight: 420, boxShadow: "0 24px 70px rgba(13,27,42,0.16)" }} />
          </div>
        </section>
      </div>

<<<<<<< HEAD
      {modalOpen && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(13,27,42,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#1A2E4A", borderRadius: 16, border: "1px solid rgba(0,168,150,0.2)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "#00A896", textTransform: "uppercase", marginBottom: 6 }}>Verkennende kennismaking</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>Plan een verkennende kennismaking</div>
                <div style={{ fontSize: 13, color: "#8fa3bb", marginTop: 4 }}>We reageren zo snel mogelijk en gebruiken je gegevens alleen voor deze aanvraag.</div>
              </div>
              <div onClick={closeModal} style={{ cursor: "pointer", color: "#8fa3bb", fontSize: 22, lineHeight: 1, padding: "4px 8px", marginTop: -4 }}>×</div>
            </div>
            {status === "sent" ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 10 }}>Bericht ontvangen</div>
                <div style={{ fontSize: 14, color: "#8fa3bb", lineHeight: 1.7, marginBottom: 24 }}>Bedankt voor je aanvraag. We nemen zo snel mogelijk contact met je op om de situatie kort te verkennen.</div>
                <span onClick={closeModal} style={{ background: "#00A896", color: "#0D1B2A", padding: "10px 24px", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Sluiten</span>
              </div>
            ) : (
              <div style={{ padding: "24px 32px 32px" }}>
                {[["naam", "Naam *", "Je volledige naam", "text"], ["organisatie", "Organisatie", "Naam van de organisatie", "text"], ["teamgrootte", "Teamgrootte", "Bijvoorbeeld 8 of 25", "text"], ["email", "E-mailadres *", "naam@organisatie.nl", "email"], ["telefoon", "Telefoonnummer", "+31 6 ...", "tel"]].map(([key, label, ph, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{label}</div>
                    <input type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${status === "error" && !form[key] && (key === "naam" || key === "email") ? "#e74c3c" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Gewenste eerste stap</div>
                  <select value={form.gewensteStap} onChange={(e) => setForm((f) => ({ ...f, gewensteStap: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                    {["Kennismaking", "Teamscan verkennen", "Advies over trajectopbouw", "Workshop of teamdag"].map((opt) => <option key={opt} value={opt} style={{ color: "#0D1B2A" }}>{opt}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Wat speelt er nu?</div>
                  <textarea placeholder="Beschrijf kort wat er in het team speelt of welke vraag jullie willen verkennen." value={form.bericht} onChange={(e) => setForm((f) => ({ ...f, bericht: e.target.value }))} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
                </div>
                {status === "error" && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 12 }}>Vul minimaal naam en e-mailadres in.</div>}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={handleSubmit} disabled={status === "sending"} style={{ flex: 1, background: status === "sending" ? "#007d70" : "#00A896", color: "#0D1B2A", border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: status === "sending" ? "wait" : "pointer" }}>{status === "sending" ? "Versturen..." : "Verstuur verkenning"}</button>
                  <span onClick={closeModal} style={{ fontSize: 13, color: "#8fa3bb", cursor: "pointer" }}>Annuleer</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>Je gegevens worden uitsluitend gebruikt om deze aanvraag zorgvuldig op te volgen.</div>
              </div>
            )}
          </div>
        </div>
      )}
=======
      <ContactModal isOpen={modalOpen} onClose={closeModal} bron="Onze aanpak" />
>>>>>>> 7bf14c5 (update homepage met klantreis keuze)

    </HelmetProvider>
  );
}
