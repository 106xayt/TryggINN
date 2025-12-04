import { type FormEvent, useState } from "react";
import "./forside.css";

type Role = "foresatt" | "ansatt";

interface LoginPageProps {
  barnehageNavn: string;
  onBack: () => void;
  onParentLoggedIn: (nameFromForm?: string) => void;
  onStaffLoggedIn: (nameFromForm?: string) => void;
}

const LoginPage = ({
  barnehageNavn,
  onBack,
  onParentLoggedIn,
  onStaffLoggedIn,
}: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [passord, setPassord] = useState("");
  const [role, setRole] = useState<Role>("foresatt");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Klar for backend:
    console.log("LOGIN payload:", { email, passord, role, barnehageNavn });

    if (role === "foresatt") {
      onParentLoggedIn(email);
    } else {
      onStaffLoggedIn(email);
    }
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
              Logg inn
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <section className="form-card">
            <h2 className="form-title">Velg rolle</h2>

            {/* Rolle-velger (foresatt / ansatt) */}
            <div className="role-toggle">
              <button
                type="button"
                className={
                  role === "foresatt"
                    ? "role-toggle-button role-toggle-button--active"
                    : "role-toggle-button"
                }
                onClick={() => setRole("foresatt")}
              >
                Foresatt
              </button>
              <button
                type="button"
                className={
                  role === "ansatt"
                    ? "role-toggle-button role-toggle-button--active"
                    : "role-toggle-button"
                }
                onClick={() => setRole("ansatt")}
              >
                Ansatt
              </button>
            </div>

            <h2 className="form-title">Innlogging</h2>

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

              <div className="form-field">
                <label className="form-label">Passord</label>
                <input
                  type="password"
                  className="text-input"
                  value={passord}
                  onChange={(e) => setPassord(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="login-button form-submit">
                Logg inn ↪
              </button>
            </form>

            {/* 🔹 Midlertidige knapper – hopper rett til dashboard */}
            <button
              type="button"
              className="helper-link"
              onClick={() => onParentLoggedIn("lise@fake.no")}
            >
              (Midlertidig) Gå til Foresatt-dashboard
            </button>

            <button
              type="button"
              className="helper-link"
              onClick={() => onStaffLoggedIn("ansatt@fake.no")}
            >
              (Midlertidig) Gå til Ansatt-dashboard
            </button>

            <button
              type="button"
              className="helper-link"
              onClick={onBack}
            >
              ⟵ Tilbake til forsiden
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;

