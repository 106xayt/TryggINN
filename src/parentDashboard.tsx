import { useState, useEffect, type FormEvent } from "react";
import "./forside.css";            // layout (mobilramme)
import "./parentsDashboard.css";   // dashboard-stiler

type ChildStatus = "notCheckedIn" | "checkedIn";

export interface Child {
  id: number;
  name: string;
  status: ChildStatus;
  lastCheckIn?: string;

  // Nye felt – klare for backend
  allergies?: string;
  department?: string;
  otherInfo?: string;

  note?: string; // brukes til status-tekst ("Ikke krysset inn ennå" etc.)
}

interface ParentDashboardProps {
  parentName: string;
  onLogout: () => void;
}

const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  // 👇 Tom liste – backend kan senere fylle denne via API
  const [children, setChildren] = useState<Child[]>([]);

  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAllergies, setNewChildAllergies] = useState("");
  const [newChildDepartment, setNewChildDepartment] = useState("");
  const [newChildOther, setNewChildOther] = useState("");

  useEffect(() => {
    // Her kan backend kobles på senere:
    // api.getChildrenForParent().then(setChildren);
  }, []);

  const toggleCheckStatus = (id: number) => {
    setChildren((prev) =>
      prev.map((child) =>
        child.id === id
          ? {
              ...child,
              status:
                child.status === "checkedIn"
                  ? "notCheckedIn"
                  : "checkedIn",
              lastCheckIn:
                child.status === "checkedIn"
                  ? undefined
                  : new Date().toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
              note:
                child.status === "checkedIn"
                  ? "Ikke krysset inn ennå"
                  : `Krysset inn ${new Date().toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`,
            }
          : child
      )
    );
  };

  const handleAddChild = (e: FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newChild: Child = {
      id: Date.now(), // midlertidig – backend vil gi ekte ID senere
      name: newChildName.trim(),
      status: "notCheckedIn",
      note: "Ikke krysset inn ennå",
      allergies: newChildAllergies.trim() || undefined,
      department: newChildDepartment.trim() || undefined,
      otherInfo: newChildOther.trim() || undefined,
    };

    // Senere kan dette byttes til respons fra API-et
    setChildren((prev) => [...prev, newChild]);

    // reset felter
    setNewChildName("");
    setNewChildAllergies("");
    setNewChildDepartment("");
    setNewChildOther("");
    setShowAddChild(false);
  };

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
            <h1 className="dashboard-title">Hei Lise!</h1>
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Dine barn</h2>

            {children.length === 0 ? (
              <p className="dashboard-empty-text">
                Du har ingen registrerte barn ennå.
                <br />
                Trykk på <strong>&quot;Legg til nytt barn&quot;</strong> for å
                legge inn informasjon.
              </p>
            ) : (
              <div className="children-list">
                {children.map((child) => {
                  const isCheckedIn = child.status === "checkedIn";
                  return (
                    <article
                      key={child.id}
                      className={`child-card ${
                        isCheckedIn ? "child-card--ok" : "child-card--alert"
                      }`}
                    >
                      <div className="child-card-header">
                        <h3 className="child-name">{child.name}</h3>
                        <button className="child-info-button">Info</button>
                      </div>

                      <div className="child-card-body">
                        <div>
                          <p className="child-status-text">
                            {child.note ??
                              (isCheckedIn
                                ? `Krysset inn ${child.lastCheckIn ?? ""}`
                                : "Ikke krysset inn ennå")}
                          </p>

                          {/* Ekstra info-liste */}
                          <ul className="child-extra-list">
                            {child.allergies && (
                              <li>Allergier: {child.allergies}</li>
                            )}
                            {child.department && (
                              <li>Avdeling: {child.department}</li>
                            )}
                            {child.otherInfo && (
                              <li>Annet: {child.otherInfo}</li>
                            )}
                          </ul>
                        </div>

                        <button
                          className={`child-action-button ${
                            isCheckedIn
                              ? "child-action-button--danger"
                              : "child-action-button--success"
                          }`}
                          onClick={() => toggleCheckStatus(child.id)}
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

          <section className="dashboard-section add-child-section">
            {showAddChild ? (
              <form onSubmit={handleAddChild} className="add-child-form">
                <h3 className="add-child-title">Legg til nytt barn</h3>

                <div className="form-field">
                  <label className="form-label">Navn på barn</label>
                  <input
                    type="text"
                    className="text-input"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="F.eks. Noah Nordmann"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Allergier</label>
                  <input
                    type="text"
                    className="text-input"
                    value={newChildAllergies}
                    onChange={(e) => setNewChildAllergies(e.target.value)}
                    placeholder="F.eks. nøtter, melk, pollen"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Avdeling</label>
                  <input
                    type="text"
                    className="text-input"
                    value={newChildDepartment}
                    onChange={(e) => setNewChildDepartment(e.target.value)}
                    placeholder="F.eks. Rød, Blå, Løvene"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Annet (valgfritt)</label>
                  <input
                    type="text"
                    className="text-input"
                    value={newChildOther}
                    onChange={(e) => setNewChildOther(e.target.value)}
                    placeholder="Henting, språk, spesielle beskjeder..."
                  />
                </div>

                <div className="add-child-actions">
                  <button
                    type="button"
                    className="secondary-button small-secondary"
                    onClick={() => setShowAddChild(false)}
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="login-button small-login-button"
                  >
                    Lagre barn
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="secondary-button full-width-secondary"
                onClick={() => setShowAddChild(true)}
              >
                + Legg til nytt barn
              </button>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;



