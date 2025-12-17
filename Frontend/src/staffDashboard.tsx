import { useEffect, useMemo, useState } from "react";
import "./forside.css";
import "./staffDashboard.css";

import {
    changePassword,
    getUserProfile,
    updateUserProfile,
    getGroupsForDaycare,
    getCalendarEventsForDaycare,
    createCalendarEvent,
    createChild,
    getUserByEmail,
    getLatestStatusForChild,
    registerAttendance,
    type UserProfileResponse,
    type CalendarEventResponse,
    type DaycareGroupWithChildren,
    type AttendanceEventType,
} from "./api";

type ActiveView = "list" | "calendar" | "profile";

type ChildStatus = "IN" | "OUT" | "NONE";

type StaffChildRow = {
    id: number;
    name: string;
    groupName: string;
    status: ChildStatus;
    note: string;
};

type StaffProfile = {
    name: string;
    email: string;
    phone: string;
};

type KindergartenEvent = {
    id: number;
    date: string; // startTime
    endDate?: string; // endTime
    title: string;
    description?: string;
    location?: string | null;
    scope?: string; // avdeling / hele barnehagen
};

interface StaffDashboardProps {
    staffId: number;
    staffName: string;
    daycareId: number;
    onLogout: () => void;
}

/* --------- Helpers --------- */

