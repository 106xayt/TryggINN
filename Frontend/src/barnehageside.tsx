// Importerer styling for forsiden/rammen
import "./forside.css";

// Henter språk/tema fra context
import { useThemeLanguage } from "./ThemeLanguageContext";

// Props som BarnehageSide forventer fra App (navigasjon + navn)
interface BarnehageSideProps {
  barnehageNavn: string;
  onTilbakeTilKode: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onGoToReset: () => void;
}

// Velkomstside for valgt barnehage
const BarnehageSide = ({
  barnehageNavn,
  onTilbakeTilKode,
  onGoToLogin,
  onGoToRegister,
  onGoToReset,
}: BarnehageSideProps) => {
  // Leser valgt språk fra context
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Tekster som byttes basert på språk
  const welcomeLine = isNb ? "Velkommen til" : "Welcome to";
  const loginText = isNb ? "Logg inn ↪" : "Log in ↪";
  const registerText = isNb ? "Registrer deg" : "Register";
  const resetText = isNb ? "Reset passord" : "Reset password";
  const backText = isNb ? "Tilbake" : "Back";

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="forside-header">
          <div className="logo-box">
            {/* Enkel logo/ikon */}
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          <section className="welcome-section">
            {/* Viser velkomst + valgt barnehagenavn */}
            <h1 className="welcome-title">
              {welcomeLine}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          {/* Navigasjonsknapper */}
          <div className="button-group">
            <button className="login-button" onClick={onGoToLogin}>
              {loginText}
            </button>

            <button className="secondary-button" onClick={onGoToRegister}>
              {registerText}
            </button>

            <button className="secondary-button" onClick={onGoToReset}>
              {resetText}
            </button>
          </div>

          {/* Tilbake-knapp nederst */}
          <div className="back-link-row">
            <button className="text-link-button" onClick={onTilbakeTilKode}>
              {backText}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BarnehageSide;
