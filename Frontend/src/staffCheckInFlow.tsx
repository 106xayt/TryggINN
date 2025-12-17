import { useState, type FormEvent } from "react";
// useState for lokal state i komponenten + FormEvent-type for submit-handler

import "./forside.css";
// gjenbruker grunn-styling (ramme/kort/typografi)

import "./staffCheckInFlow.css";
// egen styling for overlay/inn- og utsjekk-flow for ansatte

// Statusen som skal registreres (inn eller ut)
type PresenceStatus = "in" | "out";

// Props: data om barnet + hvilken handling (inn/ut) + callbacks
interface StaffCheckInFlowProps {
  childName: string;
  departmentName: string;
  targetStatus: PresenceStatus; // "in" eller "out"
  onClose: () => void; // lukk/avbryt flowen
  onConfirm: (reason?: string, note?: string) => void; // send valgte data tilbake til parent
}

const StaffCheckInFlow = ({
  childName,
  departmentName,
  targetStatus,
  onClose,
  onConfirm,
}: StaffCheckInFlowProps) => {
  // reason: hvilken type registrering (standard/pickedUp/other)
  const [reason, setReason] = useState<string>("normal");

  // note: valgfri kommentar fra ansatt
  const [note, setNote] = useState<string>("");

  // phase: bestemmer om vi viser skjema eller “suksess”-skjerm etter innsending
  const [phase, setPhase] = useState<"form" | "success">("form");

  // True hvis vi registrerer inn, false hvis vi registrerer ut
  const isCheckIn = targetStatus === "in";

  // Submit av skjema: sender data opp og bytter til suksessvisning
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // hindrer refresh

    // Sender valgt årsak + kommentar (tom kommentar -> undefined)
    onConfirm(reason, note || undefined);

    // Bytter UI til suksess-skjerm
    setPhase("success");
  };

  // Hvis vi allerede har sendt inn: vis suksess-overlay
  if (phase === "success") {
    return (
      <div className="checkflow-overlay">
        <div className="forside-root checkflow-root">
          <div className="phone-frame">
            {/* Topp-header med enkel avatar/logo */}
            <header className="checkflow-header">
              <div className="checkflow-avatar">T</div>
            </header>

            <main className="checkflow-main">
              {/* Suksess-kort: bekrefter om barnet ble krysset inn eller ut */}
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

              {/* Lukker flowen og går tilbake til forrige side */}
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

  // Standard-visning: skjema for å velge årsak + valgfri kommentar + bekreft/avbryt
  return (
    <div className="checkflow-overlay">
      <div className="forside-root checkflow-root">
        <div className="phone-frame">
          {/* Header med avatar/logo */}
          <header className="checkflow-header">
            <div className="checkflow-avatar">T</div>
          </header>

          <main className="checkflow-main">
            {/* Viser barnets navn og avdeling */}
            <section className="checkflow-title-section">
              <h1 className="checkflow-title">{childName}</h1>
              <p className="checkflow-subtitle">
                Avdeling <strong>{departmentName}</strong>
              </p>
            </section>

            {/* Skjemaet som registrerer type inn/ut + kommentar */}
            <form onSubmit={handleSubmit} className="checkflow-form">
              <fieldset className="checkflow-fieldset">
                <legend className="checkflow-legend">
                  Hva skal registreres?
                </legend>

                {/* Radio 1: “normal” (standard) */}
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

                {/* Radio 2: “pickedUp” (hentet/kommer tilbake etter avtale) */}
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

                {/* Radio 3: “other” (annen årsak) */}
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

              {/* Valgfri kommentar/merknad */}
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

              {/* Handlingsknapper: avbryt eller bekreft */}
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
// eksporter komponenten så den kan brukes der ansatte registrerer inn/ut
