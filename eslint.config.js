module.exports = [
  {
    files: ['**/*.{ts,tsx}'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {}
  }
];
