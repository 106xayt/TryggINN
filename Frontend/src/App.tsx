import { useState } from "react";
import Forside from "./forside";
import BarnehageSide from "./barnehageside";
import LoginPage from "./loginPage";
import RegisterPage from "./registerPage";
import ResetPasswordPage from "./resetPasswordPage";
import ParentDashboard from "./parentDashboard";
import StaffDashboard from "./staffDashboard";

import SettingsBar from "./settingsBar";
import { useThemeLanguage } from "./ThemeLanguageContext";
import "./theme.css";

/**
 * App er toppnivåkomponenten som styrer navigasjonen mellom de ulike sidene
 * i TryggINN. Den har nå støtte for å spore både foresatt‑ID og ansatt‑ID
 * etter innlogging slik at dashboardet kan hente data fra backend i stedet
 * for å bruke dummy‑data. Navn og ID settes av handleParentLoggedIn og
 * handleStaffLoggedIn basert på responsen fra login‑endepunktet.
 */

type View =
    | "registrerBarnehage"
    | "barnehageVelkommen"
    | "login"
    | "register"
    | "resetPassword"
    | "parentDashboard"
    | "staffDashboard";

export default function App() {
    const [view, setView] = useState<View>("registrerBarnehage");
    const [barnehageNavn, setBarnehageNavn] = useState("Eventyrhagen Barnehage");

    // Foresatt‑state: ID og navn
    const [parentId, setParentId] = useState<number | null>(null);
    const [parentName, setParentName] = useState("");

    // Ansatt‑state: ID og navn
    const [staffId, setStaffId] = useState<number | null>(null);
    const [staffName, setStaffName] = useState("");

    const { theme } = useThemeLanguage();

    const handleBarnehageRegistrert = () => {
        setBarnehageNavn("Eventyrhagen Barnehage");
        setView("barnehageVelkommen");
    };

    const handleTilbakeTilKode = () => setView("registrerBarnehage");
    const goToLogin = () => setView("login");
    const goToRegister = () => setView("register");
    const goToResetPassword = () => setView("resetPassword");
    const backToWelcome = () => setView("barnehageVelkommen");

    /**
     * Etter suksessfull foresatt‑innlogging settes både id og navn. Hvis
     * fullName finnes i responsen brukes den, ellers navnet som kommer
     * fra result.name eller epost som fallback. View byttes til
     * foresatt‑dashboard.
     */
    const handleParentLoggedIn = (user: any) => {
        if (user) {
            // Sett id på flere feltnavn for robusthet
            if (user.id != null) {
                setParentId(user.id);
            } else if (user.userId != null) {
                setParentId(user.userId);
            }
            // Sett navn. Prøv fullName, deretter name, til slutt email
            if (user.fullName) {
                setParentName(capitalize(user.fullName));
            } else if (user.name) {
                setParentName(capitalize(user.name));
            } else if (user.email) {
                setParentName(capitalize(user.email));
            }
        }
        setView("parentDashboard");
    };

    /**
     * Etter suksessfull ansatt‑innlogging settes id og navn. Id og navn
     * hentes fra responsen. View byttes til ansatt‑dashboard.
     */
    const handleStaffLoggedIn = (user: any) => {
        if (user) {
            if (user.id != null) {
                setStaffId(user.id);
            } else if (user.userId != null) {
                setStaffId(user.userId);
            }
            if (user.fullName) {
                setStaffName(capitalize(user.fullName));
            } else if (user.name) {
                setStaffName(capitalize(user.name));
            } else if (user.email) {
                setStaffName(capitalize(user.email));
            }
        }
        setView("staffDashboard");
    };

    /**
     * Logg ut og gå tilbake til velkomstsiden. Alle id‑er og navn nullstilles.
     */
    const handleLogoutToWelcome = () => {
        setParentId(null);
        setParentName("");
        setStaffId(null);
        setStaffName("");
        setView("barnehageVelkommen");
    };

    return (
        <div className={`app-root theme-${theme}`}>
            {/* Globale innstillinger: språk/tema */}
            <SettingsBar />

            {/* Vis riktig side basert på view */}
            {view === "registrerBarnehage" && (
                <Forside onBarnehageRegistrert={handleBarnehageRegistrert} />
            )}
            {view === "barnehageVelkommen" && (
                <BarnehageSide
                    barnehageNavn={barnehageNavn}
                    onTilbakeTilKode={handleTilbakeTilKode}
                    onGoToLogin={goToLogin}
                    onGoToRegister={goToRegister}
                    onGoToReset={goToResetPassword}
                />
            )}
            {view === "login" && (
                <LoginPage
                    barnehageNavn={barnehageNavn}
                    onBack={backToWelcome}
                    onParentLoggedIn={handleParentLoggedIn}
                    onStaffLoggedIn={handleStaffLoggedIn}
                />
            )}
            {view === "register" && (
                <RegisterPage
                    barnehageNavn={barnehageNavn}
                    onBack={backToWelcome}
                />
            )}
            {view === "resetPassword" && (
                <ResetPasswordPage
                    barnehageNavn={barnehageNavn}
                    onBack={backToWelcome}
                />
            )}
            {view === "parentDashboard" && parentId != null && (
                <ParentDashboard
                    parentId={parentId}
                    parentName={parentName}
                    onLogout={handleLogoutToWelcome}
                />
            )}
            {view === "staffDashboard" && staffId != null && (
                <StaffDashboard
                    staffId={staffId}
                    staffName={staffName}
                    onLogout={handleLogoutToWelcome}
                />
            )}
        </div>
    );
}

/**
 * Hjelpefunksjon for å gjøre første bokstav i et navn stor og resten
 * uendret. Dersom verdien er tom returneres den som den er.
 */
function capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}