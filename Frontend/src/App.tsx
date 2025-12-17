// Importerer React hooks for state og side-effekter
import { useState, useEffect } from "react";

// Importerer sider/komponenter som brukes som "views"
import Forside from "./forside";
import BarnehageSide from "./barnehageside";
import LoginPage from "./loginPage";
import RegisterPage from "./registerPage";
import ResetPasswordPage from "./resetPasswordPage";
import ParentDashboard from "./parentDashboard";
import StaffDashboard from "./staffDashboard";

import SettingsBar from "./settingsBar";
import { useThemeLanguage } from "./ThemeLanguageContext";

// Importerer styling
import "./theme.css";
import "./forside.css";
import "./staffDashboard.css";

// Importerer API-funksjoner og typer
import {
  createChild,
  createCalendarEvent,
  getGroupsForDaycare,
  getUserByEmail,
  getUserProfile,
  updateUserProfile,
  type DaycareGroupWithChildren,
} from "./api";

// Definerer hvilke "views" appen kan vise
type View =
  | "registrerBarnehage"
  | "barnehageVelkommen"
  | "login"
  | "register"
  | "resetPassword"
  | "parentDashboard"
  | "staffDashboard"
  | "staffRegisterChild"
  | "staffCreateCalendarEvent"
  | "staffProfile";

// Type som håndterer variasjoner i login-respons (id/userId, fullName/name)
type LoggedInUser = {
  id?: number;
  userId?: number;
  fullName?: string;
  name?: string;
  email?: string;
};

export default function App() {
  // Holder styr på hvilken side som vises
  const [view, setView] = useState<View>("registrerBarnehage");

  // Valgt barnehage (fra tilgangskode)
  const [daycareId, setDaycareId] = useState<number | null>(null);
  const [barnehageNavn, setBarnehageNavn] = useState("");

  // Innlogget foresatt
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentName, setParentName] = useState("");

  // Innlogget ansatt
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState("");

  // Tema (dark/light osv.) fra context
  const { theme } = useThemeLanguage();

  // Kalles når barnehage er valgt/validert på forsiden
  const handleBarnehageRegistrert = (data: { daycareId: number; daycareName: string }) => {
    setDaycareId(data.daycareId);
    setBarnehageNavn(data.daycareName);
    setView("barnehageVelkommen");
  };

  // Navigasjonsfunksjoner mellom views
  const handleTilbakeTilKode = () => setView("registrerBarnehage");
  const goToLogin = () => setView("login");
  const goToRegister = () => setView("register");
  const goToResetPassword = () => setView("resetPassword");
  const backToWelcome = () => setView("barnehageVelkommen");

  // Henter bruker-ID uansett om den heter id eller userId
  const pickId = (user: LoggedInUser): number | null => {
    const id = user?.id ?? user?.userId;
    return typeof id === "number" && Number.isFinite(id) ? id : null;
  };

  // Henter navn (prioriterer fullName, så name, så email)
  const pickName = (user: LoggedInUser): string => {
    const raw = user?.fullName ?? user?.name ?? user?.email ?? "";
    return raw ? capitalize(raw) : "";
  };

  // Setter state for foresatt etter innlogging
  const handleParentLoggedIn = (user: LoggedInUser) => {
    const id = pickId(user);
    if (id != null) setParentId(id);
    setParentName(pickName(user));
    setView("parentDashboard");
  };

  // Setter state for ansatt etter innlogging
  const handleStaffLoggedIn = (user: LoggedInUser) => {
    const id = pickId(user);
    if (id != null) setStaffId(id);
    setStaffName(pickName(user));
    setView("staffDashboard");
  };

  // Logger ut og går tilbake til velkomstsiden
  const handleLogoutToWelcome = () => {
    setParentId(null);
    setParentName("");
    setStaffId(null);
    setStaffName("");
    setView("barnehageVelkommen");
  };

  // Navigasjon for ansatt-sider

  const backToStaffDashboard = () => setView("staffDashboard");

  // Fallback hvis daycareId ikke er satt (kan brukes i dev/demo)
  const effectiveDaycareId = daycareId ?? 1;

  return (
    <div className={`app-root theme-${theme}`}>
      <SettingsBar />

      {view === "registrerBarnehage" && <Forside onBarnehageRegistrert={handleBarnehageRegistrert} />}

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

      {view === "register" && <RegisterPage barnehageNavn={barnehageNavn || "Barnehage"} onBack={backToWelcome} />}

      {view === "resetPassword" && (
        <ResetPasswordPage barnehageNavn={barnehageNavn || "Barnehage"} onBack={backToWelcome} />
      )}

        {/* Parent-dashboard vises kun hvis parentId finnes*/}
      {view === "parentDashboard" && parentId != null && (
        <ParentDashboard parentId={parentId} parentName={parentName} onLogout={handleLogoutToWelcome} />
      )}

        {/*Staff-dashboard vises kun hvis staffId finnes*/}
      {view === "staffDashboard" && staffId != null && (
          <StaffDashboard
              staffId={staffId}
              staffName={staffName}
              daycareId={effectiveDaycareId}
              onLogout={handleLogoutToWelcome}
          />
      )}

        {/*Inline-side: registrer barn*/}
      {view === "staffRegisterChild" && staffId != null && (
        <StaffRegisterChildInline staffId={staffId} daycareId={effectiveDaycareId} onBack={backToStaffDashboard} />
      )}

        {/*Inline-side: opprett kalender-event*/}
      {view === "staffCreateCalendarEvent" && staffId != null && (
        <StaffCreateCalendarEventInline staffId={staffId} daycareId={effectiveDaycareId} onBack={backToStaffDashboard} />
      )}

        {/*Inline-side: profil*/}
      {view === "staffProfile" && staffId != null && (
        <StaffProfileInline userId={staffId} onBack={backToStaffDashboard} />
      )}
    </div>
  );
}

