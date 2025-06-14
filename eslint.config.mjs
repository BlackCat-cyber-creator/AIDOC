import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { flatConfig as nextPluginFlatConfig } from "@next/eslint-plugin-next";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: [".next/", "node_modules/"],
  },
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // Next.js recommended and core-web-vitals rules
  nextPluginFlatConfig.recommended,
  nextPluginFlatConfig.coreWebVitals,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Prettier recommended rules (to disable conflicting ESLint rules)
  eslintPluginPrettierRecommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-hooks": eslintPluginReactHooks,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // Add non-standard file extensions that TypeScript should be able to parse
        extraFileExtensions: [".json", ".md"],
      },
    },
    rules: {
      // Turn off `no-unused-vars` error and make it a warning instead for convenience.
      "@typescript-eslint/no-unused-vars": "warn",
      // Make no-explicit-any a warning for flexibility
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["jest.config.js", "jest.setup.js", "next.config.ts", "tailwind.config.ts"],
    // Do not use parserOptions.project for these files, as they are not part of the main TS project
    languageOptions: {
      sourceType: "commonjs",
      // If these files are JS, disable TypeScript parser rules here.
      // For .ts files that are configuration, we handle them differently.
    },
    rules: {
      // Disable no-undef for CommonJS global variables like 'module' and 'require'
      "no-undef": "off",
      // Disable this rule for CommonJS files that use require()
      "@typescript-eslint/no-require-imports": "off",
      // Other rules from your main config might apply and cause issues, you might need to disable them here.
    },
  },
);