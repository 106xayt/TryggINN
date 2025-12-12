import { type FormEvent, useState } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";

interface ResetPasswordPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const ResetPasswordPage = ({
  barnehageNavn,
  onBack,
}: ResetPasswordPageProps) => {
  const [email, setEmail] = useState("");
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const payload = { email, barnehageNavn };
    console.log("RESET PASSORD payload:", payload);

    // senere for backend-integrasjon:
    // await api.requestPasswordReset(payload)
  };

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
        <header className="forside-header small-header">
          <div className="logo-box">
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          <section className="welcome-section small-welcome">
            <h1 className="welcome-title">
              {titleTop}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <section className="form-card">
            <h2 className="form-title">{subTitle}</h2>

            <form onSubmit={handleSubmit} className="form">
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

              <button type="submit" className="login-button form-submit">
                {submitText}
              </button>
            </form>

            <button type="button" className="helper-link" onClick={onBack}>
              {backText}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
