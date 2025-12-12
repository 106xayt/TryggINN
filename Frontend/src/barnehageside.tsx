import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";

interface BarnehageSideProps {
  barnehageNavn: string;
  onTilbakeTilKode: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onGoToReset: () => void;
}

const BarnehageSide = ({
  barnehageNavn,
  onTilbakeTilKode,
  onGoToLogin,
  onGoToRegister,
  onGoToReset,
}: BarnehageSideProps) => {
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

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
            <span className="logo-letter">T</span>
          </div>
        </header>

        <main className="forside-main">
          <section className="welcome-section">
            <h1 className="welcome-title">
              {welcomeLine}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

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


