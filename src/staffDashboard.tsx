import { useState } from "react";
import "./forside.css";          // ramme / base-layout
import "./staffDashboard.css";   // KUN styling for ansatt-dashbord

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
  action: PresenceStatus; // "in" eller "out"
  time: string;
}

interface StaffDashboardProps {
  staffName: string;
  onLogout: () => void;
}

// Demo-data (kan fjernes når backend kobles på)
const demoDepartments: Department[] = [
  { id: 1, name: "Lillebjørn" },
  { id: 2, name: "Månebarna" },
];

const demoChildren: PresenceChild[] = [
  {
    id: 1,
    name: "Oliver Nordmann",
    departmentId: 1,
    departmentName: "Lillebjørn",
    status: "out",
    lastChange: undefined,
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

const StaffDashboard = ({ staffName, onLogout }: StaffDashboardProps) => {
  // 👉 Disse kan senere erstattes med data fra API
  const [departments] = useState<Department[]>(() => demoDepartments);
  const [children, setChildren] = useState<PresenceChild[]>(() => demoChildren);
  const [checkLog, setCheckLog] = useState<CheckLogItem[]>([]);

  const nowTime = () =>
    new Date().toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const togglePresence = (childId: number) => {
    setChildren((prevChildren) => {
      return prevChildren.map((child) => {
        if (child.id !== childId) return child;

        const newStatus: PresenceStatus =
          child.status === "in" ? "out" : "in";
        const time = nowTime();

        // 👉 logg hendelse øverst i listen
        setCheckLog((prevLog) => [
          {
            id: Date.now(),
            childName: child.name,
            departmentName: child.departmentName,
            action: newStatus,
            time,
          },
          ...prevLog,
        ]);

        // 👉 her kan backend oppdateres senere:
        // api.updatePresence(child.id, newStatus)

        return {
          ...child,
          status: newStatus,
          lastChange: time,
        };
      });
    });
  };

  const getChildrenForDepartment = (depId: number) =>
    children.filter((c) => c.departmentId === depId);

  return (
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
          {/* Topptekst */}
          <section className="staff-greeting">
            <h1 className="staff-title">Hei {staffName}!</h1>
            <p className="staff-intro">
              Her ser du tilstedeværelse per avdeling og en live-liste over
              inn- og utsjekk i dag.
            </p>
          </section>

          {/* Sjekkliste per avdeling */}
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
                        <h3 className="staff-department-name">{dep.name}</h3>
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
                                    ? `${child.status === "in" ? "Inn" : "Ut"} ${child.lastChange}`
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
                                onClick={() => togglePresence(child.id)}
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
  );
};

export default StaffDashboard;


