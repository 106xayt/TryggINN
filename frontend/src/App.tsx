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


export interface LoggedInParent {
    id: number;
    fullName: string;
}


export interface LoggedInStaff {
    id: number;
    fullName: string;
}

export default function App() {
    const [view, setView] = useState<View>("registrerBarnehage");
    const [barnehageNavn, setBarnehageNavn] = useState("Eventyrhagen Barnehage");

    const [parentName, setParentName] = useState("Lise");
    const [parentId, setParentId] = useState<number | null>(null);

    const [staffName, setStaffName] = useState("Ansatt");
    const [staffId, setStaffId] = useState<number | null>(null);

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


    const handleParentLoggedIn = (user: LoggedInParent) => {
        setParentId(user.id);
        setParentName(user.fullName);
        setView("parentDashboard");
    };


    const handleStaffLoggedIn = (user: LoggedInStaff) => {
        setStaffId(user.id);
        setStaffName(user.fullName);
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
                        parentId={parentId!}
                        parentName={parentName}
                        onLogout={handleLogoutToWelcome}
                    />
                );

            case "staffDashboard":
                return (
                    <StaffDashboard
                        staffName={staffName}
                        staffId={staffId!}
                        onLogout={handleLogoutToWelcome}
                    />
                );

            default:
                return null;
        }
    })();
}

