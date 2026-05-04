import css from "@eslint/css";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  globalIgnores(["docs/"]),
  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: { css },
    extends: ["css/recommended"],
    rules: {
      "css/use-baseline": ["warn", { available: "newly" }],
    },
  },
  {
    files: ["**/*.{t,j}s"],
    plugins: { js, ts },
    extends: ["js/recommended", "ts/strict", "ts/stylistic"],
  },
);
