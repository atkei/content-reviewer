import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    extends: [eslint.configs.recommended],
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/__tests__/**"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    plugins: {
      unicorn,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Unused variables (allow underscore prefix for intentionally unused)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // Enforce consistent type imports (use `import type` for types)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // Disallow console (use consola instead)
      "no-console": "error",

      // Enforce kebab-case file names
      "unicorn/filename-case": [
        "error",
        { case: "kebabCase" },
      ],
    },
  },

  {
    files: ["**/*.test.ts", "**/__tests__/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    plugins: {
      unicorn,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // Enforce kebab-case file names (also in tests)
      "unicorn/filename-case": [
        "error",
        { case: "kebabCase" },
      ],
    },
  },

  eslintConfigPrettier
);
