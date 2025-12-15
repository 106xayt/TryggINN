import { type FormEvent, useState } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";
import { registerParent } from "./api";


interface RegisterPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const RegisterPage = ({ barnehageNavn, onBack }: RegisterPageProps) => {
  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [passord, setPassord] = useState("");

  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await registerParent({
        fullName: navn.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: telefon.trim() || null,
        password: passord,
      });

      console.log("REGISTER OK:", res);

      alert(isNb ? "Bruker registrert! Du kan nå logge inn." : "User registered! You can now log in.");
      onBack(); // tilbake til velkomst / login-flow hos deg
    } catch (err: any) {
      console.error("REGISTER ERROR:", err);
      alert(err?.message || (isNb ? "Klarte ikke å registrere." : "Could not register."));
    }
  };

  const titleTop = isNb ? "Registrer deg" : "Sign up";
  const createAccountTitle = isNb ? "Opprett konto" : "Create account";

  const nameLabel = isNb ? "Navn" : "Name";
  const namePlaceholder = isNb ? "Ditt fulle navn" : "Your full name";

  const emailLabel = isNb ? "E-post" : "Email";
  const emailPlaceholder = isNb ? "din@epost.no" : "your@email.com";

  const phoneLabel = isNb ? "Telefon" : "Phone";
  const phonePlaceholder = isNb ? "Mobilnummer" : "Mobile number";

  const passwordLabel = isNb ? "Passord" : "Password";
  const passwordPlaceholder = isNb
    ? "Velg et passord"
    : "Choose a password";

  const submitText = isNb ? "Registrer deg ➕" : "Create account ➕";
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
            <h2 className="form-title">{createAccountTitle}</h2>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-field">
                <label className="form-label">{nameLabel}</label>
                <input
                  type="text"
                  className="text-input"
                  value={navn}
                  onChange={(e) => setNavn(e.target.value)}
                  placeholder={namePlaceholder}
                  required
                />
              </div>

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

              <div className="form-field">
                <label className="form-label">{phoneLabel}</label>
                <input
                  type="tel"
                  className="text-input"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder={phonePlaceholder}
                />
              </div>

              <div className="form-field">
                <label className="form-label">{passwordLabel}</label>
                <input
                  type="password"
                  className="text-input"
                  value={passord}
                  onChange={(e) => setPassord(e.target.value)}
                  placeholder={passwordPlaceholder}
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

export default RegisterPage;
