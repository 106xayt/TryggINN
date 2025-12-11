import { type FormEvent, useState } from "react";
import "./forside.css";
import { useThemeLanguage } from "./ThemeLanguageContext";

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

  // 👇 språk fra global context
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // Tekster NO / EN
  const pageTitle = isNb ? "Logg inn" : "Log in";
  const chooseRoleTitle = isNb ? "Velg rolle" : "Choose role";
  const loginTitle = isNb ? "Innlogging" : "Sign in";

  const parentLabel = isNb ? "Foresatt" : "Guardian";
  const staffLabel = isNb ? "Ansatt" : "Staff";

  const emailLabel = isNb ? "E-post" : "Email";
  const emailPlaceholder = isNb ? "din@epost.no" : "your@email.com";

  const passwordLabel = isNb ? "Passord" : "Password";
  const passwordPlaceholder = "••••••••";

  const submitText = isNb ? "Logg inn ↪" : "Log in ↪";

  const helperParent = isNb
    ? "(Midlertidig) Gå til Foresatt-dashboard"
    : "(Temporary) Go to guardian dashboard";

  const helperStaff = isNb
    ? "(Midlertidig) Gå til Ansatt-dashboard"
    : "(Temporary) Go to staff dashboard";

  const backText = isNb
    ? "⟵ Tilbake til forsiden"
    : "⟵ Back to welcome screen";

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
              {pageTitle}
              <br />
              <span className="welcome-brand">{barnehageNavn}</span>
            </h1>
          </section>

          <section className="form-card">
            <h2 className="form-title">{chooseRoleTitle}</h2>

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
                {parentLabel}
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
                {staffLabel}
              </button>
            </div>

            <h2 className="form-title">{loginTitle}</h2>

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

            {/* 🔹 Midlertidige knapper – hopper rett til dashboard */}
            <button
              type="button"
              className="helper-link"
              onClick={() => onParentLoggedIn("lise@fake.no")}
            >
              {helperParent}
            </button>

            <button
              type="button"
              className="helper-link"
              onClick={() => onStaffLoggedIn("ansatt@fake.no")}
            >
              {helperStaff}
            </button>

            <button
              type="button"
              className="helper-link"
              onClick={onBack}
            >
              {backText}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;


