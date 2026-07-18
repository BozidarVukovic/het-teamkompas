import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut as portalSignOut } from "firebase/auth";
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
export const db = getFirestore(app);

export const ADMIN_EMAILS = [
  "bozidar@mijnteamkompas.nl",
  "edmond@mijnteamkompas.nl",
];

// Maakt een klantportaal-account aan zonder de ingelogde beheerder uit te loggen.
// Gebruikt een tweede app-instantie; de klant ontvangt een e-mail om zelf een wachtwoord in te stellen.
export async function maakPortalAccount(email) {
  const schoonEmail = String(email || "").trim().toLowerCase();
  if (!schoonEmail) throw new Error("Geen e-mailadres opgegeven.");

  const bestaande = getApps().find((a) => a.name === "portal-admin");
  const secondary = bestaande || initializeApp(firebaseConfig, "portal-admin");
  const secondaryAuth = getAuth(secondary);

  const tijdelijkWachtwoord =
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase() + "!x9";

  try {
    await createUserWithEmailAndPassword(secondaryAuth, schoonEmail, tijdelijkWachtwoord);
    await sendPasswordResetEmail(secondaryAuth, schoonEmail);
    await portalSignOut(secondaryAuth).catch(() => {});
    return { email: schoonEmail, bestondAl: false };
  } catch (err) {
    if (err && err.code === "auth/email-already-in-use") {
      // Account bestaat al: stuur alleen een wachtwoord-instelmail.
      await sendPasswordResetEmail(secondaryAuth, schoonEmail);
      return { email: schoonEmail, bestondAl: true };
    }
    throw err;
  }
}

export default app;