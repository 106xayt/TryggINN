import { type FormEvent, useState } from "react";
import "./forside.css";

interface RegisterPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const RegisterPage = ({ barnehageNavn, onBack }: RegisterPageProps) => {
  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [passord, setPassord] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const payload = { navn, email, telefon, passord, barnehageNavn };
    console.log("REGISTER payload:", payload);

    // senere:
    // await api.registerForelder(payload)
  };

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
              Registrer deg
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <section className="form-card">
            <h2 className="form-title">Opprett konto</h2>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-field">
                <label className="form-label">Navn</label>
                <input
                  type="text"
                  className="text-input"
                  value={navn}
                  onChange={(e) => setNavn(e.target.value)}
                  placeholder="Ditt fulle navn"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">E-post</label>
                <input
                  type="email"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@epost.no"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Telefon</label>
                <input
                  type="tel"
                  className="text-input"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="Mobilnummer"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Passord</label>
                <input
                  type="password"
                  className="text-input"
                  value={passord}
                  onChange={(e) => setPassord(e.target.value)}
                  placeholder="Velg et passord"
                  required
                />
              </div>

              <button type="submit" className="login-button form-submit">
                Registrer deg ➕
              </button>
            </form>

            <button type="button" className="helper-link" onClick={onBack}>
              ⟵ Tilbake til forsiden
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
