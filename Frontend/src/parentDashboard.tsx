import { useState, useEffect } from "react";
import "./forside.css";
import "./parentsDashboard.css";
import {
    changePassword,
    getUserProfile,
    updateUserProfile,
    getCalendarEventsForDaycare,
    type UserProfileResponse,
    type CalendarEventResponse,
} from "./api";

const API_BASE_URL = "http://localhost:8080"; // brukes fortsatt av de "gamle" fetchene under (barn/attendance/etc)

/* Enkelt status-felt i UI: enten ikke krysset inn eller krysset inn */
type ChildStatus = "notCheckedIn" | "checkedIn";

/* Aktivitet knyttet til barnet (chips på check-in), kan ha bilder */
export interface ChildActivity {
    id: number;
    label: string;
    photos: string[];
}

/* Plan for henting: dato + notat (f.eks. hvem henter / tidspunkt) */
export interface PickupPlan {
    id: number;
    date: string; // ISO-dato (yyyy-mm-dd)
    note: string;
}

/* Kalenderhendelser som appen viser (start/slutt, tittel, evt beskrivelse) */
export interface KindergartenEvent {
    id: number;
    date: string; // ISO datetime start
    endDate?: string; // ISO datetime end
    title: string;
    description?: string;
    location?: string | null;
    scope?: string; // "Hele barnehagen" eller avdelingsnavn
}

/* Hovedmodellen for et barn i dashboardet (både data og UI-felt) */
export interface Child {
    id: number;
    name: string;
    status: ChildStatus;
    lastCheckIn?: string;

    // Info-felt
    allergies?: string;
    department?: string;
    otherInfo?: string;

    photoUrl?: string;

    // Fravær / ferie-detaljer
    absenceDate?: string;
    absenceNote?: string;
    holidayFrom?: string;
    holidayTo?: string;

    // Hente-planer
    pickupPlans?: PickupPlan[];

    // Aktiviteter / bildeflyt
    activities?: ChildActivity[];

    note?: string;
}

/* Profil-info som foresatt kan redigere (navn, e-post, telefon) */
interface ParentProfile {
    name: string;
    email: string;
    phone: string;
}

/* Props til ParentDashboard: ID/navn kommer fra innlogging, onLogout tar deg ut */
interface ParentDashboardProps {
    parentId: number; // 👈 kommer fra App (Login)
    parentName: string;
    onLogout: () => void;
}

/* ---- Backend-respons (for "gamle" fetcher) ---- */
/* Disse typene matcher formatet backend returnerer i de eldre endepunktene */

interface BackendChild {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    active: boolean;
    daycareGroupId: number;
    daycareGroupName: string;
    daycareId: number;
    daycareName: string;
}

interface BackendAttendance {
    id: number;
    eventType: "IN" | "OUT";
    eventTime: string; // ISO-dato-tid
    note?: string;
}

// ChildDetailsController
interface BackendChildDetails {
    id: number;
    firstName: string;
    lastName: string;
    allergies?: string;
    medications?: string;
    favoriteFood?: string;
}

/* ---- Infoside for ett barn ---- */
/* Viser barnets avatar/navn og tre “accordion”-seksjoner: allergier, avdeling og annet */

interface ChildInfoProps {
    child: Child;
    onBack: () => void;
}

const ChildInfoPage = ({ child, onBack }: ChildInfoProps) => {
    /* Holder styr på hvilken seksjon som er åpen (start: allergier) */
    const [openSection, setOpenSection] = useState<string | null>("allergies");

    /* Klikk på en seksjon: åpner/lukker den */
    const toggleSection = (section: string) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    /* “Snille” fallback-tekster hvis feltene er tomme */
    const allergiesText = child.allergies?.trim() || "Ingen registrerte allergier.";
    const departmentText = child.department?.trim() || "Ingen avdeling registrert.";
    const otherText = child.otherInfo?.trim() || "Ingen ekstra informasjon registrert.";

    /* Brukes som placeholder-avatar hvis bildet mangler */
    const firstLetter = child.name.trim().charAt(0).toUpperCase();

    return (
        <section className="child-info-page">
            <div className="child-info-header">
                {/* Viser bilde hvis det finnes, ellers initial i sirkel */}
                {child.photoUrl ? (
                    <img src={child.photoUrl} alt={`Bilde av ${child.name}`} className="child-info-avatar" />
                ) : (
                    <div className="child-info-avatar child-info-avatar--placeholder">{firstLetter}</div>
                )}

                <div>
                    <h1 className="child-info-title">{child.name}</h1>
                    {child.department && <p className="child-info-subtitle">Avdeling {child.department}</p>}
                </div>
            </div>

            {/* Accordion-boksen med tre seksjoner */}
            <div className="child-info-box">
                <div className="child-info-row">
                    <button type="button" className="info-pill" onClick={() => toggleSection("allergies")}>
            <span className="info-pill-emoji" aria-hidden="true">
              🥜
            </span>
                        <span className="info-pill-label">Allergier</span>
                        <span
                            className={`info-pill-arrow ${openSection === "allergies" ? "info-pill-arrow--open" : ""}`}
                            aria-hidden="true"
                        >
              ▾
            </span>
                    </button>
                    {openSection === "allergies" && <p className="info-pill-text">{allergiesText}</p>}
                </div>

                <div className="child-info-row">
                    <button type="button" className="info-pill" onClick={() => toggleSection("department")}>
            <span className="info-pill-emoji" aria-hidden="true">
              🏠
            </span>
                        <span className="info-pill-label">Avdeling</span>
                        <span
                            className={`info-pill-arrow ${openSection === "department" ? "info-pill-arrow--open" : ""}`}
                            aria-hidden="true"
                        >
              ▾
            </span>
                    </button>
                    {openSection === "department" && <p className="info-pill-text">{departmentText}</p>}
                </div>

                <div className="child-info-row">
                    <button type="button" className="info-pill" onClick={() => toggleSection("other")}>
            <span className="info-pill-emoji" aria-hidden="true">
              ⭐
            </span>
                        <span className="info-pill-label">Annet</span>
                        <span className={`info-pill-arrow ${openSection === "other" ? "info-pill-arrow--open" : ""}`} aria-hidden="true">
              ▾
            </span>
                    </button>
                    {openSection === "other" && <p className="info-pill-text">{otherText}</p>}
                </div>
            </div>

            {/* Navigasjon tilbake til barnelista */}
            <button type="button" className="login-button child-info-back-button" onClick={onBack}>
                Tilbake til &quot;Dine barn&quot;
            </button>
        </section>
    );
};