function mapCalendarEvents(events: CalendarEventResponse[]): KindergartenEvent[] {
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

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("nb-NO", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function fmtRange(start: string, end?: string) {
    const s = fmtTime(start);
    if (!end) return s;
    return `${s} – ${fmtTime(end)}`;
}

function toIso(dtLocal: string) {
    return dtLocal ? new Date(dtLocal).toISOString() : "";
}

/* --------- Modal (bruker eksisterende overlay/card-klasser) --------- */

function Modal({
                   title,
                   onClose,
                   children,
               }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="checkin-success-overlay" onClick={onClose}>
            <div className="checkin-success-card" onClick={(e) => e.stopPropagation()}>
                <div className="staff-department-header">
                    <div className="staff-department-name">{title}</div>
                    <button type="button" className="staff-link-button" onClick={onClose}>
                        Lukk
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* --------- Calendar Page (fullvisning) --------- */

function CalendarPage({ events, onBack }: { events: KindergartenEvent[]; onBack: () => void }) {
    const todayISO = new Date().toISOString().slice(0, 10);

    const sorted = events.slice().sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = sorted.filter((e) => e.date.slice(0, 10) >= todayISO);
    const past = sorted.filter((e) => e.date.slice(0, 10) < todayISO);

    const Row = ({ evt }: { evt: KindergartenEvent }) => (
        <li className="calendar-item calendar-item--full">
            <span className="calendar-date">{fmtDate(evt.date)}</span>
            <span className="calendar-dot" />
            <div className="calendar-item-text">
                <span className="calendar-text">{evt.title}</span>

                <span className="calendar-description">⏰ {fmtRange(evt.date, evt.endDate)}</span>
                <span className="calendar-description">🧩 Avdeling: {evt.scope ?? "Hele barnehagen"}</span>

                {evt.location && <span className="calendar-description">📍 Sted: {evt.location}</span>}
                {evt.description && <span className="calendar-description">{evt.description}</span>}
            </div>
        </li>
    );

    return (
        <section className="calendar-page">
            <h1 className="calendar-page-title">Barnehagens kalender</h1>
            <p className="calendar-page-subtitle">Oversikt over planlagte aktiviteter og merkedager.</p>

            {sorted.length === 0 && <p className="calendar-empty">Kalenderen er ikke fylt inn enda.</p>}

            {upcoming.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Kommende</h2>
                    <ul className="calendar-list">{upcoming.map((evt) => <Row key={evt.id} evt={evt} />)}</ul>
                </div>
            )}

            {past.length > 0 && (
                <div className="calendar-block">
                    <h2 className="calendar-block-title">Tidligere</h2>
                    <ul className="calendar-list">{past.map((evt) => <Row key={evt.id} evt={evt} />)}</ul>
                </div>
            )}

            <button type="button" className="secondary-button checkin-back-button" onClick={onBack}>
                Tilbake
            </button>
        </section>
    );
}

/* --------- Profile Page (info + passord) --------- */

function StaffProfilePage({
                              staffId,
                              staffProfile,
                              onUpdateStaffProfile,
                              onBack,
                          }: {
    staffId: number;
    staffProfile: StaffProfile;
    onUpdateStaffProfile: (profile: StaffProfile) => void;
    onBack: () => void;
}) {
    const [localStaff, setLocalStaff] = useState<StaffProfile>(staffProfile);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [openSections, setOpenSections] = useState<{ staff: boolean; password: boolean }>({
        staff: true,
        password: false,
    });

    useEffect(() => setLocalStaff(staffProfile), [staffProfile]);

    const toggle = (key: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onUpdateStaffProfile(localStaff);
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

        changePassword(staffId, newPassword)
            .then(() => alert("Passordet er oppdatert."))
            .catch((e) => {
                console.error("Feil ved endring av passord", e);
                alert(e.message || "Klarte ikke å endre passord.");
            })
            .finally(() => {
                setNewPassword("");
                setConfirmPassword("");
            });
    };

    return (
        <section className="profile-page">
            <h1 className="profile-title">Min profil</h1>

            <div className="profile-section">
                <button type="button" className="profile-section-header" onClick={() => toggle("staff")}>
                    <span className="profile-section-title">Ansatt</span>
                    <span className={`profile-section-arrow ${openSections.staff ? "profile-section-arrow--open" : ""}`}>▾</span>
                </button>

                {openSections.staff && (
                    <div className="profile-section-body">
                        <div className="form-field">
                            <label className="form-label">Navn</label>
                            <input
                                type="text"
                                className="text-input"
                                value={localStaff.name}
                                onChange={(e) => setLocalStaff((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Ditt navn"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">E-post</label>
                            <input
                                type="email"
                                className="text-input"
                                value={localStaff.email}
                                onChange={(e) => setLocalStaff((p) => ({ ...p, email: e.target.value }))}
                                placeholder="din.epost@eksempel.no"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Telefonnummer</label>
                            <input
                                type="tel"
                                className="text-input"
                                value={localStaff.phone}
                                onChange={(e) => setLocalStaff((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="F.eks. 900 00 000"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="profile-section">
                <button type="button" className="profile-section-header" onClick={() => toggle("password")}>
                    <span className="profile-section-title">Passord</span>
                    <span className={`profile-section-arrow ${openSections.password ? "profile-section-arrow--open" : ""}`}>▾</span>
                </button>

                {openSections.password && (
                    <div className="profile-section-body">
                        <p className="profile-section-hint">Her kan du sette nytt passord.</p>

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
                            Endre passord
                        </button>
                    </div>
                )}
            </div>

            <button type="button" className="login-button profile-save-button" onClick={handleSave}>
                Lagre endringer
            </button>

            <button type="button" className="secondary-button profile-back-button" onClick={onBack}>
                Tilbake
            </button>
        </section>
    );
}

/* --------- Main StaffDashboard --------- */

export default function StaffDashboard({ staffId, staffName, daycareId, onLogout }: StaffDashboardProps) {
    const [activeView, setActiveView] = useState<ActiveView>("list");

    const [children, setChildren] = useState<StaffChildRow[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<KindergartenEvent[]>([]);
    const [daycareGroups, setDaycareGroups] = useState<DaycareGroupWithChildren[]>([]);

    const [staffProfile, setStaffProfile] = useState<StaffProfile>({
        name: staffName,
        email: "",
        phone: "",
    });

    const [showRegisterChild, setShowRegisterChild] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);

    const [guardianEmail, setGuardianEmail] = useState("");
    const [childFirst, setChildFirst] = useState("");
    const [childLast, setChildLast] = useState("");
    const [childDob, setChildDob] = useState(""); // YYYY-MM-DD
    const [groupId, setGroupId] = useState<number | "">("");

    const [evtTitle, setEvtTitle] = useState("");
    const [evtDesc, setEvtDesc] = useState("");
    const [evtLoc, setEvtLoc] = useState("");
    const [evtStart, setEvtStart] = useState("");
    const [evtEnd, setEvtEnd] = useState("");
    const [evtGroupId, setEvtGroupId] = useState<number | "">("");

    const displayName = staffProfile.name || staffName;

    const avatarLetter = useMemo(() => {
        const s = (displayName || "A").trim();
        return (s.charAt(0) || "A").toUpperCase();
    }, [displayName]);

    const load = async () => {
        try {
            const profile: UserProfileResponse = await getUserProfile(staffId);
            setStaffProfile({
                name: profile.fullName ?? staffName,
                email: profile.email ?? "",
                phone: profile.phoneNumber ?? "",
            });
        } catch (e) {
            console.error("Feil ved henting av staff-profil", e);
        }

        try {
            const events = await getCalendarEventsForDaycare(daycareId);
            setCalendarEvents(mapCalendarEvents(events));
        } catch (e) {
            console.error("Feil ved henting av kalender", e);
            setCalendarEvents([]);
        }

        try {
            const groups: DaycareGroupWithChildren[] = await getGroupsForDaycare(daycareId);
            setDaycareGroups(groups);

            const flat = (groups ?? []).flatMap((g) =>
                (g.children ?? []).map((c) => ({
                    id: c.id,
                    name: `${c.firstName} ${c.lastName}`,
                    groupName: g.name,
                }))
            );

            const withStatus = await Promise.all(
                flat.map(async (c): Promise<StaffChildRow> => {
                    try {
                        const st = await getLatestStatusForChild(c.id);
                        const type = st.lastEventType;
                        const t = st.lastEventTime ? fmtTime(st.lastEventTime) : "";
                        if (type === "IN") return { ...c, status: "IN", note: `Inne · ${t}` };
                        if (type === "OUT") return { ...c, status: "OUT", note: `Ute · ${t}` };
                        return { ...c, status: "NONE", note: "Ingen registrering" };
                    } catch {
                        return { ...c, status: "NONE", note: "Ingen registrering" };
                    }
                })
            );

            withStatus.sort((a, b) => (a.groupName + a.name).localeCompare(b.groupName + b.name, "nb"));
            setChildren(withStatus);
        } catch (e) {
            console.error("Feil ved henting av barn for daycare", e);
            setChildren([]);
            setDaycareGroups([]);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffId, staffName, daycareId]);

    const grouped = useMemo(() => {
        const map = new Map<string, StaffChildRow[]>();
        children.forEach((c) => {
            const arr = map.get(c.groupName) ?? [];
            arr.push(c);
            map.set(c.groupName, arr);
        });
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb"));
    }, [children]);

    const toggleInOut = async (childId: number) => {
        const row = children.find((c) => c.id === childId);
        if (!row) return;

        const eventType: AttendanceEventType = row.status === "IN" ? "OUT" : "IN";

        try {
            await registerAttendance({
                childId,
                performedByUserId: staffId,
                eventType,
                note: "Registrert av ansatt",
            });
            await load();
        } catch (e: any) {
            console.error("Feil ved inn/ut", e);
            alert(e?.message || "Klarte ikke å registrere inn/ut.");
        }
    };

    const openCalendar = () => setActiveView("calendar");
    const openProfile = () => setActiveView("profile");
    const backToList = () => setActiveView("list");

    const handleUpdateStaffProfile = (profile: StaffProfile) => {
        updateUserProfile(staffId, {
            fullName: profile.name,
            email: profile.email || null,
            phoneNumber: profile.phone || null,
        })
            .then((updated) => {
                setStaffProfile({
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

    const openRegisterChild = () => {
        setGroupId("");
        setGuardianEmail("");
        setChildFirst("");
        setChildLast("");
        setChildDob("");
        setShowRegisterChild(true);
    };

    const submitCreateChild = async () => {
        if (!guardianEmail.trim()) return alert("Skriv inn foresatt sin e-post.");
        if (!childFirst.trim() || !childLast.trim()) return alert("Fyll inn fornavn og etternavn.");
        if (!childDob.trim()) return alert("Fyll inn fødselsdato (YYYY-MM-DD).");
        if (groupId === "") return alert("Velg avdeling.");

        try {
            const guardian = await getUserByEmail(guardianEmail.trim());
            if (guardian.role !== "PARENT") return alert("E-posten tilhører ikke en foresatt (PARENT).");

            await createChild({
                guardianUserId: guardian.id,
                daycareGroupId: Number(groupId),
                createdByUserId: staffId,
                firstName: childFirst.trim(),
                lastName: childLast.trim(),
                dateOfBirth: childDob.trim(),
            });

            setShowRegisterChild(false);
            await load();
        } catch (e: any) {
            alert(e?.message || "Kunne ikke registrere barn.");
        }
    };

    const submitCreateEvent = async () => {
        if (!evtTitle.trim()) return alert("Tittel mangler.");
        if (!evtStart) return alert("Starttid mangler.");

        try {
            await createCalendarEvent({
                daycareId,
                daycareGroupId: evtGroupId === "" ? null : Number(evtGroupId),
                title: evtTitle.trim(),
                description: evtDesc.trim() || null,
                location: evtLoc.trim() || null,
                startTime: toIso(evtStart),
                endTime: evtEnd ? toIso(evtEnd) : null,
                createdByUserId: staffId,
            });

            setShowCreateEvent(false);
            setEvtTitle("");
            setEvtDesc("");
            setEvtLoc("");
            setEvtStart("");
            setEvtEnd("");
            setEvtGroupId("");
            await load();
        } catch (e: any) {
            alert(e?.message || "Kunne ikke opprette event.");
        }
    };

    return (
        <div className="forside-root">
            <div className="phone-frame">
                <header className="staff-header">
                    <div className="staff-brand">
                        <div className="staff-avatar">{avatarLetter}</div>
                        <span className="staff-brand-text">TryggINN</span>
                    </div>
                    <button className="staff-link-button" onClick={onLogout}>
                        Logg ut
                    </button>
                </header>

                <main className="staff-main">
                    {activeView === "calendar" && <CalendarPage events={calendarEvents} onBack={backToList} />}

                    {activeView === "profile" && (
                        <StaffProfilePage
                            staffId={staffId}
                            staffProfile={staffProfile}
                            onUpdateStaffProfile={handleUpdateStaffProfile}
                            onBack={backToList}
                        />
                    )}

                    {activeView === "list" && (
                        <>
                            <section className="staff-greeting">
                                <div className="staff-greeting-row">
                                    <h1 className="staff-title">Hei {displayName}!</h1>

                                    <div className="staff-top-actions">
                                        <button type="button" className="staff-profile-pill" onClick={openRegisterChild}>
                                            Registrer barn
                                        </button>

                                        <button type="button" className="staff-profile-pill" onClick={openProfile}>
                                            Min profil
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="staff-section">
                                <h2 className="staff-section-title">Avdelinger</h2>

                                {grouped.length === 0 ? (
                                    <p className="staff-empty-text">Ingen barn funnet.</p>
                                ) : (
                                    <div className="staff-department-list">
                                        {grouped.map(([groupName, kids]) => (
                                            <div key={groupName} className="staff-department-card">
                                                <div className="staff-department-header">
                                                    <div className="staff-department-name">Avdeling {groupName}</div>
                                                    <div className="staff-department-count">{kids.length} barn</div>
                                                </div>

                                                <ul className="staff-presence-list">
                                                    {kids.map((k) => {
                                                        const isIn = k.status === "IN";
                                                        return (
                                                            <li key={k.id} className="staff-presence-row">
                                                                <div className="staff-presence-info">
                                                                    <span className="staff-presence-name">{k.name}</span>
                                                                    <span className="staff-presence-time">{k.note}</span>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={`staff-presence-toggle ${
                                                                        isIn ? "staff-presence-toggle--in" : "staff-presence-toggle--out"
                                                                    }`}
                                                                    onClick={() => toggleInOut(k.id)}
                                                                >
                                                                    {isIn ? "Sjekk ut" : "Sjekk inn"}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="staff-section">
                                <div className="staff-bottom-actions">
                                    <button type="button" className="secondary-button full-width-secondary" onClick={openCalendar}>
                                        📅 Se barnehagens kalender
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button full-width-secondary"
                                        onClick={() => {
                                            setEvtGroupId("");
                                            setShowCreateEvent(true);
                                        }}
                                    >
                                        ➕ Legg til kalender-event
                                    </button>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                {showRegisterChild && (
                    <Modal title="Registrer barn" onClose={() => setShowRegisterChild(false)}>
                        <div className="form-field">
                            <label className="form-label">Foresatt e-post</label>
                            <input className="text-input" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
                        </div>

                        <div className="row-gap">
                            <div className="form-field" style={{ flex: 1 }}>
                                <label className="form-label">Fornavn</label>
                                <input className="text-input" value={childFirst} onChange={(e) => setChildFirst(e.target.value)} />
                            </div>
                            <div className="form-field" style={{ flex: 1 }}>
                                <label className="form-label">Etternavn</label>
                                <input className="text-input" value={childLast} onChange={(e) => setChildLast(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Fødselsdato (YYYY-MM-DD)</label>
                            <input
                                className="text-input"
                                value={childDob}
                                onChange={(e) => setChildDob(e.target.value)}
                                placeholder="2019-03-14"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Avdeling</label>
                            <select
                                className="text-input"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Velg…</option>
                                {daycareGroups
                                    .slice()
                                    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
                                    .map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="modal-actions-row">
                            <button type="button" className="secondary-button full-width-secondary" onClick={() => setShowRegisterChild(false)}>
                                Avbryt
                            </button>
                            <button type="button" className="login-button modal-primary" onClick={submitCreateChild}>
                                Registrer
                            </button>
                        </div>
                    </Modal>
                )}

                {showCreateEvent && (
                    <Modal title="Legg til kalender-event" onClose={() => setShowCreateEvent(false)}>
                        <div className="form-field">
                            <label className="form-label">Tittel</label>
                            <input className="text-input" value={evtTitle} onChange={(e) => setEvtTitle(e.target.value)} />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Beskrivelse</label>
                            <input className="text-input" value={evtDesc} onChange={(e) => setEvtDesc(e.target.value)} />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Sted</label>
                            <input className="text-input" value={evtLoc} onChange={(e) => setEvtLoc(e.target.value)} />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Avdeling</label>
                            <select
                                className="text-input"
                                value={evtGroupId}
                                onChange={(e) => setEvtGroupId(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Hele barnehagen</option>
                                {daycareGroups
                                    .slice()
                                    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
                                    .map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Start</label>
                            <input type="datetime-local" className="text-input" value={evtStart} onChange={(e) => setEvtStart(e.target.value)} />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Slutt</label>
                            <input type="datetime-local" className="text-input" value={evtEnd} onChange={(e) => setEvtEnd(e.target.value)} />
                        </div>

                        <div className="modal-actions-row">
                            <button type="button" className="secondary-button full-width-secondary" onClick={() => setShowCreateEvent(false)}>
                                Avbryt
                            </button>
                            <button type="button" className="login-button modal-primary" onClick={submitCreateEvent}>
                                Opprett
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
}
