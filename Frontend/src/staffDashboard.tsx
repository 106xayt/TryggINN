import { useEffect, useState } from "react";
import "./forside.css";
import "./staffDashboard.css";
import StaffCheckInFlow from "./staffCheckInFlow";
import {
    getGroupsForDaycare,
    getLatestStatusForChild,
    registerAttendance,
} from "./api";

type PresenceStatus = "in" | "out";

interface PresenceChild {
    id: number;
    name: string;
    departmentId: number;
    departmentName: string;
    status: PresenceStatus;
    lastChange?: string;
}

interface Department {
    id: number;
    name: string;
}

interface CheckLogItem {
    id: number;
    childName: string;
    departmentName: string;
    action: PresenceStatus;
    time: string;
    reason?: string;
    note?: string;
}

interface StaffDashboardProps {
    staffName: string;
    onLogout: () => void;
    /** TODO: senere kan vi sende ekte staffId hit fra login */
    staffId?: number;
}

const DAYCARE_ID = 1; // TODO: hent fra backend / innlogget bruker etter hvert

// Midlertidige barn (matcher det vi har i databasen)
const demoChildren: PresenceChild[] = [
    {
        id: 1,
        name: "Oliver Nordmann",
        departmentId: 1,
        departmentName: "Lillebjørn",
        status: "out",
    },
    {
        id: 2,
        name: "Emma Nordmann",
        departmentId: 2,
        departmentName: "Månebarna",
        status: "in",
        lastChange: "07:45",
    },
];

