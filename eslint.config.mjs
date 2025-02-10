import eslintJs from '@eslint/js';
import noUnusedImportsPlugin from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import tsEslintParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';

// Prettier
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

import globals from 'globals';

export default [
    eslintJs.configs.recommended,
    eslintConfigPrettier,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsEslintParser,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsEslintPlugin,
            importPlugin,
            noUnusedImportsPlugin,
            prettier: eslintPluginPrettier,
            'prefer-arrow': preferArrowPlugin,
        },
        rules: {
            'no-redeclare': 0, // For enum declarations

            'no-unused-vars': 0, // use @typescript-eslint/no-unused-vars plugin for better typescript compatibility
            'no-dupe-class-members': 0,
            
            /** @see {@link https://typescript-eslint.io/rules/} */
            '@typescript-eslint/no-unused-vars': 1,
            '@typescript-eslint/consistent-type-imports': 1,
            '@typescript-eslint/no-dupe-class-members': 2,
            '@typescript-eslint/consistent-type-definitions': [2, 'type'],

            'prefer-arrow/prefer-arrow-functions': [
                1,
                {
                    allowStandaloneDeclarations: false,
                    classPropertiesAllowed: false, // class methods don't have to be arrow functions
                },
            ],
        },
    },
];
