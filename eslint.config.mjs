import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Deaktiviere die Regel, die 'any' Typen verbietet
      "@typescript-eslint/no-explicit-any": "off",
      // Deaktiviere andere problematische Regeln
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];

export default eslintConfig;
