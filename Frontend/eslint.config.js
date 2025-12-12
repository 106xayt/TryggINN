// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignorer bygget output
  globalIgnores(["dist", "node_modules"]),

  {
    files: ["**/*.{ts,tsx}"],

    // Her er *ingen* parserOptions.project, så ingen tsconfig-mas.
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      // typescript-eslint brukes bare som regelsett, ikke med project
      "@typescript-eslint": tseslint,
    },

    extends: [
      js.configs.recommended,
      // Bruk "recommended" UTEN type-checking
      ...tseslint.configs.recommended,

      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    rules: {
      // Litt mildere på react-refresh regelen som ga “Fast refresh only works…”
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);


