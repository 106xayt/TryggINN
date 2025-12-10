import { type FormEvent, useState } from "react";
import "./forside.css";

interface ResetPasswordPageProps {
  barnehageNavn: string;
  onBack: () => void;
}

const ResetPasswordPage = ({
  barnehageNavn,
  onBack,
}: ResetPasswordPageProps) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const payload = { email, barnehageNavn };
    console.log("RESET PASSORD payload:", payload);

    // senere for backend-integrasjon:
    // await api.requestPasswordReset(payload)
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
              Reset passord
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <section className="form-card">
            <h2 className="form-title">Send nytt passord-lenke</h2>

            <form onSubmit={handleSubmit} className="form">
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

              <button type="submit" className="login-button form-submit">
                Send lenke 🔑
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

export default ResetPasswordPage;