/* ---- Check-in side for ett barn ---- */
/* Lar foresatt registrere: tilstede, fravær eller ferie + (valgfritt) henteplan */

type CheckInOption = "present" | "absent" | "holiday";

interface CheckInPageProps {
    child: Child;
    reminderText?: string | null;
    calendarEvents?: KindergartenEvent[];
    onBack: () => void;
    onConfirm: (data: {
        option: CheckInOption;
        absenceDate?: string;
        absenceNote?: string;
        holidayFrom?: string;
        holidayTo?: string;
        pickupDate?: string;
        pickupNote?: string;
    }) => void;
    onOpenActivity: (activity: ChildActivity) => void;
    onOpenCalendar: () => void;
}

const CheckInPage = ({
                         child,
                         reminderText,
                         calendarEvents,
                         onBack,
                         onConfirm,
                         onOpenActivity,
                         onOpenCalendar,
                     }: CheckInPageProps) => {
    /* Hvilket valg foresatt har tatt (start: present) */
    const [selectedOption, setSelectedOption] = useState<CheckInOption>("present");

    /* Dagens dato i yyyy-mm-dd (brukes som default i date-inputs) */
    const todayISO = new Date().toISOString().slice(0, 10);

    /* Felter for fravær */
    const [absenceDate, setAbsenceDate] = useState<string>(todayISO);
    const [absenceNote, setAbsenceNote] = useState<string>("");

    /* Felter for ferie */
    const [holidayFrom, setHolidayFrom] = useState<string>("");
    const [holidayTo, setHolidayTo] = useState<string>("");

    /* Felter for henting */
    const [pickupDate, setPickupDate] = useState<string>(todayISO);
    const [pickupNote, setPickupNote] = useState<string>("");

    /* Når foresatt bekrefter: sender alle feltene tilbake til ParentDashboard */
    const handleConfirm = () => {
        onConfirm({
            option: selectedOption,
            absenceDate,
            absenceNote,
            holidayFrom,
            holidayTo,
            pickupDate,
            pickupNote,
        });
    };

    /* Placeholder-aktiviteter hvis barnet ikke har faktiske aktiviteter enda */
    const defaultActivities: ChildActivity[] = [
        { id: 1, label: "🖼️ Bilde fra i går", photos: [] },
        { id: 2, label: "🌲 Tur i skogen", photos: [] },
        { id: 3, label: "🎉 Bursdagsfeiring", photos: [] },
    ];

    /* Bruk barnets aktiviteter hvis de finnes, ellers fallback-lista */
    const activitiesToShow: ChildActivity[] = child.activities && child.activities.length > 0 ? child.activities : defaultActivities;

    /* Tar maks 3 kommende kalenderhendelser (fra i dag og fremover) */
    const upcomingEvents: KindergartenEvent[] = (calendarEvents ?? [])
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((evt) => evt.date.slice(0, 10) >= todayISO)
        .slice(0, 3);

    return (
        <section className="checkin-page">
            <h1 className="checkin-title">Kryss inn {child.name}</h1>
            <p className="checkin-subtitle">Trykk på knappen for å krysse inn {child.name}.</p>

            <div className="checkin-card">
                <div className="checkin-card-header">
                    <div>
                        <h2 className="checkin-child-name">{child.name}</h2>
                        <p className="checkin-child-subtitle">
                            Trykk for å krysse inn → {child.department ? ` Avdeling ${child.department}` : ""}
                        </p>
                    </div>
                    <span className="checkin-status-badge">Borte</span>
                </div>

                <div className="checkin-card-body">
                    {/* Toggle fravær: klikker du igjen går du tilbake til “present” */}
                    <button
                        type="button"
                        className="checkin-radio-row"
                        onClick={() => setSelectedOption((prev) => (prev === "absent" ? "present" : "absent"))}
                    >
                        <span className={`radio-circle ${selectedOption === "absent" ? "radio-circle--selected" : ""}`} />
                        <span className="checkin-radio-label">🚫 Registrer fravær</span>
                    </button>

                    {/* Ekstra felter som bare vises når fravær er valgt */}
                    {selectedOption === "absent" && (
                        <div className="checkin-extra-fields">
                            <div className="checkin-field">
                                <label className="checkin-field-label">Dato</label>
                                <input type="date" className="checkin-field-input" value={absenceDate} onChange={(e) => setAbsenceDate(e.target.value)} />
                            </div>
                            <div className="checkin-field">
                                <label className="checkin-field-label">Notat (f.eks. sykdom)</label>
                                <input
                                    type="text"
                                    className="checkin-field-input"
                                    placeholder="Feber, forkjølet, time hos lege ..."
                                    value={absenceNote}
                                    onChange={(e) => setAbsenceNote(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Toggle ferie: klikker du igjen går du tilbake til “present” */}
                    <button
                        type="button"
                        className="checkin-radio-row"
                        onClick={() => setSelectedOption((prev) => (prev === "holiday" ? "present" : "holiday"))}
                    >
                        <span className={`radio-circle ${selectedOption === "holiday" ? "radio-circle--selected" : ""}`} />
                        <span className="checkin-radio-label">🏝️ Legg inn ferie</span>
                    </button>

                    {/* Ekstra felter som bare vises når ferie er valgt */}
                    {selectedOption === "holiday" && (
                        <div className="checkin-extra-fields">
                            <div className="checkin-field-row">
                                <div className="checkin-field">
                                    <label className="checkin-field-label">Fra</label>
                                    <input type="date" className="checkin-field-input" value={holidayFrom} onChange={(e) => setHolidayFrom(e.target.value)} />
                                </div>
                                <div className="checkin-field">
                                    <label className="checkin-field-label">Til</label>
                                    <input type="date" className="checkin-field-input" value={holidayTo} onChange={(e) => setHolidayTo(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Valgfri påminnelse/beskjed som vises hvis den finnes */}
                    {reminderText && (
                        <div className="checkin-reminder">
              <span className="checkin-reminder-emoji" aria-hidden="true">
                📌
              </span>
                            <span className="checkin-reminder-text">{reminderText}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Henteplan: foresatt kan legge inn dato + beskjed om hvem som henter */}
            <div className="pickup-section">
                <p className="pickup-title">Hvem henter i barnehagen?</p>
                <div className="checkin-extra-fields">
                    <div className="checkin-field">
                        <label className="checkin-field-label">Dato for henting</label>
                        <input type="date" className="checkin-field-input" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                    </div>
                    <div className="checkin-field">
                        <label className="checkin-field-label">Melding om henting</label>
                        <input
                            type="text"
                            className="checkin-field-input"
                            placeholder="F.eks. Bestemor henter kl 15:30"
                            value={pickupNote}
                            onChange={(e) => setPickupNote(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Aktivitets-chips: åpner galleri for valgt aktivitet + knapp til kalender */}
            <div className="checkin-activities">
                <p className="checkin-activities-title">Se hva {child.name} har gjort</p>
                <div className="checkin-activities-chips">
                    {activitiesToShow.map((activity) => (
                        <button key={activity.id} type="button" className="activity-chip" onClick={() => onOpenActivity(activity)}>
                            {activity.label}
                        </button>
                    ))}

                    <button type="button" className="activity-chip calendar-chip" onClick={onOpenCalendar}>
                        📅 Barnehagens kalender
                    </button>
                </div>
            </div>

            {/* “Kommende” liste: de 3 neste kalenderhendelsene */}
            {upcomingEvents.length > 0 && (
                <div className="calendar-section">
                    <p className="calendar-title">Kommende i barnehagen</p>
                    <ul className="calendar-list">
                        {upcomingEvents.map((evt) => (
                            <li key={evt.id} className="calendar-item">
                                <span className="calendar-date">{new Date(evt.date).toLocaleDateString("nb-NO")}</span>
                                <span className="calendar-dot" />
                                <span className="calendar-text">{evt.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Bekreft-knapp: sender valgene til onConfirm */}
            <button type="button" className="login-button checkin-primary-button" onClick={handleConfirm}>
                Kryss inn {child.name} nå
            </button>

            {/* Tilbake-navigasjon */}
            <button type="button" className="secondary-button checkin-back-button" onClick={onBack}>
                Tilbake
            </button>
        </section>
    );
};
/* ========= Galleri-side for aktiviteter ========= */
/* Viser en valgt aktivitet og alle bilder som hører til den (hvis noen). */

interface ActivityGalleryProps {
    child: Child;
    activity: ChildActivity;
    onBack: () => void;
}

const ActivityGalleryPage = ({ child, activity, onBack }: ActivityGalleryProps) => {
    return (
        <section className="gallery-page">
            {/* Tittel = navnet/labelen på aktiviteten (f.eks “Tur i skogen”) */}
            <h1 className="gallery-title">{activity.label}</h1>
            {/* Forklarer at bilder kommer fra ansatte og er knyttet til barnet */}
            <p className="gallery-subtitle">Bilder lagt inn av ansatte for {child.name}.</p>

            {/* Hvis aktiviteten har bilder: vis dem i en liste/grid */}
            {activity.photos && activity.photos.length > 0 ? (
                <div className="gallery-images">
                    {activity.photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`${activity.label} – bilde ${idx + 1}`} className="gallery-image" />
                    ))}
                </div>
            ) : (
                /* Hvis ingen bilder finnes: vis “tom tilstand”-melding */
                <p className="gallery-empty">Ingen bilder er lagt inn enda. Dette fylles fra ansatt-siden.</p>
            )}

            {/* Navigasjon tilbake (typisk til check-in-siden) */}
            <button type="button" className="secondary-button checkin-back-button" onClick={onBack}>
                Tilbake
            </button>
        </section>
    );
};

/* ========= Kalender-side (fullvisning) ========= */
/* Full oversikt over barnehagens kalender, delt i kommende og tidligere hendelser. */

interface CalendarPageProps {
    events: KindergartenEvent[];
    onBack: () => void;
}

const CalendarPage = ({ events, onBack }: CalendarPageProps) => {
    /* ISO-dato for i dag (yyyy-mm-dd) brukes til å splitte events i “kommende” og “tidligere” */
    const todayISO = new Date().toISOString().slice(0, 10);

    /* Sorterer events på startdato, og deler dem i kommende vs tidligere */
    const sortedEvents = events.slice().sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = sortedEvents.filter((e) => e.date.slice(0, 10) >= todayISO);
    const past = sortedEvents.filter((e) => e.date.slice(0, 10) < todayISO);

    /* Formatterer dato (med ukedag) for fin visning i kalenderlista */
    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString("nb-NO", { weekday: "short", year: "numeric", month: "short", day: "2-digit" });

    /* Formatterer klokkeslett (HH:mm) */
    const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

    /* Lager tidsintervall: start, eller start–slutt hvis slutt finnes */
    const fmtRange = (start: string, end?: string) => {
        const s = fmtTime(start);
        if (!end) return s;
        return `${s} – ${fmtTime(end)}`;
    };

    /* “Rad-komponent” for én kalenderhendelse (brukes både for kommende og tidligere) */
    const Row = ({ evt }: { evt: KindergartenEvent }) => (
        <li className="calendar-item calendar-item--full">
            {/* Dato til venstre + dekor-prikk */}
            <span className="calendar-date">{fmtDate(evt.date)}</span>
            <span className="calendar-dot" />
            <div className="calendar-item-text">
                {/* Tittel på hendelsen */}
                <span className="calendar-text">{evt.title}</span>

                {/* Ekstra info: tid og avdeling/scope */}
                <span className="calendar-description">⏰ {fmtRange(evt.date, evt.endDate)}</span>
                <span className="calendar-description">🧩 Avdeling: {evt.scope ?? "Hele barnehagen"}</span>

                {/* Viser sted/beskrivelse bare hvis de finnes */}
                {evt.location && <span className="calendar-description">📍 Sted: {evt.location}</span>}
                {evt.description && <span className="calendar-description">{evt.description}</span>}
            </div>
        </li>
    );

    return (
        <section className="calendar-page">
            <h1 className="calendar-page-title">Barnehagens kalender</h1>
            <p className="calendar-page-subtitle">Oversikt over planlagte aktiviteter og merkedager.</p>

            {/* Hvis ingen events i det hele tatt: vis tom-melding */}
            {sortedEvents.length === 0 && (
                <p className="calendar-empty">Kalenderen er ikke fylt inn enda. Dette kommer fra barnehagens system.</p>
            )}

            {/* Kommende events */}
            {upcoming.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Kommende</h2>
                    <ul className="calendar-list">{upcoming.map((evt) => <Row key={evt.id} evt={evt} />)}</ul>
                </div>
            )}

            {/* Tidligere events */}
            {past.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Tidligere</h2>
                    <ul className="calendar-list">{past.map((evt) => <Row key={evt.id} evt={evt} />)}</ul>
                </div>
            )}

            {/* Tilbake-knapp */}
            <button type="button" className="secondary-button checkin-back-button" onClick={onBack}>
                Tilbake
            </button>
        </section>
    );
};

/* ========= Profil-side for foresatt ========= */
/* Lar foresatt redigere egen kontaktinfo, be om nytt passord, og redigere barnas info lokalt før lagring. */

interface ProfilePageProps {
    parentProfile: ParentProfile;
    onUpdateParentProfile: (profile: ParentProfile) => void;
    children: Child[];
    onUpdateChildren: (children: Child[]) => void;
    onBack: () => void;
    onPasswordReset: (newPassword: string) => void;
}

const ProfilePage = ({ parentProfile, onUpdateParentProfile, children, onUpdateChildren, onBack, onPasswordReset }: ProfilePageProps) => {
    /* Lokale kopier: lar brukeren skrive og så lagre samlet */
    const [localParent, setLocalParent] = useState<ParentProfile>(parentProfile);
    const [localChildren, setLocalChildren] = useState<Child[]>(children);

    /* Passordfelt for “reset passord” */
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    /* Accordion-styring: hva som er åpent i profilen */
    const [openSections, setOpenSections] = useState<{ parent: boolean; password: boolean; children: boolean }>({
        parent: true,
        password: false,
        children: false,
    });

    /* Når props endres utenfra: synk lokale states (så UI viser riktig data) */
    useEffect(() => setLocalParent(parentProfile), [parentProfile]);
    useEffect(() => setLocalChildren(children), [children]);

    /* Åpne/lukke seksjoner (accordion) */
    const toggleSection = (key: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    /* Oppdaterer ett felt på ett spesifikt barn i listen */
    const handleChildChange = (index: number, field: keyof Child, value: string) => {
        setLocalChildren((prev) => {
            const copy = [...prev];
            const child = { ...copy[index] };

            if (field === "name") child.name = value;
            else if (field === "allergies") child.allergies = value || undefined;
            else if (field === "department") child.department = value || undefined;
            else if (field === "otherInfo") child.otherInfo = value || undefined;
            else if (field === "photoUrl") child.photoUrl = value || undefined;

            copy[index] = child;
            return copy;
        });
    };

    /* Lagrer endringer ved å sende lokale verdier tilbake til parent-komponenten */
    const handleSaveProfile = () => {
        onUpdateParentProfile(localParent);
        onUpdateChildren(localChildren);
    };

    /* Validerer passord og sender videre for faktisk reset */
    const handlePasswordSubmit = () => {
        if (!newPassword.trim() || !confirmPassword.trim()) {
            alert("Fyll inn begge passordfeltene.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passordene er ikke like.");
            return;
        }
        onPasswordReset(newPassword);
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <section className="profile-page">
            <h1 className="profile-title">Min profil</h1>

            {/* Seksjon: Foresattinfo */}
            <div className="profile-section">
                <button type="button" className="profile-section-header" onClick={() => toggleSection("parent")}>
                    <span className="profile-section-title">Foresatt</span>
                    <span className={`profile-section-arrow ${openSections.parent ? "profile-section-arrow--open" : ""}`}>▾</span>
                </button>

                {openSections.parent && (
                    <div className="profile-section-body">
                        {/* Navn */}
                        <div className="form-field">
                            <label className="form-label">Navn</label>
                            <input
                                type="text"
                                className="text-input"
                                value={localParent.name}
                                onChange={(e) => setLocalParent((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Ditt navn"
                            />
                        </div>

                        {/* E-post */}
                        <div className="form-field">
                            <label className="form-label">E-post</label>
                            <input
                                type="email"
                                className="text-input"
                                value={localParent.email}
                                onChange={(e) => setLocalParent((p) => ({ ...p, email: e.target.value }))}
                                placeholder="din.epost@eksempel.no"
                            />
                        </div>

                        {/* Telefon */}
                        <div className="form-field">
                            <label className="form-label">Telefonnummer</label>
                            <input
                                type="tel"
                                className="text-input"
                                value={localParent.phone}
                                onChange={(e) => setLocalParent((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="F.eks. 900 00 000"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Seksjon: Passord */}
            <div className="profile-section">
                <button type="button" className="profile-section-header" onClick={() => toggleSection("password")}>
                    <span className="profile-section-title">Passord</span>
                    <span className={`profile-section-arrow ${openSections.password ? "profile-section-arrow--open" : ""}`}>▾</span>
                </button>

                {openSections.password && (
                    <div className="profile-section-body">
                        <p className="profile-section-hint">Her kan du be om å sette nytt passord.</p>

                        <div className="form-field">
                            <label className="form-label">Nytt passord</label>
                            <input
                                type="password"
                                className="text-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Gjenta nytt passord</label>
                            <input
                                type="password"
                                className="text-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Trigger reset-passord (med enkel validering først) */}
                        <button type="button" className="secondary-button full-width-secondary profile-password-button" onClick={handlePasswordSubmit}>
                            Reset passord
                        </button>
                    </div>
                )}
            </div>

            {/* Seksjon: Barn */}
            <div className="profile-section">
                <button type="button" className="profile-section-header" onClick={() => toggleSection("children")}>
                    <span className="profile-section-title">Barn ({localChildren.length})</span>
                    <span className={`profile-section-arrow ${openSections.children ? "profile-section-arrow--open" : ""}`}>▾</span>
                </button>

                {openSections.children && (
                    <div className="profile-section-body">
                        {/* Hvis ingen barn: vis forklaring */}
                        {localChildren.length === 0 ? (
                            <p className="profile-section-hint">Du har ingen registrerte barn enda. Legg til barn fra hovedsiden.</p>
                        ) : (
                            /* Hvis barn finnes: vis redigeringskort for hvert barn */
                            <div className="profile-children-list">
                                {localChildren.map((child, index) => (
                                    <div key={child.id} className="profile-child-card">
                                        <p className="profile-child-title">{child.name}</p>

                                        <div className="form-field">
                                            <label className="form-label">Navn</label>
                                            <input type="text" className="text-input" value={child.name} onChange={(e) => handleChildChange(index, "name", e.target.value)} />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Lenke til bilde</label>
                                            <input
                                                type="url"
                                                className="text-input"
                                                value={child.photoUrl ?? ""}
                                                onChange={(e) => handleChildChange(index, "photoUrl", e.target.value)}
                                                placeholder="https://…"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Allergier</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.allergies ?? ""}
                                                onChange={(e) => handleChildChange(index, "allergies", e.target.value)}
                                                placeholder="F.eks. nøtter, melk, pollen"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Avdeling</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.department ?? ""}
                                                onChange={(e) => handleChildChange(index, "department", e.target.value)}
                                                placeholder="F.eks. Rød, Blå, Løvene"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Annet</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.otherInfo ?? ""}
                                                onChange={(e) => handleChildChange(index, "otherInfo", e.target.value)}
                                                placeholder="Henting, språk, spesielle beskjeder..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lagrer alle endringer samlet */}
            <button type="button" className="login-button profile-save-button" onClick={handleSaveProfile}>
                Lagre endringer
            </button>

            {/* Navigasjon tilbake */}
            <button type="button" className="secondary-button profile-back-button" onClick={onBack}>
                Tilbake til &quot;Dine barn&quot;
            </button>
        </section>
    );
};

/* ========= Selve dashboardet ========= */

/* Brukes som “routing” internt i komponenten (hvilken skjerm som vises) */
type ActiveView = "list" | "info" | "checkIn" | "gallery" | "calendar" | "profile";

/* Data som brukes i suksess-overlay etter innsjekk */
interface CheckInSuccessData {
    childName: string;
    department?: string;
    time: string;
}

/* --- Backend-kall (beholdt som før) --- */
/* Disse fetch-funksjonene snakker direkte med backend via API_BASE_URL */

async function fetchChildrenForGuardian(guardianId: number): Promise<BackendChild[]> {
    /* Henter alle barn knyttet til foresatt */
    const res = await fetch(`${API_BASE_URL}/api/children/guardian/${guardianId}`);
    if (!res.ok) throw new Error(`Feil ved henting av barn: ${res.status}`);
    return res.json();
}

async function postVacationRange(params: { childId: number; userId: number; from: string; to: string; note?: string }) {
    /* Registrerer ferieperiode for et barn */
    const res: Response = await fetch(`${API_BASE_URL}/api/vacation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            childId: params.childId,
            reportedByUserId: params.userId,
            startDate: params.from,
            endDate: params.to,
            note: params.note ?? "",
        }),
    });

    if (!res.ok) throw new Error(`Feil ved registrering av ferie: ${res.status}`);
}

async function fetchLatestAttendanceForChild(childId: number): Promise<BackendAttendance | null> {
    /* Henter siste IN/OUT-event for et barn (brukes til å sette status i UI) */
    const res = await fetch(`${API_BASE_URL}/api/attendance/child/${childId}/latest`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Feil ved henting av attendance: ${res.status}`);
    return res.json();
}

async function postAttendanceEvent(params: { childId: number; userId: number; eventType: "IN" | "OUT"; note?: string }) {
    /* Sender inn/ut-kryssing til backend */
    const res = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            childId: params.childId,
            performedByUserId: params.userId,
            eventType: params.eventType,
            note: params.note,
        }),
    });

    if (!res.ok) throw new Error(`Feil ved registrering av attendance: ${res.status}`);
}

async function postAbsence(params: { childId: number; userId: number; date: string; reason: string; note?: string }) {
    /* Registrerer fravær for en gitt dato */
    const res = await fetch(`${API_BASE_URL}/api/absence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            childId: params.childId,
            reportedByUserId: params.userId,
            date: params.date,
            reason: params.reason,
            note: params.note ?? params.reason,
        }),
    });

    if (!res.ok) throw new Error(`Feil ved registrering av fravær: ${res.status}`);
}

async function fetchChildDetails(childId: number): Promise<BackendChildDetails> {
    /* Henter “ekstra” barnedetaljer (allergier, favorittmat osv.) */
    const res = await fetch(`${API_BASE_URL}/api/children/${childId}/details`);
    if (!res.ok) throw new Error(`Feil ved henting av barnedetaljer: ${res.status}`);
    return res.json();
}

async function updateChildDetailsOnServer(child: Child): Promise<void> {
    /* Oppdaterer barnedetaljer fra profil-siden (PUT) */
    const res = await fetch(`${API_BASE_URL}/api/children/${child.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            allergies: child.allergies ?? "",
            medications: "",
            favoriteFood: child.otherInfo ?? "",
        }),
    });

    if (!res.ok) throw new Error(`Feil ved oppdatering av barnedetaljer: ${res.status}`);
}

/* --- Kalender mapping --- */
/* Gjør om backend-format til UI-format som CalendarPage/CheckInPage forventer */

function mapCalendarEventsToKindergarten(events: CalendarEventResponse[]): KindergartenEvent[] {
    return events.map((e) => ({
        id: e.id,
        date: e.startTime,
        endDate: e.endTime ?? undefined,
        title: e.title,
        scope: e.daycareGroupName?.trim() ? e.daycareGroupName : "Hele barnehagen",
        location: e.location?.trim() ? e.location : null,
        description: e.description?.trim() ? e.description : undefined,
    }));
}

/* ======= ParentDashboard ======= */
/* Hovedkomponenten for foresatt: barneliste, check-in, info, galleri, kalender og profil */

const ParentDashboard = ({ parentId, parentName, onLogout }: ParentDashboardProps) => {
    /* Liste med alle barn som foresatt har tilgang til */
    const [children, setChildren] = useState<Child[]>([]);

    /* Hvilket barn som er “aktivt” når man er inne på info/checkin/galleri */
    const [activeChild, setActiveChild] = useState<Child | null>(null);

    /* Hvilken skjerm (view) som vises akkurat nå */
    const [activeView, setActiveView] = useState<ActiveView>("list");

    /* Hvilken aktivitet som er valgt når man er i galleri */
    const [activeActivity, setActiveActivity] = useState<ChildActivity | null>(null);

    /* Kalenderhendelser for barnehagen */
    const [calendarEvents, setCalendarEvents] = useState<KindergartenEvent[]>([]);

    /* “Dagens påminnelse” (valgfri tekst som kan vises i check-in) */
    const [todayReminder, setTodayReminder] = useState<string | null>(null);

    /* Hvis innsjekk er fullført, vises et overlay med bekreftelse */
    const [checkInSuccess, setCheckInSuccess] = useState<CheckInSuccessData | null>(null);

    /* Profilfelt for foresatt (hentes fra backend) */
    const [parentProfile, setParentProfile] = useState<ParentProfile>({
        name: parentName,
        email: "",
        phone: "",
    });

    /* DaycareId brukes for å hente riktig kalender (fallback 1) */
    // Vi finner daycareId basert på første barn som hentes (fallback 1)
    const [daycareId, setDaycareId] = useState<number>(1);

    /* Første load: henter barn + attendance-status + barnedetaljer + foresattprofil */
    useEffect(() => {
        const loadData = async () => {
            try {
                /* 1) Hent barn fra backend */
                const backendChildren = await fetchChildrenForGuardian(parentId);

                /* 2) Finn daycareId basert på første barn (hvis finnes) */
                if (backendChildren.length > 0 && backendChildren[0].daycareId) {
                    setDaycareId(backendChildren[0].daycareId);
                } else {
                    setDaycareId(1);
                }

                /* 3) Map backend-barn til UI-barn (grunnfelt) */
                const mappedChildren: Child[] = backendChildren.map((bc) => ({
                    id: bc.id,
                    name: `${bc.firstName} ${bc.lastName}`,
                    status: "notCheckedIn",
                    note: "Ikke krysset inn ennå",
                    department: bc.daycareGroupName,
                }));

                /* 4) For hvert barn: hent siste IN/OUT og sett status/tekst */
                const withStatus: Child[] = await Promise.all(
                    mappedChildren.map(async (child) => {
                        try {
                            const att = await fetchLatestAttendanceForChild(child.id);
                            if (!att) return child;

                            const timeStr = new Date(att.eventTime).toLocaleTimeString("nb-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            if (att.eventType === "IN") {
                                return { ...child, status: "checkedIn", lastCheckIn: timeStr, note: `Krysset inn ${timeStr}` };
                            }

                            return { ...child, status: "notCheckedIn", lastCheckIn: undefined, note: `Sist registrert: ute ${timeStr}` };
                        } catch (e) {
                            console.error("Klarte ikke hente attendance for barn", e);
                            return child;
                        }
                    })
                );

                /* 5) For hvert barn: hent barnedetaljer (allergier, osv.) */
                const withDetails: Child[] = await Promise.all(
                    withStatus.map(async (child) => {
                        try {
                            const details = await fetchChildDetails(child.id);
                            return {
                                ...child,
                                allergies: details.allergies ?? undefined,
                                otherInfo: details.favoriteFood ?? undefined,
                            };
                        } catch (e) {
                            console.error("Klarte ikke hente barnedetaljer", e);
                            return child;
                        }
                    })
                );

                /* 6) Lagre ferdig liste i state */
                setChildren(withDetails);

                /* Resetter dagens påminnelse (hvis den skulle vært brukt senere) */
                setTodayReminder(null);
            } catch (e) {
                console.error("Feil ved henting av barnsdata", e);
            }

            // Profil
            try {
                /* Henter foresattprofil (navn, epost, telefon) */
                const profile: UserProfileResponse = await getUserProfile(parentId);
                setParentProfile({
                    name: profile.fullName ?? parentName,
                    email: profile.email ?? "",
                    phone: profile.phoneNumber ?? "",
                });
            } catch (e) {
                console.error("Feil ved henting av brukerprofil", e);
            }
        };

        loadData();
    }, [parentId, parentName]);

    /* Kalender-load: hentes når daycareId er kjent/endres */
    // Hent kalender (når daycareId er kjent / endrer seg)
    useEffect(() => {
        const loadCalendar = async () => {
            try {
                /* Henter events fra api.ts og mapper til UI-format */
                const events = await getCalendarEventsForDaycare(daycareId);
                setCalendarEvents(mapCalendarEventsToKindergarten(events));
            } catch (e) {
                console.error("Feil ved henting av kalender", e);
                setCalendarEvents([]);
            }
        };

        void loadCalendar();
    }, [daycareId]);

    /* Hurtig toggle inn/ut direkte fra lista (uten check-in-skjermen) */
    const toggleCheckStatusDirect = async (id: number) => {
        const child = children.find((c) => c.id === id);
        if (!child) return;

        const isCheckedIn = child.status === "checkedIn";
        const eventType: "IN" | "OUT" = isCheckedIn ? "OUT" : "IN";
        const now = new Date();
        const timeStr = now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

        try {
            /* Sender IN/OUT til backend */
            await postAttendanceEvent({
                childId: id,
                userId: parentId,
                eventType,
                note: isCheckedIn ? "Forelder sjekket ut via app" : "Forelder sjekket inn via app",
            });

            /* Oppdaterer barnet lokalt i state, så UI endrer seg med en gang */
            setChildren((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? {
                            ...c,
                            status: isCheckedIn ? "notCheckedIn" : "checkedIn",
                            lastCheckIn: isCheckedIn ? undefined : timeStr,
                            note: isCheckedIn ? "Ikke krysset inn ennå" : `Krysset inn ${timeStr}`,
                            absenceDate: undefined,
                            absenceNote: undefined,
                            holidayFrom: undefined,
                            holidayTo: undefined,
                        }
                        : c
                )
            );
        } catch (e) {
            console.error("Feil ved registrering av attendance", e);
            alert("Klarte ikke å registrere inn/ut-kryssing.");
        }
    };

    /* Navigasjon: åpne infoside for valgt barn */
    const openChildInfo = (child: Child) => {
        setActiveChild(child);
        setActiveView("info");
    };

    /* Navigasjon: åpne check-in-side for valgt barn */
    const openChildCheckIn = (child: Child) => {
        setActiveChild(child);
        setActiveView("checkIn");
    };

    /* Navigasjon: åpne kalender fra listevisning */
    const openCalendarFromList = () => {
        setActiveChild(null);
        setActiveView("calendar");
    };

    /* Navigasjon: tilbake til barnelista (nuller aktivt barn/aktivitet) */
    const backToList = () => {
        setActiveChild(null);
        setActiveActivity(null);
        setActiveView("list");
    };

    /* Tar imot data fra CheckInPage og gjør riktige backend-kall + oppdaterer state */
    const handleConfirmCheckIn = async (data: {
        option: CheckInOption;
        absenceDate?: string;
        absenceNote?: string;
        holidayFrom?: string;
        holidayTo?: string;
        pickupDate?: string;
        pickupNote?: string;
    }) => {
        if (!activeChild) return;

        const { option, absenceDate, absenceNote, holidayFrom, holidayTo, pickupDate, pickupNote } = data;

        const now = new Date();
        const timeStr = now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
        const todayISO = new Date().toISOString().slice(0, 10);

        /* 1) Utfør backend-kall basert på valgt option */
        if (option === "present") {
            try {
                await postAttendanceEvent({
                    childId: activeChild.id,
                    userId: parentId,
                    eventType: "IN",
                    note: "Forelder sjekket inn via app",
                });
            } catch (e) {
                console.error("Feil ved innsjekk", e);
                alert("Klarte ikke å registrere innsjekk.");
                return;
            }
        } else if (option === "absent") {
            try {
                const dateToSend = absenceDate || todayISO;
                const noteText = absenceNote?.trim() || "Fravær registrert via app";
                await postAbsence({
                    childId: activeChild.id,
                    userId: parentId,
                    date: dateToSend,
                    reason: noteText,
                    note: noteText,
                });
            } catch (e) {
                console.error("Feil ved registrering av fravær", e);
                alert("Klarte ikke å registrere fravær.");
                return;
            }
        } else if (option === "holiday") {
            try {
                if (!holidayFrom || !holidayTo) {
                    alert("Velg både fra- og tildato for ferie.");
                    return;
                }
                await postVacationRange({
                    childId: activeChild.id,
                    userId: parentId,
                    from: holidayFrom,
                    to: holidayTo,
                    note: "Ferie registrert via app",
                });
            } catch (e) {
                console.error("Feil ved registrering av ferie", e);
                alert("Klarte ikke å registrere ferie.");
                return;
            }
        }

        /* 2) Oppdater barnet lokalt i state basert på samme option */
        setChildren((prev) =>
            prev.map((child) => {
                if (child.id !== activeChild.id) return child;

                let updatedChild: Child = { ...child };

                if (option === "present") {
                    updatedChild = {
                        ...updatedChild,
                        status: "checkedIn",
                        lastCheckIn: timeStr,
                        note: `Krysset inn ${timeStr}`,
                        absenceDate: undefined,
                        absenceNote: undefined,
                        holidayFrom: undefined,
                        holidayTo: undefined,
                    };
                } else if (option === "absent") {
                    const formattedDate = absenceDate ? new Date(absenceDate).toLocaleDateString("nb-NO") : "i dag";
                    const noteText = absenceNote?.trim() ? ` – ${absenceNote.trim()}` : "";
                    updatedChild = {
                        ...updatedChild,
                        status: "notCheckedIn",
                        lastCheckIn: undefined,
                        absenceDate,
                        absenceNote,
                        holidayFrom: undefined,
                        holidayTo: undefined,
                        note: `Registrert fravær ${formattedDate}${noteText}`,
                    };
                } else {
                    let dateRangeText = "";
                    if (holidayFrom || holidayTo) {
                        const fromText = holidayFrom ? new Date(holidayFrom).toLocaleDateString("nb-NO") : "?";
                        const toText = holidayTo ? new Date(holidayTo).toLocaleDateString("nb-NO") : "?";
                        dateRangeText = ` (${fromText}–${toText})`;
                    }
                    updatedChild = {
                        ...updatedChild,
                        status: "notCheckedIn",
                        lastCheckIn: undefined,
                        absenceDate: undefined,
                        absenceNote: undefined,
                        holidayFrom,
                        holidayTo,
                        note: `Registrert ferie${dateRangeText}`,
                    };
                }

                /* 3) Hvis henteinfo er fylt ut: legg til i pickupPlans og evt oppdater note (hvis i dag + present) */
                if (pickupNote && pickupNote.trim() && pickupDate) {
                    const newPlan: PickupPlan = { id: Date.now(), date: pickupDate, note: pickupNote.trim() };
                    const existingPlans = updatedChild.pickupPlans ?? [];
                    updatedChild.pickupPlans = [...existingPlans, newPlan];

                    if (option === "present" && pickupDate === todayISO) {
                        const baseNote = updatedChild.note ?? "";
                        const extra = baseNote.length > 0 ? ` – Henting: ${pickupNote.trim()}` : `Henting: ${pickupNote.trim()}`;
                        updatedChild.note = baseNote + extra;
                    }
                }

                return updatedChild;
            })
        );

        /* 4) Suksess-overlay hvis “present”, ellers tilbake til liste */
        if (option === "present") {
            setCheckInSuccess({
                childName: activeChild.name,
                department: activeChild.department,
                time: timeStr,
            });
        } else {
            backToList();
        }
    };

    /* Åpner galleri for valgt aktivitet (fra CheckInPage) */
    const handleOpenActivity = (activity: ChildActivity) => {
        if (!activeChild) return;
        setActiveActivity(activity);
        setActiveView("gallery");
    };

    /* Navigasjon: tilbake fra galleri til check-in */
    const backFromGalleryToCheckIn = () => {
        setActiveView("checkIn");
        setActiveActivity(null);
    };

    /* Lukker suksess-overlay og går tilbake til liste */
    const handleCloseSuccess = () => {
        setCheckInSuccess(null);
        backToList();
    };

    /* Åpner kalender fra check-in */
    const openCalendarFromCheckIn = () => setActiveView("calendar");

    /* Tilbake fra kalender: tilbake til check-in hvis et barn er aktivt, ellers til listen */
    const backFromCalendar = () => {
        if (activeChild) setActiveView("checkIn");
        else setActiveView("list");
    };

    /* Åpner profil-view */
    const openProfile = () => setActiveView("profile");

    /* Profil: update */
    /* Sender oppdatert foresattprofil til backend, og oppdaterer state med responsen */
    const handleUpdateParentProfile = (profile: ParentProfile) => {
        updateUserProfile(parentId, {
            fullName: profile.name,
            email: profile.email,
            phoneNumber: profile.phone || null,
        })
            .then((updated) => {
                setParentProfile({
                    name: updated.fullName ?? profile.name,
                    email: updated.email ?? "",
                    phone: updated.phoneNumber ?? "",
                });
                alert("Profil oppdatert.");
            })
            .catch((e) => {
                console.error("Feil ved oppdatering av profil", e);
                alert("Klarte ikke å lagre profil.");
            });
    };

    /* Profil: lagrer barnedetaljer (lokalt + backend) */
    const handleUpdateChildrenFromProfile = (updatedChildren: Child[]) => {
        setChildren(updatedChildren);

        /* Kjører PUT for hvert barn (Promise.all brukes for å vente på alt, men resultatet ignoreres) */
        Promise.all(
            updatedChildren.map((child) =>
                updateChildDetailsOnServer(child).catch((e) => {
                    console.error(`Feil ved lagring av barnedetaljer for barn ${child.id}`, e);
                })
            )
        ).then(() => {});
    };

    /* Passord: sender nytt passord til backend */
    const handlePasswordReset = (newPassword: string) => {
        changePassword(parentId, newPassword)
            .then(() => alert("Passordet er oppdatert."))
            .catch((e) => {
                console.error("Feil ved endring av passord", e);
                alert(e.message || "Klarte ikke å endre passord.");
            });
    };

    /* Navn som vises i UI: foretrekker profilnavn hvis det finnes */
    const displayName = parentProfile.name || parentName;

    return (
        <div className="forside-root">
            <div className="phone-frame">
                {/* Topp-header med brand og logout */}
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <div className="avatar-circle">T</div>
                        <span className="brand-text">TryggINN</span>
                    </div>
                    <button className="text-link-button" onClick={onLogout}>
                        Logg ut
                    </button>
                </header>

                {/* Main-innhold: blurres når suksess-overlay vises */}
                <main className={`dashboard-main ${checkInSuccess ? "dashboard-main--blurred" : ""}`}>
                    {/* Kalender-view */}
                    {activeView === "calendar" && <CalendarPage events={calendarEvents} onBack={backFromCalendar} />}

                    {/* Profil-view */}
                    {activeView === "profile" && (
                        <ProfilePage
                            parentProfile={parentProfile}
                            onUpdateParentProfile={handleUpdateParentProfile}
                            children={children}
                            onUpdateChildren={handleUpdateChildrenFromProfile}
                            onBack={backToList}
                            onPasswordReset={handlePasswordReset}
                        />
                    )}

                    {/* Info-view for aktivt barn */}
                    {activeChild && activeView === "info" && <ChildInfoPage child={activeChild} onBack={backToList} />}

                    {/* Check-in-view for aktivt barn */}
                    {activeChild && activeView === "checkIn" && (
                        <CheckInPage
                            child={activeChild}
                            reminderText={todayReminder ?? undefined}
                            calendarEvents={calendarEvents}
                            onBack={backToList}
                            onConfirm={handleConfirmCheckIn}
                            onOpenActivity={handleOpenActivity}
                            onOpenCalendar={openCalendarFromCheckIn}
                        />
                    )}

                    {/* Galleri-view (krever både aktivt barn og aktiv aktivitet) */}
                    {activeChild && activeActivity && activeView === "gallery" && (
                        <ActivityGalleryPage child={activeChild} activity={activeActivity} onBack={backFromGalleryToCheckIn} />
                    )}

                    {/* Liste-view (standard): viser barneliste + knapp til kalender */}
                    {!activeChild && activeView === "list" && (
                        <>
                            <section className="dashboard-greeting">
                                <div className="dashboard-greeting-row">
                                    <h1 className="dashboard-title">Hei {displayName}!</h1>
                                    <button type="button" className="profile-link-button" onClick={openProfile}>
                                        Min profil
                                    </button>
                                </div>
                            </section>

                            <section className="dashboard-section">
                                <h2 className="dashboard-section-title">Dine barn</h2>

                                {/* Tom-state hvis ingen barn */}
                                {children.length === 0 ? (
                                    <p className="dashboard-empty-text">
                                        Du har ingen registrerte barn ennå.
                                        <br />
                                        Barn registreres av barnehagen. Ta kontakt med personalet dersom et barn mangler i oversikten.
                                    </p>
                                ) : (
                                    /* Barneliste: hvert barn rendres som et “card” med status + knapper */
                                    <div className="children-list">
                                        {children.map((child) => {
                                            const isCheckedIn = child.status === "checkedIn";
                                            const firstLetter = child.name.trim().charAt(0).toUpperCase();

                                            /* Finner neste/nyeste henteplan og lager en tekstlinje (hvis finnes) */
                                            let upcomingPickupText: string | null = null;
                                            if (child.pickupPlans && child.pickupPlans.length > 0) {
                                                const todayISO2 = new Date().toISOString().slice(0, 10);
                                                const sorted = [...child.pickupPlans].sort((a, b) => a.date.localeCompare(b.date));
                                                const nextPlan = sorted.find((p) => p.date >= todayISO2) ?? sorted[sorted.length - 1];
                                                const dateText = new Date(nextPlan.date).toLocaleDateString("nb-NO");
                                                upcomingPickupText = `Henting ${dateText}: ${nextPlan.note}`;
                                            }

                                            return (
                                                <article key={child.id} className={`child-card ${isCheckedIn ? "child-card--ok" : "child-card--alert"}`}>
                                                    <div className="child-card-header">
                                                        <div className="child-header-left">
                                                            {/* Bilde hvis finnes, ellers initial */}
                                                            {child.photoUrl ? (
                                                                <img src={child.photoUrl} alt={`Bilde av ${child.name}`} className="child-avatar" />
                                                            ) : (
                                                                <div className="child-avatar child-avatar--placeholder">{firstLetter}</div>
                                                            )}
                                                            <h3 className="child-name">{child.name}</h3>
                                                        </div>

                                                        {/* Åpner infosiden */}
                                                        <button type="button" className="child-info-button" onClick={() => openChildInfo(child)}>
                                                            Info
                                                        </button>
                                                    </div>

                                                    <div className="child-card-body">
                                                        <div>
                                                            {/* Statuslinje: bruker child.note hvis satt, ellers fallback */}
                                                            <p className="child-status-text">
                                                                {child.note ?? (isCheckedIn ? `Krysset inn ${child.lastCheckIn ?? ""}` : "Ikke krysset inn ennå")}
                                                            </p>

                                                            {/* Ekstra linje for henteplan hvis den finnes */}
                                                            {upcomingPickupText && <p className="child-pickup-text">{upcomingPickupText}</p>}
                                                        </div>

                                                        {/* Primær handling: hvis sjekket inn → sjekk ut, ellers gå til check-in side */}
                                                        <button
                                                            className={`child-action-button ${isCheckedIn ? "child-action-button--danger" : "child-action-button--success"}`}
                                                            onClick={() => (isCheckedIn ? toggleCheckStatusDirect(child.id) : openChildCheckIn(child))}
                                                        >
                                                            {isCheckedIn ? "Sjekk ut" : "Sjekk inn"}
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* Knapp for å åpne full kalender */}
                            <section className="dashboard-section">
                                <button type="button" className="secondary-button full-width-secondary" onClick={openCalendarFromList}>
                                    📅 Se barnehagens kalender
                                </button>
                            </section>
                        </>
                    )}
                </main>

                {/* Overlay etter vellykket innsjekk (blurrer main bak) */}
                {checkInSuccess && (
                    <div className="checkin-success-overlay">
                        <div className="checkin-success-card">
                            <div className="checkin-success-icon">✓</div>
                            <p className="checkin-success-heading">{checkInSuccess.childName} er krysset inn</p>
                            <p className="checkin-success-text">
                                Innkryssing er registrert kl <strong>{checkInSuccess.time}</strong>
                                {checkInSuccess.department ? `, hos ${checkInSuccess.department}` : ""}.
                            </p>

                            <button type="button" className="login-button checkin-success-button" onClick={handleCloseSuccess}>
                                Tilbake til &quot;Dine barn&quot;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;