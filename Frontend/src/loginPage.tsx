import { type FormEvent, useState } from "react";
import "./forside.css";
import { login } from "./api";

/**
 * LoginPage håndterer innlogging for foresatte og ansatte. Den
 * bruker login‑endepunktet i api.ts til å autentisere brukeren og
 * sender deretter brukerobjektet (med id og fullName) tilbake til
 * App via onParentLoggedIn eller onStaffLoggedIn. Eventuelle
 * feil fra backend vises som meldinger under innloggingsskjemaet.
 */

type Role = "foresatt" | "ansatt";

interface LoggedInParent {
    id: number;
    fullName: string;
}

interface LoggedInStaff {
    id: number;
    fullName: string;
}

interface LoginPageProps {
    barnehageNavn: string;
    onBack: () => void;
    onParentLoggedIn: (user: LoggedInParent) => void;
    onStaffLoggedIn: (user: LoggedInStaff) => void;
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(email, passord);
            // login() forventes å returnere { userId, fullName, email, role }
            if (!result || !result.role) {
                setError("Ugyldig svar fra server.");
            } else if (result.role === "PARENT") {
                onParentLoggedIn({
                    id: result.userId,
                    fullName: result.fullName || result.email,
                });
            } else if (result.role === "STAFF" || result.role === "ADMIN") {
                onStaffLoggedIn({
                    id: result.userId,
                    fullName: result.fullName || result.email,
                });
            } else {
                setError("Ukjent rolle for denne brukeren.");
            }
        } catch (err: any) {
            console.error("LOGIN ERROR", err);
            setError(err?.message ?? "Feil ved innlogging.");
        } finally {
            setLoading(false);
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
                            {error && <p className="error-message">{error}</p>}

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

                            <button
                                type="submit"
                                className="login-button form-submit"
                                disabled={loading}
                            >
                                {loading ? "Logger inn..." : "Logg inn ↪"}
                            </button>
                        </form>

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