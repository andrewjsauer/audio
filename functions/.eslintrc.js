module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: ['/lib/**/*'],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  rules: {
    'import/no-unresolved': 0,
    'prettier/prettier': 'error',
    'require-jsdoc': 0,
  },
};
