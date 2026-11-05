module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `void promise()` is how this codebase marks deliberate fire-and-forget calls.
    'no-void': ['warn', { allowAsStatement: true }],
    // A leading underscore means "intentionally unused" (rest-siblings, ignored args).
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
  },
  overrides: [
    // Jest globals in test setup and test files.
    { files: ['jest.setup.js', '__tests__/**', 'test/**'], env: { jest: true } },
  ],
};