const StaffDashboard = ({ staffName, onLogout, staffId }: StaffDashboardProps) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [children, setChildren] = useState<PresenceChild[]>([]);
    const [checkLog, setCheckLog] = useState<CheckLogItem[]>([]);

    const [pendingChild, setPendingChild] = useState<PresenceChild | null>(null);
    const [pendingAction, setPendingAction] = useState<PresenceStatus>("in");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const nowTime = () =>
        new Date().toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const userId = staffId ?? 1; // midlertidig – bruker "1" hvis vi ikke har ekte staffId

    // 🔹 Last avdelinger fra backend
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const groups = await getGroupsForDaycare(DAYCARE_ID);
                console.log("Daycare groups fra backend:", groups);

                // Avdelinger
                setDepartments(
                    groups.map((g) => ({
                        id: g.id,
                        name: g.name,
                    }))
                );

                // Foreløpig: bruk demo-barn så vi kan teste inn/ut mot backend
                setChildren(demoChildren);
            } catch (e: any) {
                console.error("Feil ved lasting av avdelinger/barn", e);
                setError(e?.message ?? "Kunne ikke laste avdelinger og barn.");
            } finally {
                setLoading(false);
            }
        }

        void loadData();
    }, []);

    const openCheckInFlow = (child: PresenceChild) => {
        const nextStatus: PresenceStatus = child.status === "in" ? "out" : "in";
        setPendingChild(child);
        setPendingAction(nextStatus);
    };

    const applyPresenceChange = async (
        child: PresenceChild,
        newStatus: PresenceStatus,
        reason?: string,
        note?: string
    ) => {
        let time = nowTime();

        // 🔹 Send til backend
        try {
            await registerAttendance({
                childId: child.id,
                userId: userId, // 👈 matcher backend
                eventType: newStatus === "in" ? "IN" : "OUT",
                note,
            });

            // Valgfritt: hent siste status for fresh timestamp
            try {
                const latest = await getLatestStatusForChild(child.id);
                if (latest.lastEventTime) {
                    const d = new Date(latest.lastEventTime);
                    time = d.toLocaleTimeString("nb-NO", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                }
            } catch (err) {
                console.warn("Klarte ikke hente siste status etter inn/ut:", err);
            }
        } catch (e) {
            console.error("Feil ved registrering av inn/ut", e);
            // her kan vi evt. vise feilmelding senere
        }

        // 🔹 Oppdater lokalt state (UI)
        setChildren((prev) =>
            prev.map((c) =>
                c.id === child.id
                    ? {
                        ...c,
                        status: newStatus,
                        lastChange: time,
                    }
                    : c
            )
        );

        setCheckLog((prev) => [
            {
                id: Date.now(),
                childName: child.name,
                departmentName: child.departmentName,
                action: newStatus,
                time,
                reason,
                note,
            },
            ...prev,
        ]);
    };

    const getChildrenForDepartment = (depId: number) =>
        children.filter((c) => c.departmentId === depId);

    if (loading) {
        return (
            <div className="forside-root">
                <div className="phone-frame">
                    <main className="staff-main">
                        <p>Laster avdelinger og barn...</p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="forside-root">
                <div className="phone-frame">
                    <header className="staff-header">
                        <div className="staff-brand">
                            <div className="staff-avatar">T</div>
                            <span className="staff-brand-text">TryggINN</span>
                        </div>
                        <button className="staff-link-button" onClick={onLogout}>
                            Logg ut
                        </button>
                    </header>

                    <main className="staff-main">
                        <section className="staff-greeting">
                            <h1 className="staff-title">Hei {staffName}!</h1>
                            <p className="staff-intro">
                                Her ser du tilstedeværelse per avdeling og en live-liste over
                                inn- og utsjekk i dag.
                            </p>
                            {error && <p className="error-message">{error}</p>}
                        </section>

                        {/* Avdelinger */}
                        <section className="staff-section">
                            <h2 className="staff-section-title">Avdelinger</h2>

                            {departments.length === 0 ? (
                                <p className="staff-empty-text">
                                    Ingen avdelinger registrert ennå.
                                </p>
                            ) : (
                                <div className="staff-department-list">
                                    {departments.map((dep) => {
                                        const depChildren = getChildrenForDepartment(dep.id);
                                        return (
                                            <article key={dep.id} className="staff-department-card">
                                                <header className="staff-department-header">
                                                    <h3 className="staff-department-name">
                                                        {dep.name}
                                                    </h3>
                                                    <span className="staff-department-count">
                            {depChildren.length} barn
                          </span>
                                                </header>

                                                {depChildren.length === 0 ? (
                                                    <p className="staff-department-empty">
                                                        Ingen barn registrert på denne avdelingen ennå.
                                                    </p>
                                                ) : (
                                                    <ul className="staff-presence-list">
                                                        {depChildren.map((child) => (
                                                            <li
                                                                key={child.id}
                                                                className="staff-presence-row"
                                                            >
                                                                <div className="staff-presence-info">
                                  <span className="staff-presence-name">
                                    {child.name}
                                  </span>
                                                                    <span className="staff-presence-time">
                                    {child.lastChange
                                        ? `${
                                            child.status === "in" ? "Inn" : "Ut"
                                        } ${child.lastChange}`
                                        : "Ikke registrert i dag"}
                                  </span>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={`staff-presence-toggle ${
                                                                        child.status === "in"
                                                                            ? "staff-presence-toggle--in"
                                                                            : "staff-presence-toggle--out"
                                                                    }`}
                                                                    onClick={() => openCheckInFlow(child)}
                                                                >
                                                                    {child.status === "in"
                                                                        ? "Sjekk ut"
                                                                        : "Sjekk inn"}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Live inn-/ut-liste */}
                        <section className="staff-section">
                            <h2 className="staff-section-title">Inn- og utsjekk i dag</h2>

                            {checkLog.length === 0 ? (
                                <p className="staff-empty-text">
                                    Ingen registreringer ennå i dag.
                                </p>
                            ) : (
                                <ul className="staff-checklog-list">
                                    {checkLog.map((log) => (
                                        <li key={log.id} className="staff-checklog-item">
                                            <div className="staff-checklog-main">
                        <span className="staff-checklog-name">
                          {log.childName}
                        </span>
                                                <span className="staff-checklog-dep">
                          {log.departmentName}
                        </span>
                                            </div>
                                            <div className="staff-checklog-meta">
                        <span
                            className={`staff-checklog-status ${
                                log.action === "in"
                                    ? "staff-checklog-status--in"
                                    : "staff-checklog-status--out"
                            }`}
                        >
                          {log.action === "in" ? "Inn" : "Ut"}
                        </span>
                                                <span className="staff-checklog-time">
                          {log.time}
                        </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* Fullskjerms inn/ut-flyt */}
            {pendingChild && (
                <StaffCheckInFlow
                    childName={pendingChild.name}
                    departmentName={pendingChild.departmentName}
                    targetStatus={pendingAction}
                    onClose={() => setPendingChild(null)}
                    onConfirm={(reason, note) => {
                        void applyPresenceChange(pendingChild, pendingAction, reason, note);
                    }}
                />
            )}
        </>
    );
};

export default StaffDashboard;
