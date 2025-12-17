import { type FormEvent, useState } from "react"; // React hooks + type for submit-event
import "./forside.css"; // styling for screens/buttons/cards
import { useThemeLanguage } from "./ThemeLanguageContext"; // henter valgt språk (nb/en)
import { registerParent } from "./api"; // API-kall som registrerer foresatt i backend

// Props: barnehagenavn til visning + callback for å gå tilbake i flowen
interface RegisterPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const RegisterPage = ({ barnehageNavn, onBack }: RegisterPageProps) => {
  // Lokal state for feltene i skjemaet
  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [passord, setPassord] = useState("");

  // Språkvalg fra context (nb eller engelsk)
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Kjøres når brukeren sender inn registreringsskjemaet
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // hindrer at siden refresher

    try {
      // Sender data til backend, med litt “rensing” (trim, lowercase)
      const res = await registerParent({
        fullName: navn.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: telefon.trim() || null, // tom streng -> null
        password: passord, // passord sendes som skrevet
      });

      console.log("REGISTER OK:", res); // debug: se respons i console

      // Gir brukeren beskjed, og sender dem tilbake til start/login-flow
      alert(isNb ? "Bruker registrert! Du kan nå logge inn." : "User registered! You can now log in.");
      onBack(); // tilbake til velkomst / login-flow hos deg
    } catch (err: any) {
      // Ved feil: logg i console + vis en enkel feilmelding til brukeren
      console.error("REGISTER ERROR:", err);
      alert(err?.message || (isNb ? "Klarte ikke å registrere." : "Could not register."));
    }
  };

  // Tekster som endrer seg basert på språk
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
        {/* Logo/header */}
        <header className="forside-header small-header">
          <div className="logo-box">
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          {/* Topptekst: “Registrer deg” + barnehagenavn */}
          <section className="welcome-section small-welcome">
            <h1 className="welcome-title">
              {titleTop}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          {/* Kortet som inneholder registreringsskjemaet */}
          <section className="form-card">
            <h2 className="form-title">{createAccountTitle}</h2>

            <form onSubmit={handleSubmit} className="form">
              {/* Navn */}
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

              {/* E-post */}
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

              {/* Telefon (valgfritt) */}
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

              {/* Passord */}
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

export default RegisterPage; // gjør komponenten tilgjengelig for import i andre filer
