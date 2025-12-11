import { useState } from "react";
import "./forside.css";
import "./staffDashboard.css";
import StaffCheckInFlow from "./staffCheckInFlow";
import { useThemeLanguage } from "./ThemeLanguageContext";

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
  reason?: string;
  note?: string;
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
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // 👉 Disse kan senere erstattes med data fra API
  const [departments] = useState<Department[]>(() => demoDepartments);
  const [children, setChildren] = useState<PresenceChild[]>(() => demoChildren);
  const [checkLog, setCheckLog] = useState<CheckLogItem[]>([]);

  // Pending inn/ut-flyt
  const [pendingChild, setPendingChild] = useState<PresenceChild | null>(null);
  const [pendingAction, setPendingAction] = useState<PresenceStatus>("in");

  const nowTime = () =>
    new Date().toLocaleTimeString(isNb ? "nb-NO" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const openCheckInFlow = (child: PresenceChild) => {
    // Neste status (i tråd med prototypen: trykk på knapp -> inn/ut-skjerm)
    const nextStatus: PresenceStatus = child.status === "in" ? "out" : "in";
    setPendingChild(child);
    setPendingAction(nextStatus);
  };

  const applyPresenceChange = (
    child: PresenceChild,
    newStatus: PresenceStatus,
    reason?: string,
    note?: string
  ) => {
    const time = nowTime();

    // Oppdater "Dine barn"-liste
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

    // Logg hendelse i "Inn- og utsjekk i dag"
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

  // 🔤 Tekster basert på språk
  const logoutText = isNb ? "Logg ut" : "Log out";
  const hiText = isNb ? "Hei" : "Hi";
  const introText = isNb
    ? "Her ser du tilstedeværelse per avdeling og en live-liste over inn- og utsjekk i dag."
    : "Here you can see presence per group and a live list of today’s check-ins and check-outs.";
  const departmentsTitle = isNb ? "Avdelinger" : "Departments";
  const noDepartmentsText = isNb
    ? "Ingen avdelinger registrert ennå."
    : "No departments registered yet.";

  const childrenSuffix = isNb ? " barn" : " children";
  const noChildrenInDep = isNb
    ? "Ingen barn registrert på denne avdelingen ennå."
    : "No children registered in this department yet.";

  const notRegisteredToday = isNb
    ? "Ikke registrert i dag"
    : "No registrations today";

  const inLabel = isNb ? "Inn" : "In";
  const outLabel = isNb ? "Ut" : "Out";

  const checkInButton = isNb ? "Sjekk inn" : "Check in";
  const checkOutButton = isNb ? "Sjekk ut" : "Check out";

  const logTitle = isNb ? "Inn- og utsjekk i dag" : "Check-ins and -outs today";
  const noLogText = isNb
    ? "Ingen registreringer ennå i dag."
    : "No registrations yet today.";

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
              {logoutText}
            </button>
          </header>

          <main className="staff-main">
            {/* Topptekst */}
            <section className="staff-greeting">
              <h1 className="staff-title">
                {hiText} {staffName}!
              </h1>
              <p className="staff-intro">{introText}</p>
            </section>

            {/* Sjekkliste per avdeling */}
            <section className="staff-section">
              <h2 className="staff-section-title">{departmentsTitle}</h2>

              {departments.length === 0 ? (
                <p className="staff-empty-text">{noDepartmentsText}</p>
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
                            {depChildren.length}
                            {childrenSuffix}
                          </span>
                        </header>

                        {depChildren.length === 0 ? (
                          <p className="staff-department-empty">
                            {noChildrenInDep}
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
                                          child.status === "in"
                                            ? `${inLabel}`
                                            : `${outLabel}`
                                        } ${child.lastChange}`
                                      : notRegisteredToday}
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
                                    ? checkOutButton
                                    : checkInButton}
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
              <h2 className="staff-section-title">{logTitle}</h2>

              {checkLog.length === 0 ? (
                <p className="staff-empty-text">{noLogText}</p>
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
                          {log.action === "in" ? inLabel : outLabel}
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

      {/* Fullskjerms inn/ut-flyt – følger Figma */}
      {pendingChild && (
        <StaffCheckInFlow
          childName={pendingChild.name}
          departmentName={pendingChild.departmentName}
          targetStatus={pendingAction}
          onClose={() => setPendingChild(null)}
          onConfirm={(reason, note) => {
            applyPresenceChange(pendingChild, pendingAction, reason, note);
          }}
        />
      )}
    </>
  );
};

export default StaffDashboard;

