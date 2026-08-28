import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

export const auth = getAuth(app);

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