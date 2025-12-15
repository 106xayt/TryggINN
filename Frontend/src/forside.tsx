import { useState, type FormEvent } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";
import { useAccessCode } from "./api";

interface ForsideProps {
  onBarnehageRegistrert: (data: { daycareId: number; daycareName: string }) => void;
}

const Forside = ({ onBarnehageRegistrert }: ForsideProps) => {
  const [kode, setKode] = useState("");

  const { language } = useThemeLanguage();
  const isNb = language === "nb";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = kode.trim();
    if (!trimmed) {
      alert(emptyCodeAlert);
      return;
    }

    try {
      const res = await useAccessCode(trimmed);
      onBarnehageRegistrert({ daycareId: res.daycareId, daycareName: res.daycareName });
    } catch (err: any) {
      alert(err?.message ?? "Ugyldig eller deaktivert kode.");
    }
  };

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="forside-header">
          <div className="logo-box">
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          <section className="welcome-section">
            <h1 className="welcome-title">
              {welcomeLine}
              <br />
              <span className="welcome-brand">TryggINN</span>
            </h1>
          </section>

          <section className="card">
            <h2 className="card-title">{registerTitle}</h2>
            <p className="card-text">{registerText}</p>

            <form onSubmit={handleSubmit} className="card-form">
              <input
                type="text"
                placeholder={codePlaceholder}
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="code-input"
              />

              <button type="submit" className="primary-button">
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
