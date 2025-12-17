import { type FormEvent, useState } from "react"; // React hooks + type for submit-event
import "./forside.css"; // styling for layout/kort/knapper
import { useThemeLanguage } from "./ThemeLanguageContext"; // henter valgt språk (nb/en)

// Props: barnehagenavn til visning + callback for å gå tilbake
interface ResetPasswordPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const ResetPasswordPage = ({
  barnehageNavn,
  onBack,
}: ResetPasswordPageProps) => {
  // State for e-postfeltet
  const [email, setEmail] = useState("");

  // Språkvalg fra context
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Kjøres når brukeren sender inn skjemaet
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // hindrer refresh

    // Lager payload som backend senere kan bruke
    const payload = { email, barnehageNavn };
    console.log("RESET PASSORD payload:", payload);

    // senere for backend-integrasjon:
    // await api.requestPasswordReset(payload)
  };

  // Tekster som bytter mellom norsk/engelsk
  const titleTop = isNb ? "Reset passord" : "Reset password";
  const subTitle = isNb
    ? "Send nytt passord-lenke"
    : "Send password reset link";
  const emailLabel = isNb ? "E-post" : "Email";
  const emailPlaceholder = isNb ? "din@epost.no" : "your@email.com";
  const submitText = isNb ? "Send lenke 🔑" : "Send link 🔑";
  const backText = isNb ? "⟵ Tilbake til forsiden" : "⟵ Back to start";

  return (
    <div className="forside-root">
      <div className="phone-frame">
        {/* Logo/header */}
        <header className="forside-header small-header">
          <div className="logo-box">
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          {/* Topptekst + barnehagenavn */}
          <section className="welcome-section small-welcome">
            <h1 className="welcome-title">
              {titleTop}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          {/* Kort med skjema for å be om passord-reset */}
          <section className="form-card">
            <h2 className="form-title">{subTitle}</h2>

            <form onSubmit={handleSubmit} className="form">
              {/* E-post input */}
              <div className="form-field">
                <label className="form-label">{emailLabel}</label>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  required
                />
              </div>

              {/* Submit-knapp */}
              <button type="submit" className="login-button form-submit">
                {submitText}
              </button>
            </form>

            {/* Tilbake-knapp */}
            <button type="button" className="helper-link" onClick={onBack}>
              {backText}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ResetPasswordPage; // eksporter komponenten så den kan brukes i appen
