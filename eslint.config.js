export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'jest.config.js']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
];
