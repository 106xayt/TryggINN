// Frontend/src/ParentDashboard.tsx
import { useState, useEffect } from "react";
import "./forside.css";
import "./parentsDashboard.css";
import { changePassword } from "./api";

const API_BASE_URL = "http://localhost:8080";

type ChildStatus = "notCheckedIn" | "checkedIn";

export interface ChildActivity {
    id: number;
    label: string;
    photos: string[];
}

export interface PickupPlan {
    id: number;
    date: string; // ISO-dato (yyyy-mm-dd)
    note: string;
}

export interface KindergartenEvent {
    id: number;
    date: string; // ISO-dato
    title: string;
    description?: string;
}

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

interface ParentProfile {
    name: string;
    email: string;
    phone: string;
}

interface ParentDashboardProps {
    parentId: number; // 👈 kommer fra App (Login)
    parentName: string;
    onLogout: () => void;
}

/* ---- Backend-respons ----- */

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

// UserController
interface BackendUserProfile {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
}

/* ---- Infoside for ett barn ---- */

interface ChildInfoProps {
    child: Child;
    onBack: () => void;
}

const ChildInfoPage = ({ child, onBack }: ChildInfoProps) => {
    const [openSection, setOpenSection] = useState<string | null>("allergies");

    const toggleSection = (section: string) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const allergiesText =
        child.allergies?.trim() || "Ingen registrerte allergier.";
    const departmentText =
        child.department?.trim() || "Ingen avdeling registrert.";
    const otherText =
        child.otherInfo?.trim() || "Ingen ekstra informasjon registrert.";

    const firstLetter = child.name.trim().charAt(0).toUpperCase();

    return (
        <section className="child-info-page">
            <div className="child-info-header">
                {child.photoUrl ? (
                    <img
                        src={child.photoUrl}
                        alt={`Bilde av ${child.name}`}
                        className="child-info-avatar"
                    />
                ) : (
                    <div className="child-info-avatar child-info-avatar--placeholder">
                        {firstLetter}
                    </div>
                )}

                <div>
                    <h1 className="child-info-title">{child.name}</h1>
                    {child.department && (
                        <p className="child-info-subtitle">Avdeling {child.department}</p>
                    )}
                </div>
            </div>

            <div className="child-info-box">
                {/* Allergier */}
                <div className="child-info-row">
                    <button
                        type="button"
                        className="info-pill"
                        onClick={() => toggleSection("allergies")}
                    >
            <span className="info-pill-emoji" aria-hidden="true">
              🥜
            </span>
                        <span className="info-pill-label">Allergier</span>
                        <span
                            className={`info-pill-arrow ${
                                openSection === "allergies" ? "info-pill-arrow--open" : ""
                            }`}
                            aria-hidden="true"
                        >
              ▾
            </span>
                    </button>
                    {openSection === "allergies" && (
                        <p className="info-pill-text">{allergiesText}</p>
                    )}
                </div>

                {/* Avdeling */}
                <div className="child-info-row">
                    <button
                        type="button"
                        className="info-pill"
                        onClick={() => toggleSection("department")}
                    >
            <span className="info-pill-emoji" aria-hidden="true">
              🏠
            </span>
                        <span className="info-pill-label">Avdeling</span>
                        <span
                            className={`info-pill-arrow ${
                                openSection === "department" ? "info-pill-arrow--open" : ""
                            }`}
                            aria-hidden="true"
                        >
              ▾
            </span>
                    </button>
                    {openSection === "department" && (
                        <p className="info-pill-text">{departmentText}</p>
                    )}
                </div>

                {/* Annet */}
                <div className="child-info-row">
                    <button
                        type="button"
                        className="info-pill"
                        onClick={() => toggleSection("other")}
                    >
            <span className="info-pill-emoji" aria-hidden="true">
              ⭐
            </span>
                        <span className="info-pill-label">Annet</span>
                        <span
                            className={`info-pill-arrow ${
                                openSection === "other" ? "info-pill-arrow--open" : ""
                            }`}
                            aria-hidden="true"
                        >
              ▾
            </span>
                    </button>
                    {openSection === "other" && (
                        <p className="info-pill-text">{otherText}</p>
                    )}
                </div>
            </div>

            <button
                type="button"
                className="login-button child-info-back-button"
                onClick={onBack}
            >
                Tilbake til &quot;Dine barn&quot;
            </button>
        </section>
    );
};

