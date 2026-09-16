import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Centrale Firebase-configuratie voor Mijn Teamkompas.
const firebaseConfig = {
  apiKey: "AIzaSyDgl6gj1LmOZ-1Mcin1jNfkkZg82c2Jtz0",
  authDomain: "mijn-teamkompas-6de84.firebaseapp.com",
  projectId: "mijn-teamkompas-6de84",
  storageBucket: "mijn-teamkompas-6de84.firebasestorage.app",
  messagingSenderId: "820620515571",
  appId: "1:820620515571:web:86a4e792eebe4c7cf03f86",
  measurementId: "G-9DSYN4LZ94",
};

const app = initializeApp(firebaseConfig);

// Waarom initializeAuth en niet getAuth.
//
// getAuth bewaart de aanmeldstatus standaard in IndexedDB. Firebase leest die
// opslag uit voordat het voor het eerst zegt wie er is ingelogd, en in Safari
// kan zo'n leesactie blijven hangen in plaats van te falen -- onder meer met
// meerdere tabbladen van dezelfde site open. Er komt dan geen antwoord en ook
// geen fout, en elk scherm dat op de aanmeldstatus wacht blijft laden. Dat is
// precies wat er op 16 september gebeurde: in Chrome op dezelfde machine werkte
// dezelfde pagina foutloos.
//
// Met deze volgorde staat de sessie in localStorage. Dat is synchroon en kan
// niet hangen; lukt ook dat niet (privevenster, geblokkeerde opslag), dan valt
// hij terug op de sessie van dit tabblad en uiteindelijk op het geheugen -- dan
// blijf je ingelogd zolang het tabblad open is, in plaats van helemaal niet.
//
// Let op: er is bewust geen popupRedirectResolver meegegeven. Deze app meldt
// aan met een e-maillink en met wachtwoord, nooit via een pop-up of redirect.
// Wie dat later toch wil, moet die resolver hier toevoegen.
export const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
});

// Firebase stuurt de inlogmails standaard in het Engels. Met een taalcode
// pakt hij de Nederlandse versie van zijn sjablonen. Let op: zodra een
// sjabloon in de console met de hand is aangepast, wordt die tekst gebruikt
// zoals hij daar staat — dan bepaalt de console de taal, niet deze regel.
auth.languageCode = "nl";
export const db = getFirestore(app);

export const ADMIN_EMAILS = [
  "bozidar@mijnteamkompas.nl",
  "edmond@mijnteamkompas.nl",
];

export default app;