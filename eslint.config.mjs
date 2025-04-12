import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import airbnbBase from 'eslint-config-airbnb-base';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,jsx}'],
    plugins: {
      prettier: prettier,
    },
    rules: {
      ...airbnbBase.rules,
      'prettier/prettier': 'error',
      'no-underscore-dangle': 'off',
      'func-names': 'off',
      'consistent-return': 'off',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Adjust if you have CommonJS files
      globals: {
        // ...js.configs.recommended.languageOptions.globals,
        node: true,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': ts,
      prettier: prettier,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Enable type-aware linting
      },
      globals: {
        // ...js.configs.recommended.languageOptions.globals,
        node: true,
      },
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...airbnbBase.rules, // Apply Airbnb base rules to TS as well
      'prettier/prettier': 'error',
      'no-underscore-dangle': 'off', // Keep your existing rule
      'func-names': 'off', // Keep your existing rule
      'consistent-return': 'off', // Keep your existing rule

      // TypeScript specific rules (adjust as needed)
      '@typescript-eslint/explicit-function-return-type': 'warn', // Consider 'error'
      // '@typescript-eslint/no-explicit-any': 'warn', // Consider 'error'
      // '@typescript-eslint/no-unused-vars': '', // Consider 'error'
      '@typescript-eslint/no-non-null-assertion': 'warn', // Decide on your preference
      '@typescript-eslint/consistent-type-imports': 'warn', // Enforce consistent 'import type'
      '@typescript-eslint/no-shadow': 'warn', // More TS-aware no-shadow
      '@typescript-eslint/no-require-imports': 'off', // Disable the base JS no-require-imports rule
      '@typescript-eslint/ban-ts-comment': 'off', // Disable the base JS no-require-imports rule
      'no-shadow': 'off', // Disable the base JS no-shadow rule
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      prettier: prettier,
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      // Add other folders or files you want ESLint to ignore
    ],
  },
  // pluginPrettierRecommended,
];
