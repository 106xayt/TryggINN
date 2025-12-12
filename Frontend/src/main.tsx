// main.tsx (eller index.tsx)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeLanguageProvider } from "./ThemeLanguageContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeLanguageProvider>
      <App />
    </ThemeLanguageProvider>
  </React.StrictMode>
);
