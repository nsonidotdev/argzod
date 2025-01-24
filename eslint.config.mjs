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
            tsEslintPlugin,
            importPlugin,
            noUnusedImportsPlugin,
            prettier: eslintPluginPrettier,
            'prefer-arrow': preferArrowPlugin,
        },
        rules: {
            'no-redeclare': 0, // For enum declarations

            // use tsElsintPlugin plugin for better typescript compatibility
            'no-unused-vars': 0,
            'tsEslintPlugin/no-unused-vars': 'warn',

            'prefer-arrow/prefer-arrow-functions': [
                'warn',
                {
					allowStandaloneDeclarations: false,
                    classPropertiesAllowed: false, // class methods don't have to be arrow functions
                },
            ],
        },
    },
];
