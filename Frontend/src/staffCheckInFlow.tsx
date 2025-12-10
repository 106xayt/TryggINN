import { useState, type FormEvent } from "react";
import "./forside.css";
import "./staffCheckInFlow.css";

type PresenceStatus = "in" | "out";

interface StaffCheckInFlowProps {
  childName: string;
  departmentName: string;
  targetStatus: PresenceStatus; // "in" eller "out"
  onClose: () => void;
  onConfirm: (reason?: string, note?: string) => void;
}


const StaffCheckInFlow = ({
  childName,
  departmentName,
  targetStatus,
  onClose,
  onConfirm,
}: StaffCheckInFlowProps) => {
  const [reason, setReason] = useState<string>("normal");
  const [note, setNote] = useState<string>("");
  const [phase, setPhase] = useState<"form" | "success">("form");

  const isCheckIn = targetStatus === "in";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();


    onConfirm(reason, note || undefined);


    setPhase("success");
  };

  if (phase === "success") {
    return (
      <div className="checkflow-overlay">
        <div className="forside-root checkflow-root">
          <div className="phone-frame">
            <header className="checkflow-header">
              <div className="checkflow-avatar">T</div>
            </header>

            <main className="checkflow-main">
              <section className="checkflow-success-card">
                <div className="checkflow-success-icon">✓</div>
                <h1 className="checkflow-success-title">
                  {childName} er{" "}
                  {isCheckIn ? "krysset inn" : "krysset ut"}.
                </h1>
                <p className="checkflow-success-text">
                  Registreringen er lagret i{" "}
                  <strong>{departmentName}</strong>.
                </p>
              </section>

              <button
                type="button"
                className="checkflow-primary"
                onClick={onClose}
              >
                Tilbake til "Dine barn"
              </button>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkflow-overlay">
      <div className="forside-root checkflow-root">
        <div className="phone-frame">
          <header className="checkflow-header">
            <div className="checkflow-avatar">T</div>
          </header>

          <main className="checkflow-main">
            <section className="checkflow-title-section">
              <h1 className="checkflow-title">{childName}</h1>
              <p className="checkflow-subtitle">
                Avdeling <strong>{departmentName}</strong>
              </p>
            </section>

            <form onSubmit={handleSubmit} className="checkflow-form">
              <fieldset className="checkflow-fieldset">
                <legend className="checkflow-legend">
                  Hva skal registreres?
                </legend>

                <label className="checkflow-radio-row">
                  <input
                    type="radio"
                    name="reason"
                    value="normal"
                    checked={reason === "normal"}
                    onChange={() => setReason("normal")}
                  />
                  <span>
                    {isCheckIn ? "Kommer til barnehagen" : "Går hjem som normalt"}
                  </span>
                </label>

                <label className="checkflow-radio-row">
                  <input
                    type="radio"
                    name="reason"
                    value="pickedUp"
                    checked={reason === "pickedUp"}
                    onChange={() => setReason("pickedUp")}
                  />
                  <span>
                    {isCheckIn
                      ? "Kommer tilbake etter avtale"
                      : "Hentet av foresatt"}
                  </span>
                </label>

                <label className="checkflow-radio-row">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={reason === "other"}
                    onChange={() => setReason("other")}
                  />
                  <span>Annen årsak</span>
                </label>
              </fieldset>

              <div className="checkflow-note-field">
                <label className="checkflow-note-label">
                  Kommentar (valgfritt)
                </label>
                <textarea
                  className="checkflow-note-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isCheckIn
                      ? "F.eks. 'Kom 30 min senere i dag'"
                      : "F.eks. 'Gikk hjem med mor, sa fra i garderoben'"
                  }
                  rows={3}
                />
              </div>

              <div className="checkflow-actions">
                <button
                  type="button"
                  className="checkflow-secondary"
                  onClick={onClose}
                >
                  Avbryt
                </button>
                <button type="submit" className="checkflow-primary">
                  {isCheckIn ? "Kryss inn" : "Kryss ut"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StaffCheckInFlow;
