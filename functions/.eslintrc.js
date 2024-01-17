module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
  },
  extends: [
    '@react-native', // specific to your app
    'airbnb', // specific to your app
    'airbnb/hooks', // specific to your app
    'eslint:recommended', // from Google Cloud Functions
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google', // from Google Cloud Functions
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier', // added for consistency with both configs
  ],
  parserOptions: {
    tsconfigRootDir: __dirname, // from Google Cloud Functions
    sourceType: 'module', // from Google Cloud Functions
  },
  ignorePatterns: ['/lib/**/*'], // from Google Cloud Functions
  plugins: [
    'react', // specific to your app
    'react-hooks', // specific to your app
    'jsx-a11y', // specific to your app
    'prettier',
    '@typescript-eslint',
    'jest', // specific to your app
    'import', // from Google Cloud Functions
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/require-default-props': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['state'],
      },
    ],
    'global-require': 'off',
    'import/no-import-module-exports': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.ts'] }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'require-jsdoc': 0, // from Google Cloud Functions
    // other rules from your app's config
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
