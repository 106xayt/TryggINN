import { useState, type FormEvent } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";

interface ForsideProps {
  onBarnehageRegistrert: () => void;
}

const Forside = ({ onBarnehageRegistrert }: ForsideProps) => {
  const [kode, setKode] = useState("");

  // 👇 henter valgt språk fra "motoren"
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Tekster for NO / EN
  const welcomeLine = isNb ? "Velkommen til" : "Welcome to";
  const registerTitle = isNb
    ? "Registrer din Barnehage"
    : "Register your kindergarten";
  const registerText = isNb
    ? "Fyll ut barnehagekoden i feltet under for å få tilgang."
    : "Enter your kindergarten code in the field below to get access.";
  const codePlaceholder = isNb ? "Kode" : "Code";
  const buttonText = isNb ? "Registrer" : "Register";
  const emptyCodeAlert = isNb
    ? "Skriv inn barnehagekoden for å fortsette."
    : "Please enter the kindergarten code to continue.";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!kode.trim()) {
      alert(emptyCodeAlert);
      return;
    }

    // Her kan dere senere sjekke koden mot backend
    // f.eks. await api.validateKindergartenCode(kode)
    onBarnehageRegistrert();
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