// Gjør første bokstav stor (brukes på navn)
function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Inline-side for ansatte: registrere barn
function StaffRegisterChildInline(props: { staffId: number; daycareId: number; onBack: () => void }) {
  const { staffId, daycareId, onBack } = props;

  // Avdelinger i barnehagen
  const [groups, setGroups] = useState<DaycareGroupWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Skjema-felter
  const [guardianEmail, setGuardianEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [groupId, setGroupId] = useState<number | "">("");

  // Henter avdelinger når komponenten åpnes eller daycareId endres
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const g = await getGroupsForDaycare(daycareId);
        setGroups(g);
      } catch (e: any) {
        setError(e?.message || "Kunne ikke hente avdelinger.");
      } finally {
        setLoading(false);
      }
    })();
  }, [daycareId]);

  // Validerer og sender inn skjema for å opprette barn
  const onSubmit = async () => {
    setError(null);
    if (!guardianEmail.trim()) return setError("Skriv inn foresatt sin e-post.");
    if (!firstName.trim() || !lastName.trim()) return setError("Fyll inn fornavn og etternavn.");
    if (!dob.trim()) return setError("Fyll inn fødselsdato (YYYY-MM-DD).");
    if (groupId === "") return setError("Velg avdeling.");

    try {
      const guardian = await getUserByEmail(guardianEmail.trim());
      if (guardian.role !== "PARENT") return setError("E-posten tilhører ikke en foresatt (PARENT).");

      await createChild({
        guardianUserId: guardian.id,
        daycareGroupId: Number(groupId),
        createdByUserId: staffId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob.trim(),
      });

      alert("Barn registrert ✅");
      onBack();
    } catch (e: any) {
      setError(e?.message || "Kunne ikke registrere barn.");
    }
  };

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="staff-header">
          <div className="staff-brand-text">Registrer barn</div>
          <div className="staff-top-actions">
            <button className="staff-link-button" onClick={onBack}>Tilbake</button>
          </div>
        </header>

        <main className="staff-main">
          {error && <p className="staff-empty-text" style={{ color: "#b91c1c" }}>{error}</p>}
          {loading ? (
            <p className="staff-empty-text">Laster avdelinger…</p>
          ) : (
            <div className="staff-department-card" style={{ padding: 12 }}>
              <label className="staff-empty-text">Foresatt e-post</label>
              <input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />

              <label className="staff-empty-text">Fornavn</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

              <label className="staff-empty-text">Etternavn</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

              <label className="staff-empty-text">Fødselsdato (YYYY-MM-DD)</label>
              <input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="2019-03-14" />

              <label className="staff-empty-text">Avdeling</label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">Velg…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <button className="staff-presence-toggle staff-presence-toggle--in" onClick={onSubmit} style={{ marginTop: 12 }}>
                Registrer barn
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Inline-side for ansatte: opprette kalender-event
function StaffCreateCalendarEventInline(props: { staffId: number; daycareId: number; onBack: () => void }) {
  const { staffId, daycareId, onBack } = props;

  // Skjema-felter
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState(""); // datetime-local
  const [endTime, setEndTime] = useState("");     // datetime-local
  const [error, setError] = useState<string | null>(null);

  // Konverterer datetime-local til ISO-format for backend
  const toIso = (dtLocal: string) => (dtLocal ? new Date(dtLocal).toISOString() : "");

  // Validerer og sender inn kalender-event
  const onSubmit = async () => {
    setError(null);
    if (!title.trim()) return setError("Tittel mangler.");
    if (!startTime) return setError("Starttid mangler.");

    try {
      await createCalendarEvent({
        daycareId,
        daycareGroupId: null,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        startTime: toIso(startTime),
        endTime: endTime ? toIso(endTime) : null,
        createdByUserId: staffId,
      });

      alert("Event opprettet ✅");
      onBack();
    } catch (e: any) {
      setError(e?.message || "Kunne ikke opprette event.");
    }
  };

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="staff-header">
          <div className="staff-brand-text">Nytt kalender-event</div>
          <div className="staff-top-actions">
            <button className="staff-link-button" onClick={onBack}>Tilbake</button>
          </div>
        </header>

        <main className="staff-main">
          {error && <p className="staff-empty-text" style={{ color: "#b91c1c" }}>{error}</p>}

          <div className="staff-department-card" style={{ padding: 12 }}>
            <label className="staff-empty-text">Tittel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="staff-empty-text">Beskrivelse</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

            <label className="staff-empty-text">Sted</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />

            <label className="staff-empty-text">Start</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

            <label className="staff-empty-text">Slutt (valgfritt)</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

            <button className="staff-presence-toggle staff-presence-toggle--in" onClick={onSubmit} style={{ marginTop: 12 }}>
              Opprett event
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// Inline-side for ansatte: profilside
function StaffProfileInline(props: { userId: number; onBack: () => void }) {
  const { userId, onBack } = props;

  // Laster-status og feilmelding
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profilfelter
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Henter profilen når siden åpnes
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getUserProfile(userId);
        setFullName(p.fullName ?? "");
        setEmail(p.email ?? "");
        setPhoneNumber(p.phoneNumber ?? "");
      } catch (e: any) {
        setError(e?.message || "Kunne ikke hente profil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Lagrer endringer i profilen
  const onSave = async () => {
    setError(null);
    if (!fullName.trim()) return setError("Navn kan ikke være tomt.");

    try {
      await updateUserProfile(userId, {
        fullName: fullName.trim(),
        email: email.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
      });

      alert("Profil oppdatert ✅");
      onBack();
    } catch (e: any) {
      setError(e?.message || "Kunne ikke lagre profil.");
    }
  };

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="staff-header">
          <div className="staff-brand-text">Min profil</div>
          <div className="staff-top-actions">
            <button className="staff-link-button" onClick={onBack}>Tilbake</button>
          </div>
        </header>

        <main className="staff-main">
          {error && <p className="staff-empty-text" style={{ color: "#b91c1c" }}>{error}</p>}
          {loading ? (
            <p className="staff-empty-text">Laster profil…</p>
          ) : (
            <div className="staff-department-card" style={{ padding: 12 }}>
              <label className="staff-empty-text">Fullt navn</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />

              <label className="staff-empty-text">E-post</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />

              <label className="staff-empty-text">Telefon</label>
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

              <button className="staff-presence-toggle staff-presence-toggle--in" onClick={onSave} style={{ marginTop: 12 }}>
                Lagre
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
