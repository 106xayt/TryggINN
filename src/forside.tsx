import { useState, type FormEvent } from "react";
import "./forside.css";

interface ForsideProps {
  onBarnehageRegistrert: () => void;
}

const Forside = ({ onBarnehageRegistrert }: ForsideProps) => {
  const [kode, setKode] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!kode.trim()) {
      alert("Skriv inn barnehagekoden for å fortsette.");
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
              Velkommen til
              <br />
              <span className="welcome-brand">TryggINN</span>
            </h1>
          </section>

          <section className="card">
            <h2 className="card-title">Registrer din Barnehage</h2>
            <p className="card-text">
              Fyll ut barnehagekoden i feltet under for å få tilgang.
            </p>

            <form onSubmit={handleSubmit} className="card-form">
              <input
                type="text"
                placeholder="Kode"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className="code-input"
              />

              <button type="submit" className="primary-button">
                Registrer
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Forside;

