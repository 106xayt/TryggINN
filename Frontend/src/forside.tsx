// Importerer React hooks, CSS, språk-kontekst og API-funksjon
import { useState, type FormEvent } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";
import { useAccessCode } from "./api";

// Props: callback som kalles når barnehagen er registrert korrekt
interface ForsideProps {
  onBarnehageRegistrert: (data: { daycareId: number; daycareName: string }) => void;
}

// Forside-komponenten
const Forside = ({ onBarnehageRegistrert }: ForsideProps) => {
  // State for koden brukeren skriver inn
  const [kode, setKode] = useState("");
  // State for å hindre dobbelt-innsending
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Henter valgt språk fra context
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Tekster som endres basert på språk
  const welcomeLine = isNb ? "Velkommen til" : "Welcome to";
  const registerTitle = isNb ? "Registrer din Barnehage" : "Register your kindergarten";
  const registerText = isNb
    ? "Fyll ut barnehagekoden i feltet under for å få tilgang."
    : "Enter your kindergarten code in the field below to get access.";
  const codePlaceholder = isNb ? "Kode" : "Code";
  const buttonText = isNb ? "Registrer" : "Register";
  const emptyCodeAlert = isNb
    ? "Skriv inn barnehagekoden for å fortsette."
    : "Please enter the kindergarten code to continue.";

  // Håndterer innsending av skjemaet
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Fjerner mellomrom og sjekker at koden ikke er tom
    const trimmed = kode.trim();
    if (!trimmed) {
      alert(emptyCodeAlert);
      return;
    }

    try {
      // Starter innsending og kaller API med koden
      setIsSubmitting(true);
      const res = await useAccessCode(trimmed);

      // Sender gyldig barnehage-data videre til parent
      onBarnehageRegistrert({
        daycareId: res.daycareId,
        daycareName: res.daycareName,
      });
    } catch (err: any) {
      // Viser feilmelding hvis koden er ugyldig
      const msg =
        err?.message ||
        (isNb ? "Ugyldig eller deaktivert kode." : "Invalid or inactive code.");
      alert(msg);
    } finally {
      // Re-aktiverer knappen uansett utfall
      setIsSubmitting(false);
    }
  };

  // UI for forsiden
  return (
    <div className="forside-root">
      <div className="phone-frame">
        {/* Logo / header */}
        <header className="forside-header">
          <div className="logo-box">
            <span className="logo-letter">T</span>
          </div>
        </header>

        {/* Hovedinnhold */}
        <main className="forside-main">
          {/* Velkomsttekst */}
          <section className="welcome-section">
            <h1 className="welcome-title">
              {welcomeLine}
              <br />
              <span className="welcome-brand">TryggINN</span>
            </h1>
          </section>

          {/* Registreringskort */}
          <section className="card">
            <h2 className="card-title">{registerTitle}</h2>
            <p className="card-text">{registerText}</p>

            {/* Skjema for barnehagekode */}
            <form onSubmit={handleSubmit} className="card-form">
              <input
                type="text"
                placeholder={codePlaceholder}
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="code-input"
              />

              {/* Submit-knapp deaktiveres under innsending */}
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {buttonText}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Forside;
