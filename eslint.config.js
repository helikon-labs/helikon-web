import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import solid from 'eslint-plugin-solid/configs/typescript';

export default defineConfig(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        ...solid,
    },
    {
        files: ['**/*.{js,ts,tsx}'],
        plugins: {
            'jsx-a11y': jsxA11y,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'jsx-a11y/alt-text': 'error',
            'no-console': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
    {
        files: ['**/*.test.{ts,tsx}'],
        rules: {
            'no-console': 'off',
        },
    },
    prettier,
    {
        ignores: ['dist/', 'node_modules/', '.vite/', 'coverage/'],
    },
);
