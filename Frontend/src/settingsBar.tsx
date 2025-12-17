// src/SettingsBar.tsx
import { useThemeLanguage } from "./ThemeLanguageContext";
// Hook som gir tilgang til tema (lys/mørk) og språk (nb/en) + funksjoner for å endre dem

export default function SettingsBar() {
  // Henter nåværende tema og språk, samt funksjoner for å bytte dem
  const { theme, toggleTheme, language, setLanguage } = useThemeLanguage();

  return (
    // Container for innstillingslinjen (typisk plassert øverst eller nederst i UI)
    <div className="settings-bar">
      {/* Knapp for å bytte mellom lys og mørk modus */}
      <button
        type="button"
        className="theme-toggle-button"
        onClick={toggleTheme} // bytter tema når brukeren klikker
      >
        {/* Viser måne i lys modus og sol i mørk modus */}
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* Dropdown for valg av språk */}
      <select
        className="language-select"
        value={language} // nåværende språk
        onChange={(e) => setLanguage(e.target.value as "nb" | "en")} // oppdaterer språk i context
      >
        <option value="nb">NO</option> {/* Norsk */}
        <option value="en">EN</option> {/* Engelsk */}
      </select>
    </div>
  );
}
