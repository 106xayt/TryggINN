import { useState, type FormEvent } from "react";
import "./forside.css";
import { useAccessCode } from "./api";

interface ForsideProps {
    onBarnehageRegistrert: () => void;
}

const Forside = ({ onBarnehageRegistrert }: ForsideProps) => {
    const [kode, setKode] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const trimmed = kode.trim();
        if (!trimmed) {
            alert("Skriv inn barnehagekoden for å fortsette.");
            return;
        }

        try {
            const guardianUserId = 3;

            const result = await useAccessCode(trimmed, guardianUserId);
            console.log("Kode OK:", result);

            alert(result.message || "Koden ble brukt og du er nå koblet til barnehagen.");

            onBarnehageRegistrert();
        } catch (err: any) {
            console.error("Feil ved bruk av kode:", err);
            alert(err?.message ?? "Kunne ikke bruke koden. Sjekk at den er riktig.");
        }
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
