module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['simple-import-sort', 'prettier', '@typescript-eslint'],
  extends: [
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  root: true,
  env: { node: true },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  },
};
