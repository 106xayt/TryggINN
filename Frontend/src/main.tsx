// Importerer React, ReactDOM og hovedkomponenten App
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeLanguageProvider } from "./ThemeLanguageContext";

// Starter React-appen og kobler den til <div id="root"> i index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
  // StrictMode brukes i utvikling for å fange potensielle problemer
  <React.StrictMode>
    {/* Gjør tema- og språkinnstillinger tilgjengelig for hele appen */}
    <ThemeLanguageProvider>
      <App />
    </ThemeLanguageProvider>
  </React.StrictMode>
);
