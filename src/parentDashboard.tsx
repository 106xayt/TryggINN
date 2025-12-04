import { useState, useEffect, type FormEvent } from "react";
import "./forside.css";
import "./parentsDashboard.css";

type ChildStatus = "notCheckedIn" | "checkedIn";

export interface ChildActivity {
  id: number;
  label: string;
  photos: string[]; // URL-er til bilder – fylles av ansatte/backend senere
}

export interface PickupPlan {
  id: number;
  date: string; // ISO-dato (yyyy-mm-dd)
  note: string; // f.eks. "Bestemor henter kl 15:30"
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

  // Info-felt – klare for backend
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

  note?: string; // status-tekst som vises på kortet
}

interface ParentDashboardProps {
  parentName: string;
  onLogout: () => void;
}

/* ========= Infoside for ett barn ========= */

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

/* ========= Check-in side for ett barn ========= */

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
  const [selectedOption, setSelectedOption] = useState<CheckInOption>(
    "present"
  );

  const todayISO = new Date().toISOString().slice(0, 10);

  const [absenceDate, setAbsenceDate] = useState<string>(todayISO);
  const [absenceNote, setAbsenceNote] = useState<string>("");

  const [holidayFrom, setHolidayFrom] = useState<string>("");
  const [holidayTo, setHolidayTo] = useState<string>("");

  // Henting
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

  // Standardaktiviteter hvis barnet ikke har noe fra backend ennå
  const defaultActivities: ChildActivity[] = [
    { id: 1, label: "🖼️ Bilde fra i går", photos: [] },
    { id: 2, label: "🌲 Tur i skogen", photos: [] },
    { id: 3, label: "🎉 Bursdagsfeiring", photos: [] },
  ];

  const activitiesToShow: ChildActivity[] =
    child.activities && child.activities.length > 0
      ? child.activities
      : defaultActivities;

  // Kommende kalender-hendelser (kan kobles mot API senere)
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
              Trykk for å krysse inn →
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

      {/* Henteplan */}
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

      {/* Aktiviteter / bilder + kalenderknapp */}
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

      {/* Kalender-hendelser (kort preview) */}
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

/* ========= Galleri-side for aktiviteter ========= */

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

/* ========= Kalender-side (fullvisning) ========= */

interface CalendarPageProps {
  events: KindergartenEvent[];
  onBack: () => void;
}

const CalendarPage = ({ events, onBack }: CalendarPageProps) => {
  const todayISO = new Date().toISOString().slice(0, 10);

  const sortedEvents = events
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

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

/* ========= Selve dashboardet ========= */

type ActiveView = "list" | "info" | "checkIn" | "gallery" | "calendar";

interface CheckInSuccessData {
  childName: string;
  department?: string;
  time: string;
}

const ParentDashboard = ({ parentName, onLogout }: ParentDashboardProps) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);

  const [newChildName, setNewChildName] = useState("");
  const [newChildAllergies, setNewChildAllergies] = useState("");
  const [newChildDepartment, setNewChildDepartment] = useState("");
  const [newChildOther, setNewChildOther] = useState("");
  const [newChildPhotoUrl, setNewChildPhotoUrl] = useState("");

  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [activeActivity, setActiveActivity] = useState<ChildActivity | null>(
    null
  );

  // Kalender – klar for integrasjon mot barnehagens system
  const [calendarEvents, setCalendarEvents] = useState<KindergartenEvent[]>([]);

  // Dagens påminnelse (Husk utetøy osv) – fra ansatt-side/backend
  const [todayReminder, setTodayReminder] = useState<string | null>(null);

  // Bekreftelsesboks etter innsjekk
  const [checkInSuccess, setCheckInSuccess] =
    useState<CheckInSuccessData | null>(null);

  useEffect(() => {
    // Her kan backend kobles på senere, f.eks:
    // api.getChildrenForParent().then(setChildren);
    // api.getDailyReminder().then(setTodayReminder);
    // api.getKindergartenCalendar().then(setCalendarEvents);
  }, []);

  const toggleCheckStatusDirect = (id: number) => {
    // Brukes kun når vi SJEKKER UT direkte
    setChildren((prev) =>
      prev.map((child) =>
        child.id === id
          ? {
              ...child,
              status:
                child.status === "checkedIn" ? "notCheckedIn" : "checkedIn",
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
              absenceDate: undefined,
              absenceNote: undefined,
              holidayFrom: undefined,
              holidayTo: undefined,
            }
          : child
      )
    );
  };

  const handleAddChild = (e: FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newChild: Child = {
      id: Date.now(),
      name: newChildName.trim(),
      status: "notCheckedIn",
      note: "Ikke krysset inn ennå",
      allergies: newChildAllergies.trim() || undefined,
      department: newChildDepartment.trim() || undefined,
      otherInfo: newChildOther.trim() || undefined,
      photoUrl: newChildPhotoUrl.trim() || undefined,
    };

    setChildren((prev) => [...prev, newChild]);

    setNewChildName("");
    setNewChildAllergies("");
    setNewChildDepartment("");
    setNewChildOther("");
    setNewChildPhotoUrl("");
    setShowAddChild(false);
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

  const handleConfirmCheckIn = (data: {
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
          // holiday
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

        // Lagre henteplan hvis noe er skrevet inn
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

    // Vis grønn bekreftelsesboks kun ved innsjekk
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
                <h1 className="dashboard-title">Hei {parentName}!</h1>
              </section>

              <section className="dashboard-section">
                <h2 className="dashboard-section-title">Dine barn</h2>

                {children.length === 0 ? (
                  <p className="dashboard-empty-text">
                    Du har ingen registrerte barn ennå.
                    <br />
                    Trykk på <strong>&quot;Legg til nytt barn&quot;</strong> for
                    å legge inn informasjon.
                  </p>
                ) : (
                  <div className="children-list">
                    {children.map((child) => {
                      const isCheckedIn = child.status === "checkedIn";
                      const firstLetter =
                        child.name.trim().charAt(0).toUpperCase();

                      // Neste planlagte (eller sist registrerte) henting
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

              <section className="dashboard-section add-child-section">
                {showAddChild ? (
                  <form
                    onSubmit={handleAddChild}
                    className="add-child-form"
                  >
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
                      <label className="form-label">
                        Lenke til bilde (valgfritt)
                      </label>
                      <input
                        type="url"
                        className="text-input"
                        value={newChildPhotoUrl}
                        onChange={(e) => setNewChildPhotoUrl(e.target.value)}
                        placeholder="https://…"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Allergier</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildAllergies}
                        onChange={(e) =>
                          setNewChildAllergies(e.target.value)
                        }
                        placeholder="F.eks. nøtter, melk, pollen"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Avdeling</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildDepartment}
                        onChange={(e) =>
                          setNewChildDepartment(e.target.value)
                        }
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









