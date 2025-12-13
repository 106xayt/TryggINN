import { useEffect, useState } from "react";
import "./forside.css";
import "./parentsDashboard.css";

// Bruk kun funksjonene (ingen type-imports)
import {
    getGroupsForDaycare,
    getLatestStatusForChild,
    registerAttendance,
} from "./api";

interface StaffDashboardProps {
    staffId: number;
    staffName: string;
    onLogout: () => void;
}

/* ---- API-modeller (lokale typer) ---- */

interface ApiStaffChild {
    id: number;
    firstName: string;
    lastName: string;
}

interface ApiDaycareGroup {
    id: number;
    name: string;
    description?: string | null;
    // backend *kan* sende med children, men vi tåler også at den ikke gjør det
    children?: ApiStaffChild[];
}

type AttendanceEventType = "IN" | "OUT";

interface ChildStatus {
    childId: number;
    childName: string;
    lastEventType: AttendanceEventType | null;
    lastEventTime: string | null;
    statusText: string;
}

/* ---- Frontend-modeller ---- */

type ChildStatusUi = "checkedIn" | "notCheckedIn";

interface StaffChild {
    id: number;
    name: string;
    groupId: number;
    groupName: string;
    status: ChildStatusUi;
    lastCheckIn?: string;
    note?: string;
}

interface StaffGroup {
    id: number;
    name: string;
    children: StaffChild[];
}

/* ---- Komponent ---- */

