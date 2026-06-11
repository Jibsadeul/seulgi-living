import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/.expo/**',
    '**/dist/**',
    '**/build/**',
    '**/next-env.d.ts',
  ]),
  ...nextVitals.map((config) => ({
    ...config,
    files: ['apps/api/**/*.{js,jsx,ts,tsx}'],
  })),
  ...nextTs.map((config) => ({
    ...config,
    files: ['apps/api/**/*.{js,jsx,ts,tsx}'],
  })),
  {
    files: ['apps/api/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {},
  },
]);
