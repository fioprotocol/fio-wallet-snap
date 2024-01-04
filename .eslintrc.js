module.exports = {
  root: true,

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },

  camelcase: 'off',

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.js', 'snap.config.ts'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.ts', '*.tsx'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: ['variable', 'parameter'],
            format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
          },
        ],
      },
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],

  ignorePatterns: [
    '!.prettierrc.js',
    '!.eslintrc.js',
    'dist*/',
    '*__GENERATED__*',
    'build',
    'public',
    '.cache',
  ],
};