const StaffDashboard = ({ staffId, staffName, onLogout }: StaffDashboardProps) => {
    const [groups, setGroups] = useState<StaffGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For nå: hardkodet barnehageId = 1 (kan senere komme fra login-respons)
    const daycareId = 1;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1) HENT GRUPPER FRA BACKEND (ekte endepunkt via api.ts)
                const rawGroups = (await getGroupsForDaycare(daycareId)) as ApiDaycareGroup[];

                console.log("Daycare groups fra backend:", rawGroups);

                if (!rawGroups || rawGroups.length === 0) {
                    setGroups([]);
                    return;
                }

                // 2) Bygg StaffGroup[] uansett om backend sender children eller ikke
                const staffGroups: StaffGroup[] = rawGroups.map((g) => ({
                    id: g.id,
                    name: g.name,
                    children: [],
                }));

                const groupMap = new Map<number, StaffGroup>();
                staffGroups.forEach((g) => groupMap.set(g.id, g));

                // 3) Hvis backend faktisk sender children, legg dem inn
                const allChildren: StaffChild[] = [];
                for (const g of rawGroups) {
                    const apiChildren = g.children ?? [];
                    const group = groupMap.get(g.id);
                    for (const c of apiChildren) {
                        const child: StaffChild = {
                            id: c.id,
                            name: `${c.firstName} ${c.lastName}`,
                            groupId: g.id,
                            groupName: g.name,
                            status: "notCheckedIn",
                        };
                        group?.children.push(child);
                        allChildren.push(child);
                    }
                }

                // Hvis backend ikke sendte noen barn, har vi fortsatt gruppene,
                // men allChildren er tom → vi skipper attendance-oppslag.
                if (allChildren.length > 0) {
                    // 4) Slå opp siste attendance for hvert barn
                    await Promise.all(
                        allChildren.map(async (child) => {
                            try {
                                const status = (await getLatestStatusForChild(child.id)) as ChildStatus;

                                if (status.lastEventType === "IN") {
                                    child.status = "checkedIn";
                                } else {
                                    child.status = "notCheckedIn";
                                }

                                if (status.lastEventTime) {
                                    const timeStr = new Date(status.lastEventTime).toLocaleTimeString(
                                        "nb-NO",
                                        { hour: "2-digit", minute: "2-digit" }
                                    );
                                    if (status.lastEventType === "IN") {
                                        child.lastCheckIn = timeStr;
                                        child.note = `Krysset inn ${timeStr}`;
                                    } else {
                                        child.note = `Sist registrert: ute ${timeStr}`;
                                    }
                                }
                            } catch (e) {
                                console.warn("Klarte ikke hente attendance for barn", child.id, e);
                            }
                        })
                    );
                }

                setGroups(staffGroups);
            } catch (e: any) {
                console.error("Feil ved henting av grupper/barn", e);
                setError(e?.message ?? "Klarte ikke å hente dagens oversikt.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [daycareId]);

    /* ---- Toggle inn/ut ---- */

    const toggleChild = async (child: StaffChild) => {
        const currentlyIn = child.status === "checkedIn";
        const eventType: AttendanceEventType = currentlyIn ? "OUT" : "IN";

        const now = new Date();
        const timeStr = now.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });

        try {
            await registerAttendance({
                childId: child.id,
                performedByUserId: staffId,
                eventType,
                note: currentlyIn
                    ? "Ansatt sjekket ut via app"
                    : "Ansatt sjekket inn via app",
            });


            setGroups((prev) =>
                prev.map((g) => ({
                    ...g,
                    children: g.children.map((c) =>
                        c.id === child.id
                            ? {
                                ...c,
                                status: currentlyIn ? "notCheckedIn" : "checkedIn",
                                lastCheckIn: currentlyIn ? undefined : timeStr,
                                note: currentlyIn
                                    ? "Ikke krysset inn ennå"
                                    : `Krysset inn ${timeStr}`,
                            }
                            : c
                    ),
                }))
            );
        } catch (e) {
            console.error("Feil ved registrering av attendance", e);
            alert("Klarte ikke å registrere inn/ut-kryssing.");
        }
    };


    /* ---- Render ---- */

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

                <main className="dashboard-main">
                    <section className="dashboard-greeting">
                        <div className="dashboard-greeting-row">
                            <h1 className="dashboard-title">Hei {staffName}!</h1>
                            <p className="dashboard-subtitle">
                                Dagens oversikt over barn i barnehagen.
                            </p>
                        </div>
                    </section>

                    {loading && <p className="dashboard-empty-text">Laster data …</p>}

                    {error && !loading && (
                        <p className="dashboard-empty-text">{error}</p>
                    )}

                    {!loading && !error && groups.length === 0 && (
                        <p className="dashboard-empty-text">
                            Ingen grupper eller barn funnet. Sjekk at barnehagen har registrert
                            grupper og barn i systemet.
                        </p>
                    )}

                    {!loading && !error && groups.length > 0 && (
                        <section className="dashboard-section">
                            {groups.map((group) => (
                                <div key={group.id} className="dashboard-group-block">
                                    <h2 className="dashboard-section-title">
                                        Avdeling {group.name}
                                    </h2>

                                    {group.children.length === 0 && (
                                        <p className="dashboard-empty-text">
                                            Ingen barn registrert i denne avdelingen.
                                        </p>
                                    )}

                                    <div className="children-list">
                                        {group.children.map((child) => {
                                            const isCheckedIn = child.status === "checkedIn";
                                            const firstLetter = child.name.trim().charAt(0).toUpperCase();

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
                                                            <div className="child-avatar child-avatar--placeholder">
                                                                {firstLetter}
                                                            </div>
                                                            <h3 className="child-name">{child.name}</h3>
                                                        </div>
                                                    </div>

                                                    <div className="child-card-body">
                                                        <div>
                                                            <p className="child-status-text">
                                                                {child.note ??
                                                                    (isCheckedIn
                                                                        ? `Krysset inn ${child.lastCheckIn ?? ""}`
                                                                        : "Ikke krysset inn ennå")}
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className={`child-action-button ${
                                                                isCheckedIn
                                                                    ? "child-action-button--danger"
                                                                    : "child-action-button--success"
                                                            }`}
                                                            onClick={() => toggleChild(child)}
                                                        >
                                                            {isCheckedIn ? "Sjekk ut" : "Sjekk inn"}
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StaffDashboard;
