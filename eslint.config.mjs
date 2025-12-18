import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { flatConfig as nextPluginFlatConfig } from '@next/eslint-plugin-next';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: ['.next/', 'node_modules/', 'public/*.js', 'android/'], // Ignore generated JS files and android folder
  },
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // Next.js recommended and core-web-vitals rules
  nextPluginFlatConfig.recommended,
  nextPluginFlatConfig.coreWebVitals,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Prettier recommended rules
  eslintPluginPrettierRecommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.json', '.md'],
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Allow require if needed
      '@next/next/no-img-element': 'off', // Allow <img> for now
    },
  },
  {
    files: ['jest.config.js', 'jest.setup.js', 'next.config.ts', 'tailwind.config.ts'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
