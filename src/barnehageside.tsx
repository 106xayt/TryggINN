import "./forside.css";

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
              Velkommen til
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <div className="button-group">
            <button className="login-button" onClick={onGoToLogin}>
              Logg inn ↪
            </button>

            <button className="secondary-button" onClick={onGoToRegister}>
              Registrer deg
            </button>

            <button className="secondary-button" onClick={onGoToReset}>
              Reset passord
            </button>
          </div>

          <div className="back-link-row">
            <button className="text-link-button" onClick={onTilbakeTilKode}>
              Tilbake
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BarnehageSide;