/* ---- Check-in side for ett barn ---- */

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
    const [selectedOption, setSelectedOption] =
        useState<CheckInOption>("present");

    const todayISO = new Date().toISOString().slice(0, 10);

    const [absenceDate, setAbsenceDate] = useState<string>(todayISO);
    const [absenceNote, setAbsenceNote] = useState<string>("");

    const [holidayFrom, setHolidayFrom] = useState<string>("");
    const [holidayTo, setHolidayTo] = useState<string>("");

    const [pickupDate, setPickupDate] = useState<string>(todayISO);
    const [pickupNote, setPickupNote] = useState<string>("");

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

    const defaultActivities: ChildActivity[] = [
        { id: 1, label: "🖼️ Bilde fra i går", photos: [] },
        { id: 2, label: "🌲 Tur i skogen", photos: [] },
        { id: 3, label: "🎉 Bursdagsfeiring", photos: [] },
    ];

    const activitiesToShow: ChildActivity[] =
        child.activities && child.activities.length > 0
            ? child.activities
            : defaultActivities;

    const upcomingEvents: KindergartenEvent[] = (calendarEvents ?? [])
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((evt) => evt.date >= todayISO)
        .slice(0, 3);

    return (
        <section className="checkin-page">
            <h1 className="checkin-title">Kryss inn {child.name}</h1>
            <p className="checkin-subtitle">
                Trykk på knappen for å krysse inn {child.name}.
            </p>

            <div className="checkin-card">
                <div className="checkin-card-header">
                    <div>
                        <h2 className="checkin-child-name">{child.name}</h2>
                        <p className="checkin-child-subtitle">
                            Trykk for å krysse inn →{" "}
                            {child.department ? ` Avdeling ${child.department}` : ""}
                        </p>
                    </div>
                    <span className="checkin-status-badge">Borte</span>
                </div>

                <div className="checkin-card-body">
                    <button
                        type="button"
                        className="checkin-radio-row"
                        onClick={() =>
                            setSelectedOption((prev) =>
                                prev === "absent" ? "present" : "absent"
                            )
                        }
                    >
            <span
                className={`radio-circle ${
                    selectedOption === "absent" ? "radio-circle--selected" : ""
                }`}
            />
                        <span className="checkin-radio-label">🚫 Registrer fravær</span>
                    </button>

                    {selectedOption === "absent" && (
                        <div className="checkin-extra-fields">
                            <div className="checkin-field">
                                <label className="checkin-field-label">Dato</label>
                                <input
                                    type="date"
                                    className="checkin-field-input"
                                    value={absenceDate}
                                    onChange={(e) => setAbsenceDate(e.target.value)}
                                />
                            </div>
                            <div className="checkin-field">
                                <label className="checkin-field-label">
                                    Notat (f.eks. sykdom)
                                </label>
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

                    <button
                        type="button"
                        className="checkin-radio-row"
                        onClick={() =>
                            setSelectedOption((prev) =>
                                prev === "holiday" ? "present" : "holiday"
                            )
                        }
                    >
            <span
                className={`radio-circle ${
                    selectedOption === "holiday" ? "radio-circle--selected" : ""
                }`}
            />
                        <span className="checkin-radio-label">🏝️ Legg inn ferie</span>
                    </button>

                    {selectedOption === "holiday" && (
                        <div className="checkin-extra-fields">
                            <div className="checkin-field-row">
                                <div className="checkin-field">
                                    <label className="checkin-field-label">Fra</label>
                                    <input
                                        type="date"
                                        className="checkin-field-input"
                                        value={holidayFrom}
                                        onChange={(e) => setHolidayFrom(e.target.value)}
                                    />
                                </div>
                                <div className="checkin-field">
                                    <label className="checkin-field-label">Til</label>
                                    <input
                                        type="date"
                                        className="checkin-field-input"
                                        value={holidayTo}
                                        onChange={(e) => setHolidayTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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


            <div className="pickup-section">
                <p className="pickup-title">Hvem henter i barnehagen?</p>
                <div className="checkin-extra-fields">
                    <div className="checkin-field">
                        <label className="checkin-field-label">Dato for henting</label>
                        <input
                            type="date"
                            className="checkin-field-input"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                        />
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


            <div className="checkin-activities">
                <p className="checkin-activities-title">
                    Se hva {child.name} har gjort
                </p>
                <div className="checkin-activities-chips">
                    {activitiesToShow.map((activity) => (
                        <button
                            key={activity.id}
                            type="button"
                            className="activity-chip"
                            onClick={() => onOpenActivity(activity)}
                        >
                            {activity.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="activity-chip calendar-chip"
                        onClick={onOpenCalendar}
                    >
                        📅 Barnehagens kalender
                    </button>
                </div>
            </div>


            {upcomingEvents.length > 0 && (
                <div className="calendar-section">
                    <p className="calendar-title">Kommende i barnehagen</p>
                    <ul className="calendar-list">
                        {upcomingEvents.map((evt) => (
                            <li key={evt.id} className="calendar-item">
                <span className="calendar-date">
                  {new Date(evt.date).toLocaleDateString("nb-NO")}
                </span>
                                <span className="calendar-dot" />
                                <span className="calendar-text">{evt.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                type="button"
                className="login-button checkin-primary-button"
                onClick={handleConfirm}
            >
                Kryss inn {child.name} nå
            </button>

            <button
                type="button"
                className="secondary-button checkin-back-button"
                onClick={onBack}
            >
                Tilbake
            </button>
        </section>
    );
};



interface ActivityGalleryProps {
    child: Child;
    activity: ChildActivity;
    onBack: () => void;
}

const ActivityGalleryPage = ({
                                 child,
                                 activity,
                                 onBack,
                             }: ActivityGalleryProps) => {
    return (
        <section className="gallery-page">
            <h1 className="gallery-title">{activity.label}</h1>
            <p className="gallery-subtitle">
                Bilder lagt inn av ansatte for {child.name}.
            </p>

            {activity.photos && activity.photos.length > 0 ? (
                <div className="gallery-images">
                    {activity.photos.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`${activity.label} – bilde ${idx + 1}`}
                            className="gallery-image"
                        />
                    ))}
                </div>
            ) : (
                <p className="gallery-empty">
                    Ingen bilder er lagt inn enda. Dette fylles fra ansatt-siden.
                </p>
            )}

            <button
                type="button"
                className="secondary-button checkin-back-button"
                onClick={onBack}
            >
                Tilbake
            </button>
        </section>
    );
};



interface CalendarPageProps {
    events: KindergartenEvent[];
    onBack: () => void;
}

const CalendarPage = ({ events, onBack }: CalendarPageProps) => {
    const todayISO = new Date().toISOString().slice(0, 10);

    const sortedEvents = events.slice().sort((a, b) => a.date.localeCompare(b.date));

    const upcoming = sortedEvents.filter((e) => e.date >= todayISO);
    const past = sortedEvents.filter((e) => e.date < todayISO);

    return (
        <section className="calendar-page">
            <h1 className="calendar-page-title">Barnehagens kalender</h1>
            <p className="calendar-page-subtitle">
                Oversikt over planlagte aktiviteter og merkedager.
            </p>

            {sortedEvents.length === 0 && (
                <p className="calendar-empty">
                    Kalenderen er ikke fylt inn enda. Dette kommer fra barnehagens
                    system.
                </p>
            )}

            {upcoming.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Kommende</h2>
                    <ul className="calendar-list">
                        {upcoming.map((evt) => (
                            <li key={evt.id} className="calendar-item calendar-item--full">
                <span className="calendar-date">
                  {new Date(evt.date).toLocaleDateString("nb-NO")}
                </span>
                                <span className="calendar-dot" />
                                <div className="calendar-item-text">
                                    <span className="calendar-text">{evt.title}</span>
                                    {evt.description && (
                                        <span className="calendar-description">
                      {evt.description}
                    </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {past.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Tidligere</h2>
                    <ul className="calendar-list">
                        {past.map((evt) => (
                            <li key={evt.id} className="calendar-item calendar-item--full">
                <span className="calendar-date">
                  {new Date(evt.date).toLocaleDateString("nb-NO")}
                </span>
                                <span className="calendar-dot" />
                                <div className="calendar-item-text">
                                    <span className="calendar-text">{evt.title}</span>
                                    {evt.description && (
                                        <span className="calendar-description">
                      {evt.description}
                    </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                type="button"
                className="secondary-button checkin-back-button"
                onClick={onBack}
            >
                Tilbake
            </button>
        </section>
    );
};



interface ProfilePageProps {
    parentProfile: ParentProfile;
    onUpdateParentProfile: (profile: ParentProfile) => void;
    children: Child[];
    onUpdateChildren: (children: Child[]) => void;
    onBack: () => void;
    onPasswordReset: (newPassword: string) => void;
}

const ProfilePage = ({
                         parentProfile,
                         onUpdateParentProfile,
                         children,
                         onUpdateChildren,
                         onBack,
                         onPasswordReset,
                     }: ProfilePageProps) => {
    const [localParent, setLocalParent] =
        useState<ParentProfile>(parentProfile);
    const [localChildren, setLocalChildren] = useState<Child[]>(children);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [openSections, setOpenSections] = useState<{
        parent: boolean;
        password: boolean;
        children: boolean;
    }>({
        parent: true,
        password: false,
        children: false,
    });

    useEffect(() => {
        setLocalParent(parentProfile);
    }, [parentProfile]);

    useEffect(() => {
        setLocalChildren(children);
    }, [children]);

    const toggleSection = (key: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChildChange = (
        index: number,
        field: keyof Child,
        value: string
    ) => {
        setLocalChildren((prev) => {
            const copy = [...prev];
            const child = { ...copy[index] };
            if (field === "name") {
                child.name = value;
            } else if (field === "allergies") {
                child.allergies = value || undefined;
            } else if (field === "department") {
                child.department = value || undefined;
            } else if (field === "otherInfo") {
                child.otherInfo = value || undefined;
            } else if (field === "photoUrl") {
                child.photoUrl = value || undefined;
            }
            copy[index] = child;
            return copy;
        });
    };

    const handleSaveProfile = () => {
        onUpdateParentProfile(localParent);
        onUpdateChildren(localChildren);
    };

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


            <div className="profile-section">
                <button
                    type="button"
                    className="profile-section-header"
                    onClick={() => toggleSection("parent")}
                >
                    <span className="profile-section-title">Foresatt</span>
                    <span
                        className={`profile-section-arrow ${
                            openSections.parent ? "profile-section-arrow--open" : ""
                        }`}
                    >
            ▾
          </span>
                </button>

                {openSections.parent && (
                    <div className="profile-section-body">
                        <div className="form-field">
                            <label className="form-label">Navn</label>
                            <input
                                type="text"
                                className="text-input"
                                value={localParent.name}
                                onChange={(e) =>
                                    setLocalParent((p) => ({ ...p, name: e.target.value }))
                                }
                                placeholder="Ditt navn"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">E-post</label>
                            <input
                                type="email"
                                className="text-input"
                                value={localParent.email}
                                onChange={(e) =>
                                    setLocalParent((p) => ({ ...p, email: e.target.value }))
                                }
                                placeholder="din.epost@eksempel.no"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Telefonnummer</label>
                            <input
                                type="tel"
                                className="text-input"
                                value={localParent.phone}
                                onChange={(e) =>
                                    setLocalParent((p) => ({ ...p, phone: e.target.value }))
                                }
                                placeholder="F.eks. 900 00 000"
                            />
                        </div>
                    </div>
                )}
            </div>


            <div className="profile-section">
                <button
                    type="button"
                    className="profile-section-header"
                    onClick={() => toggleSection("password")}
                >
                    <span className="profile-section-title">Passord</span>
                    <span
                        className={`profile-section-arrow ${
                            openSections.password ? "profile-section-arrow--open" : ""
                        }`}
                    >
            ▾
          </span>
                </button>

                {openSections.password && (
                    <div className="profile-section-body">
                        <p className="profile-section-hint">
                            Her kan du be om å sette nytt passord.
                        </p>

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

                        <button
                            type="button"
                            className="secondary-button full-width-secondary profile-password-button"
                            onClick={handlePasswordSubmit}
                        >
                            Reset passord
                        </button>
                    </div>
                )}
            </div>


            <div className="profile-section">
                <button
                    type="button"
                    className="profile-section-header"
                    onClick={() => toggleSection("children")}
                >
          <span className="profile-section-title">
            Barn ({localChildren.length})
          </span>
                    <span
                        className={`profile-section-arrow ${
                            openSections.children ? "profile-section-arrow--open" : ""
                        }`}
                    >
            ▾
          </span>
                </button>

                {openSections.children && (
                    <div className="profile-section-body">
                        {localChildren.length === 0 ? (
                            <p className="profile-section-hint">
                                Du har ingen registrerte barn enda. Legg til barn fra
                                hovedsiden.
                            </p>
                        ) : (
                            <div className="profile-children-list">
                                {localChildren.map((child, index) => (
                                    <div key={child.id} className="profile-child-card">
                                        <p className="profile-child-title">{child.name}</p>

                                        <div className="form-field">
                                            <label className="form-label">Navn</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.name}
                                                onChange={(e) =>
                                                    handleChildChange(index, "name", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Lenke til bilde</label>
                                            <input
                                                type="url"
                                                className="text-input"
                                                value={child.photoUrl ?? ""}
                                                onChange={(e) =>
                                                    handleChildChange(index, "photoUrl", e.target.value)
                                                }
                                                placeholder="https://…"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Allergier</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.allergies ?? ""}
                                                onChange={(e) =>
                                                    handleChildChange(
                                                        index,
                                                        "allergies",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="F.eks. nøtter, melk, pollen"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Avdeling</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.department ?? ""}
                                                onChange={(e) =>
                                                    handleChildChange(
                                                        index,
                                                        "department",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="F.eks. Rød, Blå, Løvene"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label className="form-label">Annet</label>
                                            <input
                                                type="text"
                                                className="text-input"
                                                value={child.otherInfo ?? ""}
                                                onChange={(e) =>
                                                    handleChildChange(
                                                        index,
                                                        "otherInfo",
                                                        e.target.value
                                                    )
                                                }
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

            <button
                type="button"
                className="login-button profile-save-button"
                onClick={handleSaveProfile}
            >
                Lagre endringer
            </button>

            <button
                type="button"
                className="secondary-button profile-back-button"
                onClick={onBack}
            >
                Tilbake til &quot;Dine barn&quot;
            </button>
        </section>
    );
};



type ActiveView =
    | "list"
    | "info"
    | "checkIn"
    | "gallery"
    | "calendar"
    | "profile";

interface CheckInSuccessData {
    childName: string;
    department?: string;
    time: string;
}



async function fetchChildrenForGuardian(
    guardianId: number
): Promise<BackendChild[]> {
    const res = await fetch(
        `${API_BASE_URL}/api/children/guardian/${guardianId}`
    );
    if (!res.ok) {
        throw new Error(`Feil ved henting av barn: ${res.status}`);
    }
    return res.json();
}

async function postVacationRange(params: {
    childId: number;
    userId: number;
    from: string;
    to: string;
    note?: string;
}) {
    const res: Response = await fetch(`${API_BASE_URL}/api/vacation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            childId: params.childId,
            reportedByUserId: params.userId,
            startDate: params.from,
            endDate: params.to,
            note: params.note ?? "",
        }),
    });

    if (!res.ok) {
        throw new Error(`Feil ved registrering av ferie: ${res.status}`);
    }
}


async function fetchLatestAttendanceForChild(
    childId: number
): Promise<BackendAttendance | null> {
    const res = await fetch(
        `${API_BASE_URL}/api/attendance/child/${childId}/latest`
    );
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error(`Feil ved henting av attendance: ${res.status}`);
    }
    return res.json();
}

async function postAttendanceEvent(params: {
    childId: number;
    userId: number;
    eventType: "IN" | "OUT";
    note?: string;
}) {
    const payload = {
        childId: params.childId,
        performedByUserId: params.userId,
        eventType: params.eventType,
        note: params.note,
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Feil ved registrering av attendance: ${res.status}`);
    }
}


async function postAbsence(params: {
    childId: number;
    userId: number;
    date: string;
    reason: string;
    note?: string;
}) {
    const payload = {
        childId: params.childId,
        reportedByUserId: params.userId,
        date: params.date,
        reason: params.reason,
        note: params.note ?? params.reason,
    };

    const res = await fetch(`${API_BASE_URL}/api/absence`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Feil ved registrering av fravær: ${res.status}`);
    }
}

async function fetchChildDetails(
    childId: number
): Promise<BackendChildDetails> {
    const res = await fetch(
        `${API_BASE_URL}/api/children/${childId}/details`
    );
    if (!res.ok) {
        throw new Error(`Feil ved henting av barnedetaljer: ${res.status}`);
    }
    return res.json();
}

async function updateChildDetailsOnServer(child: Child): Promise<void> {
    const payload = {
        allergies: child.allergies ?? "",
        medications: "",
        favoriteFood: child.otherInfo ?? "",
    };

    const res = await fetch(
        `${API_BASE_URL}/api/children/${child.id}/details`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        throw new Error(`Feil ved oppdatering av barnedetaljer: ${res.status}`);
    }
}


async function fetchUserProfile(
    userId: number
): Promise<BackendUserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    if (!res.ok) {
        throw new Error(`Feil ved henting av brukerprofil: ${res.status}`);
    }
    return res.json();
}

async function updateUserProfileOnServer(
    userId: number,
    profile: ParentProfile
): Promise<BackendUserProfile> {
    const payload = {
        fullName: profile.name,
        email: profile.email,
        phoneNumber: profile.phone,
    };

    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Feil ved oppdatering av brukerprofil: ${res.status}`);
    }

    return res.json();
}

const ParentDashboard = ({
                             parentId,
                             parentName,
                             onLogout,
                         }: ParentDashboardProps) => {
    const [children, setChildren] = useState<Child[]>([]);

    const [activeChild, setActiveChild] = useState<Child | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>("list");
    const [activeActivity, setActiveActivity] = useState<ChildActivity | null>(
        null
    );

    const [calendarEvents, setCalendarEvents] = useState<KindergartenEvent[]>(
        []
    );
    const [todayReminder, setTodayReminder] = useState<string | null>(null);

    const [checkInSuccess, setCheckInSuccess] =
        useState<CheckInSuccessData | null>(null);

    const [parentProfile, setParentProfile] = useState<ParentProfile>({
        name: parentName,
        email: "",
        phone: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const backendChildren = await fetchChildrenForGuardian(parentId);

                const mappedChildren: Child[] = backendChildren.map((bc) => ({
                    id: bc.id,
                    name: `${bc.firstName} ${bc.lastName}`,
                    status: "notCheckedIn",
                    note: "Ikke krysset inn ennå",
                    department: bc.daycareGroupName,
                }));

                const withStatus: Child[] = await Promise.all(
                    mappedChildren.map(async (child) => {
                        try {
                            const att = await fetchLatestAttendanceForChild(child.id);
                            if (!att) {
                                return child;
                            }
                            const timeStr = new Date(att.eventTime).toLocaleTimeString(
                                "nb-NO",
                                { hour: "2-digit", minute: "2-digit" }
                            );
                            if (att.eventType === "IN") {
                                return {
                                    ...child,
                                    status: "checkedIn",
                                    lastCheckIn: timeStr,
                                    note: `Krysset inn ${timeStr}`,
                                };
                            } else {
                                return {
                                    ...child,
                                    status: "notCheckedIn",
                                    lastCheckIn: undefined,
                                    note: `Sist registrert: ute ${timeStr}`,
                                };
                            }
                        } catch (e) {
                            console.error("Klarte ikke hente attendance for barn", e);
                            return child;
                        }
                    })
                );

                // 2) Hent barnedetaljer (allergier / annet)
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

                setChildren(withDetails);

                // Kalender / påminnelser (dummy for nå)
                setCalendarEvents([]);
                setTodayReminder(null);
            } catch (e) {
                console.error("Feil ved henting av barnsdata", e);
            }

            // 3) Last foreldreprofil
            try {
                const profile = await fetchUserProfile(parentId);
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

    const toggleCheckStatusDirect = async (id: number) => {
        const child = children.find((c) => c.id === id);
        if (!child) return;

        const isCheckedIn = child.status === "checkedIn";
        const eventType: "IN" | "OUT" = isCheckedIn ? "OUT" : "IN";
        const now = new Date();
        const timeStr = now.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });

        try {
            await postAttendanceEvent({
                childId: id,
                userId: parentId,
                eventType,
                note: isCheckedIn
                    ? "Forelder sjekket ut via app"
                    : "Forelder sjekket inn via app",
            });

            setChildren((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? {
                            ...c,
                            status: isCheckedIn ? "notCheckedIn" : "checkedIn",
                            lastCheckIn: isCheckedIn ? undefined : timeStr,
                            note: isCheckedIn
                                ? "Ikke krysset inn ennå"
                                : `Krysset inn ${timeStr}`,
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

    const openChildInfo = (child: Child) => {
        setActiveChild(child);
        setActiveView("info");
    };

    const openChildCheckIn = (child: Child) => {
        setActiveChild(child);
        setActiveView("checkIn");
    };

    const openCalendarFromList = () => {
        setActiveChild(null);
        setActiveView("calendar");
    };

    const backToList = () => {
        setActiveChild(null);
        setActiveActivity(null);
        setActiveView("list");
    };

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

        const {
            option,
            absenceDate,
            absenceNote,
            holidayFrom,
            holidayTo,
            pickupDate,
            pickupNote,
        } = data;

        const now = new Date();
        const timeStr = now.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const todayISO = new Date().toISOString().slice(0, 10);

        // --- kall backend ---
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
                const noteText =
                    absenceNote?.trim() || "Fravær registrert via app";

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

        // --- oppdater lokal state ---
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
                    const formattedDate = absenceDate
                        ? new Date(absenceDate).toLocaleDateString("nb-NO")
                        : "i dag";
                    const noteText = absenceNote?.trim()
                        ? ` – ${absenceNote.trim()}`
                        : "";
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
                        const fromText = holidayFrom
                            ? new Date(holidayFrom).toLocaleDateString("nb-NO")
                            : "?";
                        const toText = holidayTo
                            ? new Date(holidayTo).toLocaleDateString("nb-NO")
                            : "?";
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

                // Henteplan
                if (pickupNote && pickupNote.trim() && pickupDate) {
                    const newPlan: PickupPlan = {
                        id: Date.now(),
                        date: pickupDate,
                        note: pickupNote.trim(),
                    };
                    const existingPlans = updatedChild.pickupPlans ?? [];
                    updatedChild.pickupPlans = [...existingPlans, newPlan];

                    if (option === "present" && pickupDate === todayISO) {
                        const baseNote = updatedChild.note ?? "";
                        const extra =
                            baseNote.length > 0
                                ? ` – Henting: ${pickupNote.trim()}`
                                : `Henting: ${pickupNote.trim()}`;
                        updatedChild.note = baseNote + extra;
                    }
                }

                return updatedChild;
            })
        );

        if (option === "present") {
            setCheckInSuccess({
                childName: activeChild.name,
                department: activeChild.department,
                time: timeStr,
            });
        } else {
            backToList();
        }



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
                    const formattedDate = absenceDate
                        ? new Date(absenceDate).toLocaleDateString("nb-NO")
                        : "i dag";
                    const noteText = absenceNote?.trim()
                        ? ` – ${absenceNote.trim()}`
                        : "";
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
                        const fromText = holidayFrom
                            ? new Date(holidayFrom).toLocaleDateString("nb-NO")
                            : "?";
                        const toText = holidayTo
                            ? new Date(holidayTo).toLocaleDateString("nb-NO")
                            : "?";
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

                if (pickupNote && pickupNote.trim() && pickupDate) {
                    const newPlan: PickupPlan = {
                        id: Date.now(),
                        date: pickupDate,
                        note: pickupNote.trim(),
                    };
                    const existingPlans = updatedChild.pickupPlans ?? [];
                    updatedChild.pickupPlans = [...existingPlans, newPlan];

                    if (option === "present" && pickupDate === todayISO) {
                        const baseNote = updatedChild.note ?? "";
                        const extra =
                            baseNote.length > 0
                                ? ` – Henting: ${pickupNote.trim()}`
                                : `Henting: ${pickupNote.trim()}`;
                        updatedChild.note = baseNote + extra;
                    }
                }

                return updatedChild;
            })
        );

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

    const handleOpenActivity = (activity: ChildActivity) => {
        if (!activeChild) return;
        setActiveActivity(activity);
        setActiveView("gallery");
    };

    const backFromGalleryToCheckIn = () => {
        setActiveView("checkIn");
        setActiveActivity(null);
    };

    const handleCloseSuccess = () => {
        setCheckInSuccess(null);
        backToList();
    };

    const openCalendarFromCheckIn = () => {
        setActiveView("calendar");
    };

    const backFromCalendar = () => {
        if (activeChild) {
            setActiveView("checkIn");
        } else {
            setActiveView("list");
        }
    };

    const openProfile = () => {
        setActiveView("profile");
    };

    const handleUpdateParentProfile = (profile: ParentProfile) => {
        updateUserProfileOnServer(parentId, profile)
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

    const handleUpdateChildrenFromProfile = (updatedChildren: Child[]) => {
        setChildren(updatedChildren);

        Promise.all(
            updatedChildren.map((child) =>
                updateChildDetailsOnServer(child).catch((e) => {
                    console.error(
                        `Feil ved lagring av barnedetaljer for barn ${child.id}`,
                        e
                    );
                })
            )
        ).then(() => {

        });
    };

    const handlePasswordReset = (newPassword: string) => {
        changePassword(parentId, newPassword)
            .then(() => {
                alert("Passordet er oppdatert.");
            })
            .catch((e) => {
                console.error("Feil ved endring av passord", e);
                alert(e.message || "Klarte ikke å endre passord.");
            });
    };


    const displayName = parentProfile.name || parentName;

    return (
        <div className="forside-root">
            <div className="phone-frame">
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <div className="avatar-circle">T</div>
                        <span className="brand-text">TryggINN</span>
                    </div>
                    <button className="text-link-button" onClick={onLogout}>
                        Logg ut
                    </button>
                </header>

                <main
                    className={`dashboard-main ${
                        checkInSuccess ? "dashboard-main--blurred" : ""
                    }`}
                >
                    {activeView === "calendar" && (
                        <CalendarPage events={calendarEvents} onBack={backFromCalendar} />
                    )}

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

                    {activeChild && activeView === "info" && (
                        <ChildInfoPage child={activeChild} onBack={backToList} />
                    )}

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

                    {activeChild && activeActivity && activeView === "gallery" && (
                        <ActivityGalleryPage
                            child={activeChild}
                            activity={activeActivity}
                            onBack={backFromGalleryToCheckIn}
                        />
                    )}

                    {!activeChild && activeView === "list" && (
                        <>
                            <section className="dashboard-greeting">
                                <div className="dashboard-greeting-row">
                                    <h1 className="dashboard-title">Hei {displayName}!</h1>
                                    <button
                                        type="button"
                                        className="profile-link-button"
                                        onClick={openProfile}
                                    >
                                        Min profil
                                    </button>
                                </div>
                            </section>

                            <section className="dashboard-section">
                                <h2 className="dashboard-section-title">Dine barn</h2>

                                {children.length === 0 ? (
                                    <p className="dashboard-empty-text">
                                        Du har ingen registrerte barn ennå.
                                        <br />
                                        Barn registreres av barnehagen. Ta kontakt med personalet
                                        dersom et barn mangler i oversikten.
                                    </p>
                                ) : (
                                    <div className="children-list">
                                        {children.map((child) => {
                                            const isCheckedIn = child.status === "checkedIn";
                                            const firstLetter =
                                                child.name.trim().charAt(0).toUpperCase();

                                            let upcomingPickupText: string | null = null;
                                            if (child.pickupPlans && child.pickupPlans.length > 0) {
                                                const todayISO = new Date()
                                                    .toISOString()
                                                    .slice(0, 10);
                                                const sorted = [...child.pickupPlans].sort((a, b) =>
                                                    a.date.localeCompare(b.date)
                                                );
                                                const nextPlan =
                                                    sorted.find((p) => p.date >= todayISO) ??
                                                    sorted[sorted.length - 1];
                                                const dateText = new Date(
                                                    nextPlan.date
                                                ).toLocaleDateString("nb-NO");
                                                upcomingPickupText = `Henting ${dateText}: ${nextPlan.note}`;
                                            }

                                            return (
                                                <article
                                                    key={child.id}
                                                    className={`child-card ${
                                                        isCheckedIn
                                                            ? "child-card--ok"
                                                            : "child-card--alert"
                                                    }`}
                                                >
                                                    <div className="child-card-header">
                                                        <div className="child-header-left">
                                                            {child.photoUrl ? (
                                                                <img
                                                                    src={child.photoUrl}
                                                                    alt={`Bilde av ${child.name}`}
                                                                    className="child-avatar"
                                                                />
                                                            ) : (
                                                                <div className="child-avatar child-avatar--placeholder">
                                                                    {firstLetter}
                                                                </div>
                                                            )}
                                                            <h3 className="child-name">{child.name}</h3>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="child-info-button"
                                                            onClick={() => openChildInfo(child)}
                                                        >
                                                            Info
                                                        </button>
                                                    </div>

                                                    <div className="child-card-body">
                                                        <div>
                                                            <p className="child-status-text">
                                                                {child.note ??
                                                                    (isCheckedIn
                                                                        ? `Krysset inn ${
                                                                            child.lastCheckIn ?? ""
                                                                        }`
                                                                        : "Ikke krysset inn ennå")}
                                                            </p>
                                                            {upcomingPickupText && (
                                                                <p className="child-pickup-text">
                                                                    {upcomingPickupText}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            className={`child-action-button ${
                                                                isCheckedIn
                                                                    ? "child-action-button--danger"
                                                                    : "child-action-button--success"
                                                            }`}
                                                            onClick={() =>
                                                                isCheckedIn
                                                                    ? toggleCheckStatusDirect(child.id)
                                                                    : openChildCheckIn(child)
                                                            }
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

                            <section className="dashboard-section">
                                <button
                                    type="button"
                                    className="secondary-button full-width-secondary"
                                    onClick={openCalendarFromList}
                                >
                                    📅 Se barnehagens kalender
                                </button>
                            </section>
                        </>
                    )}
                </main>

                {checkInSuccess && (
                    <div className="checkin-success-overlay">
                        <div className="checkin-success-card">
                            <div className="checkin-success-icon">✓</div>
                            <p className="checkin-success-heading">
                                {checkInSuccess.childName} er krysset inn
                            </p>
                            <p className="checkin-success-text">
                                Innkryssing er registrert kl{" "}
                                <strong>{checkInSuccess.time}</strong>
                                {checkInSuccess.department
                                    ? `, hos ${checkInSuccess.department}`
                                    : ""}
                                .
                            </p>

                            <button
                                type="button"
                                className="login-button checkin-success-button"
                                onClick={handleCloseSuccess}
                            >
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
