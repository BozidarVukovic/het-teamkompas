import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function GenerateAdvicePanel({ scanId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleGenerateAdvice = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const functions = getFunctions();
      const generateTeamAdvice = httpsCallable(functions, "generateTeamAdvice");

      const result = await generateTeamAdvice({ scanId });

      if (result.data?.success) {
        setMessage(result.data.message || "Conceptadvies is aangemaakt.");
      } else {
        setMessage("De functie is aangeroepen, maar controleer Firestore.");
      }
    } catch (err) {
      console.error("generateTeamAdvice fout:", err);
      setError(
        err.message ||
          "Het conceptadvies kon niet worden gegenereerd."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-blue-700">
        Stap 8
      </p>

      <h2 className="mt-1 text-2xl font-bold text-slate-950">
        AI stelt maatwerkadvies op
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Op basis van de teamscan wordt een conceptadvies aangemaakt. Deze
        eerste versie test alleen of de koppeling met Firebase Functions en
        Firestore werkt.
      </p>

      <button
        type="button"
        onClick={handleGenerateAdvice}
        disabled={loading || !scanId}
        className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Advies wordt gegenereerd..." : "Genereer testadvies"}
      </button>

      {!scanId && (
        <p className="mt-3 text-sm text-amber-700">
          Geen scanId gevonden. Open deze knop vanuit een bestaande teamscan.
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}