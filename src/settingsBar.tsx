// src/SettingsBar.tsx
import { useThemeLanguage } from "./ThemeLanguageContext";

export default function SettingsBar() {
  const { theme, toggleTheme, language, setLanguage } = useThemeLanguage();

  return (
    <div className="settings-bar">
      <button
        type="button"
        className="theme-toggle-button"
        onClick={toggleTheme}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <select
        className="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as "nb" | "en")}
      >
        <option value="nb">NO</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
