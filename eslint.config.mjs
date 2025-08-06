// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  // Main source files
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["node_modules/**", "dist/**"], // optional ignore patterns
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "no-debugger": "error",
    },
  },

  // Test files config
  {
    files: ["test/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
]);
