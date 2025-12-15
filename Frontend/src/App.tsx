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

  // valgt barnehage fra access code
  const [daycareId, setDaycareId] = useState<number | null>(null);
  const [barnehageNavn, setBarnehageNavn] = useState("");

  // Foresatt
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentName, setParentName] = useState("");

  // Ansatt
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState("");

  const { theme } = useThemeLanguage();

  const handleBarnehageRegistrert = (data: { daycareId: number; daycareName: string }) => {
    setDaycareId(data.daycareId);
    setBarnehageNavn(data.daycareName);
    setView("barnehageVelkommen");
  };

  const handleTilbakeTilKode = () => setView("registrerBarnehage");
  const goToLogin = () => setView("login");
  const goToRegister = () => setView("register");
  const goToResetPassword = () => setView("resetPassword");
  const backToWelcome = () => setView("barnehageVelkommen");

  const handleParentLoggedIn = (user: any) => {
    if (user) {
      if (user.id != null) setParentId(user.id);
      else if (user.userId != null) setParentId(user.userId);

      if (user.fullName) setParentName(capitalize(user.fullName));
      else if (user.name) setParentName(capitalize(user.name));
      else if (user.email) setParentName(capitalize(user.email));
    }
    setView("parentDashboard");
  };

  const handleStaffLoggedIn = (user: any) => {
    if (user) {
      if (user.id != null) setStaffId(user.id);
      else if (user.userId != null) setStaffId(user.userId);

      if (user.fullName) setStaffName(capitalize(user.fullName));
      else if (user.name) setStaffName(capitalize(user.name));
      else if (user.email) setStaffName(capitalize(user.email));
    }
    setView("staffDashboard");
  };

  const handleLogoutToWelcome = () => {
    setParentId(null);
    setParentName("");
    setStaffId(null);
    setStaffName("");
    setView("barnehageVelkommen");
  };

  return (
    <div className={`app-root theme-${theme}`}>
      <SettingsBar />

      {view === "registrerBarnehage" && (
        <Forside onBarnehageRegistrert={handleBarnehageRegistrert} />
      )}

      {view === "barnehageVelkommen" && (
        <BarnehageSide
          barnehageNavn={barnehageNavn || "Barnehage"}
          onTilbakeTilKode={handleTilbakeTilKode}
          onGoToLogin={goToLogin}
          onGoToRegister={goToRegister}
          onGoToReset={goToResetPassword}
        />
      )}

      {view === "login" && (
        <LoginPage
          barnehageNavn={barnehageNavn || "Barnehage"}
          onBack={backToWelcome}
          onParentLoggedIn={handleParentLoggedIn}
          onStaffLoggedIn={handleStaffLoggedIn}
        />
      )}

      {view === "register" && (
        <RegisterPage barnehageNavn={barnehageNavn || "Barnehage"} onBack={backToWelcome} />
      )}

      {view === "resetPassword" && (
        <ResetPasswordPage barnehageNavn={barnehageNavn || "Barnehage"} onBack={backToWelcome} />
      )}

      {view === "parentDashboard" && parentId != null && (
        <ParentDashboard parentId={parentId} parentName={parentName} onLogout={handleLogoutToWelcome} />
      )}

      {view === "staffDashboard" && staffId != null && (
        <StaffDashboard staffId={staffId} staffName={staffName} onLogout={handleLogoutToWelcome} />
      )}

      {/* hvis du vil bruke daycareId senere: den ligger her, men vi må ikke "lese" den nå */}
      {/* (daycareId === null) */}
    </div>
  );
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
