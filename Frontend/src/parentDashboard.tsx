// Frontend/src/ParentDashboard.tsx
import { useState, useEffect, type FormEvent } from "react";
import "./forside.css";
import "./parentsDashboard.css";
import { useThemeLanguage } from "./ThemeLanguageContext";

const API_BASE_URL = "http://localhost:8080";

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

interface ParentProfile {
  name: string;
  email: string;
  phone: string;
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
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const allergiesText =
    child.allergies?.trim() ||
    (isNb ? "Ingen registrerte allergier." : "No registered allergies.");
  const departmentText =
    child.department?.trim() ||
    (isNb ? "Ingen avdeling registrert." : "No department registered.");
  const otherText =
    child.otherInfo?.trim() ||
    (isNb ? "Ingen ekstra informasjon registrert." : "No extra information registered.");

  const firstLetter = child.name.trim().charAt(0).toUpperCase();

  const allergiesLabel = isNb ? "Allergier" : "Allergies";
  const departmentLabel = isNb ? "Avdeling" : "Department";
  const otherLabel = isNb ? "Annet" : "Other";
  const backText = isNb ? 'Tilbake til "Dine barn"' : 'Back to "Your children"';
  const departmentTitlePrefix = isNb ? "Avdeling " : "Department ";

  return (
    <section className="child-info-page">
      <div className="child-info-header">
        {child.photoUrl ? (
          <img
            src={child.photoUrl}
            alt={isNb ? `Bilde av ${child.name}` : `Photo of ${child.name}`}
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
            <p className="child-info-subtitle">
              {departmentTitlePrefix}
              {child.department}
            </p>
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
            <span className="info-pill-label">{allergiesLabel}</span>
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
            <span className="info-pill-label">{departmentLabel}</span>
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
            <span className="info-pill-label">{otherLabel}</span>
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
        {backText}
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
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

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
    { id: 1, label: isNb ? "🖼️ Bilde fra i går" : "🖼️ Photo from yesterday", photos: [] },
    { id: 2, label: isNb ? "🌲 Tur i skogen" : "🌲 Trip in the forest", photos: [] },
    { id: 3, label: isNb ? "🎉 Bursdagsfeiring" : "🎉 Birthday party", photos: [] },
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

  const titleText = isNb ? `Kryss inn ${child.name}` : `Check in ${child.name}`;
  const subtitleText = isNb
    ? `Trykk på knappen for å krysse inn ${child.name}.`
    : `Tap the button to check in ${child.name}.`;
  const cardSubtitlePrefix = isNb
    ? "Trykk for å krysse inn →"
    : "Tap to check in →";
  const statusBadge = isNb ? "Borte" : "Absent";

  const absenceLabel = isNb ? "🚫 Registrer fravær" : "🚫 Register absence";
  const absenceDateLabel = isNb ? "Dato" : "Date";
  const absenceNoteLabel = isNb
    ? "Notat (f.eks. sykdom)"
    : "Note (e.g. sickness)";
  const absencePlaceholder = isNb
    ? "Feber, forkjølet, time hos lege ..."
    : "Fever, cold, doctor appointment ...";

  const holidayLabel = isNb ? "🏝️ Legg inn ferie" : "🏝️ Register holiday";
  const holidayFromLabel = isNb ? "Fra" : "From";
  const holidayToLabel = isNb ? "Til" : "To";

  const pickupTitle = isNb
    ? "Hvem henter i barnehagen?"
    : "Who is picking up at kindergarten?";
  const pickupDateLabel = isNb ? "Dato for henting" : "Pickup date";
  const pickupNoteLabel = isNb ? "Melding om henting" : "Pickup note";
  const pickupPlaceholder = isNb
    ? "F.eks. Bestemor henter kl 15:30"
    : "e.g. Grandma picks up at 15:30";

  const activitiesTitle = isNb
    ? `Se hva ${child.name} har gjort`
    : `See what ${child.name} has done`;

  const calendarChipText = isNb
    ? "📅 Barnehagens kalender"
    : "📅 Kindergarten calendar";

  const upcomingTitle = isNb
    ? "Kommende i barnehagen"
    : "Upcoming in the kindergarten";

  const confirmButton = isNb
    ? `Kryss inn ${child.name} nå`
    : `Check in ${child.name} now`;

  const backText = isNb ? "Tilbake" : "Back";

  return (
    <section className="checkin-page">
      <h1 className="checkin-title">{titleText}</h1>
      <p className="checkin-subtitle">{subtitleText}</p>

      <div className="checkin-card">
        <div className="checkin-card-header">
          <div>
            <h2 className="checkin-child-name">{child.name}</h2>
            <p className="checkin-child-subtitle">
              {cardSubtitlePrefix}
              {child.department
                ? isNb
                  ? ` Avdeling ${child.department}`
                  : ` Department ${child.department}`
                : ""}
            </p>
          </div>
          <span className="checkin-status-badge">{statusBadge}</span>
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
            <span className="checkin-radio-label">{absenceLabel}</span>
          </button>

          {selectedOption === "absent" && (
            <div className="checkin-extra-fields">
              <div className="checkin-field">
                <label className="checkin-field-label">
                  {absenceDateLabel}
                </label>
                <input
                  type="date"
                  className="checkin-field-input"
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                />
              </div>
              <div className="checkin-field">
                <label className="checkin-field-label">
                  {absenceNoteLabel}
                </label>
                <input
                  type="text"
                  className="checkin-field-input"
                  placeholder={absencePlaceholder}
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
            <span className="checkin-radio-label">{holidayLabel}</span>
          </button>

          {selectedOption === "holiday" && (
            <div className="checkin-extra-fields">
              <div className="checkin-field-row">
                <div className="checkin-field">
                  <label className="checkin-field-label">
                    {holidayFromLabel}
                  </label>
                  <input
                    type="date"
                    className="checkin-field-input"
                    value={holidayFrom}
                    onChange={(e) => setHolidayFrom(e.target.value)}
                  />
                </div>
                <div className="checkin-field">
                  <label className="checkin-field-label">
                    {holidayToLabel}
                  </label>
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
        <p className="pickup-title">{pickupTitle}</p>
        <div className="checkin-extra-fields">
          <div className="checkin-field">
            <label className="checkin-field-label">{pickupDateLabel}</label>
            <input
              type="date"
              className="checkin-field-input"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>
          <div className="checkin-field">
            <label className="checkin-field-label">{pickupNoteLabel}</label>
            <input
              type="text"
              className="checkin-field-input"
              placeholder={pickupPlaceholder}
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Aktiviteter / bilder + kalenderknapp */}
      <div className="checkin-activities">
        <p className="checkin-activities-title">{activitiesTitle}</p>
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
            {calendarChipText}
          </button>
        </div>
      </div>

      {/* Kalender-hendelser (kort preview) */}
      {upcomingEvents.length > 0 && (
        <div className="calendar-section">
          <p className="calendar-title">{upcomingTitle}</p>
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
        {confirmButton}
      </button>

      <button
        type="button"
        className="secondary-button checkin-back-button"
        onClick={onBack}
      >
        {backText}
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
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  const subtitle = isNb
    ? `Bilder lagt inn av ansatte for ${child.name}.`
    : `Photos added by staff for ${child.name}.`;

  const emptyText = isNb
    ? "Ingen bilder er lagt inn enda. Dette fylles fra ansatt-siden."
    : "No photos have been added yet. This will be filled from the staff side.";

  const backText = isNb ? "Tilbake" : "Back";

  return (
    <section className="gallery-page">
      <h1 className="gallery-title">{activity.label}</h1>
      <p className="gallery-subtitle">{subtitle}</p>

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
        <p className="gallery-empty">{emptyText}</p>
      )}

      <button
        type="button"
        className="secondary-button checkin-back-button"
        onClick={onBack}
      >
        {backText}
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
  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  const todayISO = new Date().toISOString().slice(0, 10);

  const sortedEvents = events
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = sortedEvents.filter((e) => e.date >= todayISO);
  const past = sortedEvents.filter((e) => e.date < todayISO);

  const title = isNb ? "Barnehagens kalender" : "Kindergarten calendar";
  const subtitle = isNb
    ? "Oversikt over planlagte aktiviteter og merkedager."
    : "Overview of planned activities and special days.";

  const emptyText = isNb
    ? "Kalenderen er ikke fylt inn enda. Dette kommer fra barnehagens system."
    : "The calendar has not been filled in yet. This will come from the kindergarten's system.";

  const upcomingTitle = isNb ? "Kommende" : "Upcoming";
  const pastTitle = isNb ? "Tidligere" : "Past";

  const backText = isNb ? "Tilbake" : "Back";

  return (
    <section className="calendar-page">
      <h1 className="calendar-page-title">{title}</h1>
      <p className="calendar-page-subtitle">{subtitle}</p>

      {sortedEvents.length === 0 && (
        <p className="calendar-empty">{emptyText}</p>
      )}

      {upcoming.length > 0 && (
        <div className="calendar-block">
          <h2 className="calendar-block-title">{upcomingTitle}</h2>
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
          <h2 className="calendar-block-title">{pastTitle}</h2>
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
        {backText}
      </button>
    </section>
  );
};

/* ========= Profil-side for foresatt ========= */

interface ProfilePageProps {
  parentProfile: ParentProfile;
  onUpdateParentProfile: (profile: ParentProfile) => void;
  children: Child[];
  onUpdateChildren: (children: Child[]) => void;
  onBack: () => void;
  onPasswordReset: (newPassword: string) => void;
}

const ProfilePage = ({
  parentProfile,
  onUpdateParentProfile,
  children,
  onUpdateChildren,
  onBack,
  onPasswordReset,
}: ProfilePageProps) => {
  const [localParent, setLocalParent] = useState<ParentProfile>(parentProfile);
  const [localChildren, setLocalChildren] = useState<Child[]>(children);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  // hvilke seksjoner som er åpne
  const [openSections, setOpenSections] = useState<{
    parent: boolean;
    password: boolean;
    children: boolean;
  }>({
    parent: true,
    password: false,
    children: false,
  });

  useEffect(() => {
    setLocalParent(parentProfile);
  }, [parentProfile]);

  useEffect(() => {
    setLocalChildren(children);
  }, [children]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChildChange = (
    index: number,
    field: keyof Child,
    value: string
  ) => {
    setLocalChildren((prev) => {
      const copy = [...prev];
      const child = { ...copy[index] };
      if (field === "name") {
        child.name = value;
      } else if (field === "allergies") {
        child.allergies = value || undefined;
      } else if (field === "department") {
        child.department = value || undefined;
      } else if (field === "otherInfo") {
        child.otherInfo = value || undefined;
      } else if (field === "photoUrl") {
        child.photoUrl = value || undefined;
      }
      copy[index] = child;
      return copy;
    });
  };

  const handleSaveProfile = () => {
    onUpdateParentProfile(localParent);
    onUpdateChildren(localChildren);
  };

  const handlePasswordSubmit = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert(
        isNb
          ? "Fyll inn begge passordfeltene."
          : "Please fill in both password fields."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(
        isNb ? "Passordene er ikke like." : "The passwords do not match."
      );
      return;
    }
    // Klar for backend-integrasjon:
    onPasswordReset(newPassword);
    alert(
      isNb
        ? "I denne demoen lagres ikke passordet ennå. Dette kobles til backend senere."
        : "In this demo the password is not saved yet. This will be connected to the backend later."
    );
    setNewPassword("");
    setConfirmPassword("");
  };

  const profileTitle = isNb ? "Min profil" : "My profile";
  const parentSectionTitle = isNb ? "Foresatt" : "Guardian";
  const nameLabel = isNb ? "Navn" : "Name";
  const namePlaceholder = isNb ? "Ditt navn" : "Your name";
  const emailLabel = isNb ? "E-post" : "Email";
  const emailPlaceholder = isNb
    ? "din.epost@eksempel.no"
    : "your.email@example.com";
  const phoneLabel = isNb ? "Telefonnummer" : "Phone number";
  const phonePlaceholder = isNb ? "F.eks. 900 00 000" : "e.g. 900 00 000";

  const passwordSectionTitle = isNb ? "Passord" : "Password";
  const passwordHint = isNb
    ? "Her kan du be om å sette nytt passord. Selve lagringen kobles mot barnehagens system senere."
    : "Here you can request to set a new password. Saving will be connected to the kindergarten system later.";

  const newPasswordLabel = isNb ? "Nytt passord" : "New password";
  const repeatPasswordLabel = isNb
    ? "Gjenta nytt passord"
    : "Repeat new password";
  const resetPasswordButton = isNb ? "Reset passord" : "Reset password";

  const childrenTitle = isNb
    ? `Barn (${localChildren.length})`
    : `Children (${localChildren.length})`;

  const noChildrenHint = isNb
    ? "Du har ingen registrerte barn enda. Legg til barn fra hovedsiden."
    : "You have no registered children yet. Add children from the main page.";

  const childNameLabel = isNb ? "Navn" : "Name";
  const photoLabel = isNb ? "Lenke til bilde" : "Link to photo";
  const photoPlaceholder = "https://…";
  const allergiesLabel = isNb ? "Allergier" : "Allergies";
  const allergiesPlaceholder = isNb
    ? "F.eks. nøtter, melk, pollen"
    : "e.g. nuts, milk, pollen";
  const departmentLabel = isNb ? "Avdeling" : "Department";
  const departmentPlaceholder = isNb
    ? "F.eks. Rød, Blå, Løvene"
    : "e.g. Red, Blue, Lions";
  const otherLabel = isNb ? "Annet" : "Other";
  const otherPlaceholder = isNb
    ? "Henting, språk, spesielle beskjeder..."
    : "Pickup, language, special notes...";

  const saveButton = isNb ? "Lagre endringer" : "Save changes";
  const backButton = isNb
    ? 'Tilbake til "Dine barn"'
    : 'Back to "Your children"';

  return (
    <section className="profile-page">
      <h1 className="profile-title">{profileTitle}</h1>

      {/* Foresatt-info */}
      <div className="profile-section">
        <button
          type="button"
          className="profile-section-header"
          onClick={() => toggleSection("parent")}
        >
          <span className="profile-section-title">{parentSectionTitle}</span>
          <span
            className={`profile-section-arrow ${
              openSections.parent ? "profile-section-arrow--open" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {openSections.parent && (
          <div className="profile-section-body">
            <div className="form-field">
              <label className="form-label">{nameLabel}</label>
              <input
                type="text"
                className="text-input"
                value={localParent.name}
                onChange={(e) =>
                  setLocalParent((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={namePlaceholder}
              />
            </div>

            <div className="form-field">
              <label className="form-label">{emailLabel}</label>
              <input
                type="email"
                className="text-input"
                value={localParent.email}
                onChange={(e) =>
                  setLocalParent((p) => ({ ...p, email: e.target.value }))
                }
                placeholder={emailPlaceholder}
              />
            </div>

            <div className="form-field">
              <label className="form-label">{phoneLabel}</label>
              <input
                type="tel"
                className="text-input"
                value={localParent.phone}
                onChange={(e) =>
                  setLocalParent((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder={phonePlaceholder}
              />
            </div>
          </div>
        )}
      </div>

      {/* Passordseksjon */}
      <div className="profile-section">
        <button
          type="button"
          className="profile-section-header"
          onClick={() => toggleSection("password")}
        >
          <span className="profile-section-title">{passwordSectionTitle}</span>
          <span
            className={`profile-section-arrow ${
              openSections.password ? "profile-section-arrow--open" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {openSections.password && (
          <div className="profile-section-body">
            <p className="profile-section-hint">{passwordHint}</p>

            <div className="form-field">
              <label className="form-label">{newPasswordLabel}</label>
              <input
                type="password"
                className="text-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-field">
              <label className="form-label">{repeatPasswordLabel}</label>
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
              {resetPasswordButton}
            </button>
          </div>
        )}
      </div>

      {/* Barn-info */}
      <div className="profile-section">
        <button
          type="button"
          className="profile-section-header"
          onClick={() => toggleSection("children")}
        >
          <span className="profile-section-title">{childrenTitle}</span>
          <span
            className={`profile-section-arrow ${
              openSections.children ? "profile-section-arrow--open" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {openSections.children && (
          <div className="profile-section-body">
            {localChildren.length === 0 ? (
              <p className="profile-section-hint">{noChildrenHint}</p>
            ) : (
              <div className="profile-children-list">
                {localChildren.map((child, index) => (
                  <div key={child.id} className="profile-child-card">
                    <p className="profile-child-title">{child.name}</p>

                    <div className="form-field">
                      <label className="form-label">{childNameLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={child.name}
                        onChange={(e) =>
                          handleChildChange(index, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{photoLabel}</label>
                      <input
                        type="url"
                        className="text-input"
                        value={child.photoUrl ?? ""}
                        onChange={(e) =>
                          handleChildChange(index, "photoUrl", e.target.value)
                        }
                        placeholder={photoPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{allergiesLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={child.allergies ?? ""}
                        onChange={(e) =>
                          handleChildChange(index, "allergies", e.target.value)
                        }
                        placeholder={allergiesPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{departmentLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={child.department ?? ""}
                        onChange={(e) =>
                          handleChildChange(index, "department", e.target.value)
                        }
                        placeholder={departmentPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{otherLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={child.otherInfo ?? ""}
                        onChange={(e) =>
                          handleChildChange(index, "otherInfo", e.target.value)
                        }
                        placeholder={otherPlaceholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="login-button profile-save-button"
        onClick={handleSaveProfile}
      >
        {saveButton}
      </button>

      <button
        type="button"
        className="secondary-button profile-back-button"
        onClick={onBack}
      >
        {backButton}
      </button>
    </section>
  );
};

/* ========= Selve dashboardet ========= */

type ActiveView =
  | "list"
  | "info"
  | "checkIn"
  | "gallery"
  | "calendar"
  | "profile";

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

  // Profilinfo foresatt
  const [parentProfile, setParentProfile] = useState<ParentProfile>({
    name: parentName,
    email: "",
    phone: "",
  });

  const { language } = useThemeLanguage();
  const isNb = language === "nb";

  useEffect(() => {
    // Her kan backend kobles på senere
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
                  ? isNb
                    ? "Ikke krysset inn ennå"
                    : "Not checked in yet"
                  : (isNb ? "Krysset inn " : "Checked in ") +
                    new Date().toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
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
      note: isNb ? "Ikke krysset inn ennå" : "Not checked in yet",
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
            note: (isNb ? "Krysset inn " : "Checked in ") + timeStr,
            absenceDate: undefined,
            absenceNote: undefined,
            holidayFrom: undefined,
            holidayTo: undefined,
          };
        } else if (option === "absent") {
          const formattedDate = absenceDate
            ? new Date(absenceDate).toLocaleDateString("nb-NO")
            : isNb
            ? "i dag"
            : "today";
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
            note:
              (isNb ? "Registrert fravær " : "Registered absence ") +
              formattedDate +
              noteText,
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
            note:
              (isNb ? "Registrert ferie" : "Registered holiday") +
              dateRangeText,
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
                ? isNb
                  ? ` – Henting: ${pickupNote.trim()}`
                  : ` – Pickup: ${pickupNote.trim()}`
                : isNb
                ? `Henting: ${pickupNote.trim()}`
                : `Pickup: ${pickupNote.trim()}`;
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

  const openProfile = () => {
    setActiveView("profile");
  };

  const handleUpdateParentProfile = (profile: ParentProfile) => {
    setParentProfile(profile);
  };

  const handleUpdateChildrenFromProfile = (updatedChildren: Child[]) => {
    setChildren(updatedChildren);
  };

  const handlePasswordReset = (newPassword: string) => {
    console.log("Ønsket nytt passord:", newPassword);
  };

  const displayName = parentProfile.name || parentName;

  const logoutText = isNb ? "Logg ut" : "Log out";
  const hiText = isNb ? "Hei" : "Hi";
  const profileLink = isNb ? "Min profil" : "My profile";
  const sectionTitleChildren = isNb ? "Dine barn" : "Your children";
  const noChildrenText = isNb
    ? 'Du har ingen registrerte barn ennå.\nTrykk på "Legg til nytt barn" for å legge inn informasjon.'
    : 'You have no registered children yet.\nTap "Add new child" to add information.';

  const notCheckedInText = isNb
    ? "Ikke krysset inn ennå"
    : "Not checked in yet";

  const checkedInPrefix = isNb ? "Krysset inn " : "Checked in ";

  const pickupPrefix = isNb ? "Henting" : "Pickup";

  const checkOutText = isNb ? "Sjekk ut" : "Check out";
  const checkInText = isNb ? "Sjekk inn" : "Check in";

  const calendarButtonText = isNb
    ? "📅 Se barnehagens kalender"
    : "📅 View kindergarten calendar";

  const addChildTitle = isNb ? "Legg til nytt barn" : "Add new child";
  const childNameLabel = isNb ? "Navn på barn" : "Child's name";
  const childNamePlaceholder = isNb
    ? "F.eks. Noah Nordmann"
    : "e.g. Noah Nordmann";

  const photoLabel = isNb
    ? "Lenke til bilde (valgfritt)"
    : "Link to photo (optional)";
  const photoPlaceholder = "https://…";

  const allergiesLabel = isNb ? "Allergier" : "Allergies";
  const allergiesPlaceholder = isNb
    ? "F.eks. nøtter, melk, pollen"
    : "e.g. nuts, milk, pollen";

  const departmentLabel = isNb ? "Avdeling" : "Department";
  const departmentPlaceholder = isNb
    ? "F.eks. Rød, Blå, Løvene"
    : "e.g. Red, Blue, Lions";

  const otherLabel = isNb ? "Annet (valgfritt)" : "Other (optional)";
  const otherPlaceholder = isNb
    ? "Henting, språk, spesielle beskjeder..."
    : "Pickup, language, special notes...";

  const cancelText = isNb ? "Avbryt" : "Cancel";
  const saveChildText = isNb ? "Lagre barn" : "Save child";
  const addChildButton = isNb ? "+ Legg til nytt barn" : "+ Add new child";

  const successHeadingPrefix = isNb
    ? "er krysset inn"
    : "has been checked in";
  const successTextPrefix = isNb
    ? "Innkryssing er registrert kl "
    : "Check-in registered at ";
  const successDepartmentPrefix = isNb ? ", hos " : ", in ";
  const successBackText = isNb
    ? 'Tilbake til "Dine barn"'
    : 'Back to "Your children"';

  return (
    <div className="forside-root">
      <div className="phone-frame">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="avatar-circle">T</div>
            <span className="brand-text">TryggINN</span>
          </div>
          <button className="text-link-button" onClick={onLogout}>
            {logoutText}
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

          {activeView === "profile" && (
            <ProfilePage
              parentProfile={parentProfile}
              onUpdateParentProfile={handleUpdateParentProfile}
              children={children}
              onUpdateChildren={handleUpdateChildrenFromProfile}
              onBack={backToList}
              onPasswordReset={handlePasswordReset}
            />
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
                <div className="dashboard-greeting-row">
                  <h1 className="dashboard-title">
                    {hiText} {displayName}!
                  </h1>
                  <button
                    type="button"
                    className="profile-link-button"
                    onClick={openProfile}
                  >
                    {profileLink}
                  </button>
                </div>
              </section>

              <section className="dashboard-section">
                <h2 className="dashboard-section-title">
                  {sectionTitleChildren}
                </h2>

                {children.length === 0 ? (
                  <p className="dashboard-empty-text">
                    {noChildrenText.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        {idx === 0 && <br />}
                      </span>
                    ))}
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
                        upcomingPickupText = `${pickupPrefix} ${dateText}: ${nextPlan.note}`;
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
                                  alt={
                                    isNb
                                      ? `Bilde av ${child.name}`
                                      : `Photo of ${child.name}`
                                  }
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
                              {isNb ? "Info" : "Info"}
                            </button>
                          </div>

                          <div className="child-card-body">
                            <div>
                              <p className="child-status-text">
                                {child.note ??
                                  (isCheckedIn
                                    ? `${checkedInPrefix}${
                                        child.lastCheckIn ?? ""
                                      }`
                                    : notCheckedInText)}
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
                              {isCheckedIn ? checkOutText : checkInText}
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
                  {calendarButtonText}
                </button>
              </section>

              <section className="dashboard-section add-child-section">
                {showAddChild ? (
                  <form onSubmit={handleAddChild} className="add-child-form">
                    <h3 className="add-child-title">{addChildTitle}</h3>

                    <div className="form-field">
                      <label className="form-label">{childNameLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder={childNamePlaceholder}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{photoLabel}</label>
                      <input
                        type="url"
                        className="text-input"
                        value={newChildPhotoUrl}
                        onChange={(e) => setNewChildPhotoUrl(e.target.value)}
                        placeholder={photoPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{allergiesLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildAllergies}
                        onChange={(e) => setNewChildAllergies(e.target.value)}
                        placeholder={allergiesPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{departmentLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildDepartment}
                        onChange={(e) => setNewChildDepartment(e.target.value)}
                        placeholder={departmentPlaceholder}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">{otherLabel}</label>
                      <input
                        type="text"
                        className="text-input"
                        value={newChildOther}
                        onChange={(e) => setNewChildOther(e.target.value)}
                        placeholder={otherPlaceholder}
                      />
                    </div>

                    <div className="add-child-actions">
                      <button
                        type="button"
                        className="secondary-button small-secondary"
                        onClick={() => setShowAddChild(false)}
                      >
                        {cancelText}
                      </button>
                      <button
                        type="submit"
                        className="login-button small-login-button"
                      >
                        {saveChildText}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="secondary-button full-width-secondary"
                    onClick={() => setShowAddChild(true)}
                  >
                    {addChildButton}
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
                {checkInSuccess.childName} {successHeadingPrefix}
              </p>
              <p className="checkin-success-text">
                {successTextPrefix}
                <strong>{checkInSuccess.time}</strong>
                {checkInSuccess.department
                  ? `${successDepartmentPrefix}${checkInSuccess.department}`
                  : ""}
                .
              </p>

              <button
                type="button"
                className="login-button checkin-success-button"
                onClick={handleCloseSuccess}
              >
                {successBackText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
