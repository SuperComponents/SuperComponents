import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  },
  {
    files: ['src/**/*.test.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.name="it"][callee.property.name="only"]',
          message: 'Focused tests with it.only() are not allowed'
        },
        {
          selector: 'CallExpression[callee.object.name="describe"][callee.property.name="only"]',
          message: 'Focused tests with describe.only() are not allowed'
        },
        {
          selector: 'CallExpression[callee.object.name="it"][callee.property.name="skip"]',
          message: 'Skipped tests with it.skip() are not allowed'
        },
        {
          selector: 'CallExpression[callee.object.name="describe"][callee.property.name="skip"]',
          message: 'Skipped tests with describe.skip() are not allowed'
        }
      ]
    }
  }
];
