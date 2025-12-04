import { useState } from "react";
import Forside from "./forside";
import BarnehageSide from "./barnehageside";
import LoginPage from "./loginPage";
import RegisterPage from "./registerPage";
import ResetPasswordPage from "./resetPasswordPage";
import ParentDashboard from "./parentDashboard";
import StaffDashboard from "./staffDashboard";

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

  const [parentName, setParentName] = useState("Lise");
  const [staffName, setStaffName] = useState("Ansatt");

  const handleBarnehageRegistrert = () => {
    setBarnehageNavn("Eventyrhagen Barnehage");
    setView("barnehageVelkommen");
  };

  const handleTilbakeTilKode = () => {
    setView("registrerBarnehage");
  };

  const goToLogin = () => setView("login");
  const goToRegister = () => setView("register");
  const goToResetPassword = () => setView("resetPassword");
  const backToWelcome = () => setView("barnehageVelkommen");

  // 👉 foresatt
  const handleParentLoggedIn = (nameFromForm?: string) => {
    if (nameFromForm && nameFromForm.trim()) {
      setParentName(capitalize(nameFromForm.split("@")[0]));
    }
    setView("parentDashboard");
  };

  // 👉 ansatt
  const handleStaffLoggedIn = (nameFromForm?: string) => {
    if (nameFromForm && nameFromForm.trim()) {
      setStaffName(capitalize(nameFromForm.split("@")[0]));
    }
    setView("staffDashboard");
  };

  const handleLogoutToWelcome = () => {
    setView("barnehageVelkommen");
  };

  return (() => {
    switch (view) {
      case "registrerBarnehage":
        return (
          <Forside onBarnehageRegistrert={handleBarnehageRegistrert} />
        );

      case "barnehageVelkommen":
        return (
          <BarnehageSide
            barnehageNavn={barnehageNavn}
            onTilbakeTilKode={handleTilbakeTilKode}
            onGoToLogin={goToLogin}
            onGoToRegister={goToRegister}
            onGoToReset={goToResetPassword}
          />
        );

      case "login":
        return (
          <LoginPage
            barnehageNavn={barnehageNavn}
            onBack={backToWelcome}
            onParentLoggedIn={handleParentLoggedIn}
            onStaffLoggedIn={handleStaffLoggedIn}
          />
        );

      case "register":
        return (
          <RegisterPage
            barnehageNavn={barnehageNavn}
            onBack={backToWelcome}
          />
        );

      case "resetPassword":
        return (
          <ResetPasswordPage
            barnehageNavn={barnehageNavn}
            onBack={backToWelcome}
          />
        );

      case "parentDashboard":
        return (
          <ParentDashboard
            parentName={parentName}
            onLogout={handleLogoutToWelcome}
          />
        );

      case "staffDashboard":
        return (
          <StaffDashboard
            staffName={staffName}
            onLogout={handleLogoutToWelcome}
          />
        );

      default:
        return null;
    }
  })();
}

/** Liten hjelpefunksjon – valgfri, bare for å gjøre navnet pent */
function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}





