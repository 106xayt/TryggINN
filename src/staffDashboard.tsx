import { useState, useEffect } from "react";
import "./forside.css";
import "./parentsDashboard.css"; // vi gjenbruker styling + utvider den for ansatte

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

const StaffDashboard = ({ staffName, onLogout }: StaffDashboardProps) => {
  // Avdelinger (klar for backend)
  const [departments, setDepartments] = useState<Department[]>([]);

  // Barn med tilstede-status per avdeling (klar for backend)
  const [children, setChildren] = useState<PresenceChild[]>([]);

  // Liste over inn/ut-hendelser (livelog)
  const [checkLog, setCheckLog] = useState<CheckLogItem[]>([]);

  useEffect(() => {
    // 👉 Her kan backend kobles på senere.
    // F.eks:
    // api.getDepartments().then(setDepartments);
    // api.getPresenceToday().then(setChildren);

    // Midlertidige demo-data:
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

    setDepartments(demoDepartments);
    setChildren(demoChildren);
  }, []);

  const nowTime = () =>
    new Date().toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const togglePresence = (childId: number) => {
    setChildren((prevChildren) => {
      const updated = prevChildren.map((child) => {
        if (child.id !== childId) return child;

        const newStatus: PresenceStatus =
          child.status === "in" ? "out" : "in";
        const time = nowTime();

        // legg inn ny logg-entry
        setCheckLog((prevLog) => [
          {
            id: Date.now(),
            childName: child.name,
            departmentName: child.departmentName,
            action: newStatus,
            time,
          },
          ...prevLog, // nyeste først
        ]);

        return {
          ...child,
          status: newStatus,
          lastChange: time,
        };
      });

      // 👉 Her kan backend oppdateres senere, f.eks:
      // api.updatePresenceForChild(childId, newStatus);

      return updated;
    });
  };

  const getChildrenForDepartment = (depId: number) =>
    children.filter((c) => c.departmentId === depId);

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
          {/* Topptekst */}
          <section className="dashboard-greeting">
            <h1 className="dashboard-title">Hei {staffName}!</h1>
            <p className="dashboard-empty-text">
              Her kan du se tilstedeværelse per avdeling og en live-liste over
              inn- og utsjekk i dag.
            </p>
          </section>

          {/* Sjekkliste per avdeling */}
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Avdelinger</h2>

            {departments.length === 0 ? (
              <p className="dashboard-empty-text">
                Ingen avdelinger registrert ennå.
              </p>
            ) : (
              <div className="department-list">
                {departments.map((dep) => {
                  const depChildren = getChildrenForDepartment(dep.id);
                  return (
                    <article key={dep.id} className="department-card">
                      <header className="department-header">
                        <h3 className="department-name">{dep.name}</h3>
                        <span className="department-count">
                          {depChildren.length} barn
                        </span>
                      </header>

                      {depChildren.length === 0 ? (
                        <p className="department-empty">
                          Ingen barn registrert på denne avdelingen ennå.
                        </p>
                      ) : (
                        <ul className="presence-list">
                          {depChildren.map((child) => (
                            <li
                              key={child.id}
                              className="presence-row"
                            >
                              <div className="presence-info">
                                <span className="presence-name">
                                  {child.name}
                                </span>
                                <span className="presence-time">
                                  {child.lastChange
                                    ? `${child.status === "in" ? "Inn" : "Ut"} ${child.lastChange}`
                                    : "Ikke registrert i dag"}
                                </span>
                              </div>

                              <button
                                type="button"
                                className={`presence-toggle ${
                                  child.status === "in"
                                    ? "presence-toggle--in"
                                    : "presence-toggle--out"
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
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Inn- og utsjekk i dag</h2>

            {checkLog.length === 0 ? (
              <p className="dashboard-empty-text">
                Ingen registreringer ennå i dag.
              </p>
            ) : (
              <ul className="checklog-list">
                {checkLog.map((log) => (
                  <li key={log.id} className="checklog-item">
                    <div className="checklog-main">
                      <span className="checklog-name">{log.childName}</span>
                      <span className="checklog-dep">
                        {log.departmentName}
                      </span>
                    </div>
                    <div className="checklog-meta">
                      <span
                        className={`checklog-status ${
                          log.action === "in"
                            ? "checklog-status--in"
                            : "checklog-status--out"
                        }`}
                      >
                        {log.action === "in" ? "Inn" : "Ut"}
                      </span>
                      <span className="checklog-time">{log.time}</span>
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

