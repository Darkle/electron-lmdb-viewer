module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: true,
      impliedStrict: true,
      modules: true,
    },
  },
  globals: {
    api: 'readonly',
    gridjs: 'readonly',
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'array-callback-return': 'error',
    camelcase: 'off',
    'capitalized-comments': ['off'],
    complexity: ['error', 4],
    'consistent-return': 'off',
    'comma-dangle': 'off',
    'dot-notation': 'off',
    'eol-last': 'off',
    eqeqeq: 'error',
    'function-paren-newline': 'off',
    'generator-star-spacing': 'off',
    'guard-for-in': 'error',
    'global-require': 'off',
    'implicit-arrow-linebreak': 'off',
    indent: 'off',
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', { max: 22, skipComments: true }],
    'max-len': 'off',
    'max-params': ['error', 4],
    'max-statements-per-line': ['error', { max: 1 }],
    'new-cap': 'off',
    'newline-per-chained-call': 'off',
    'no-await-in-loop': 'error',
    'no-console': 'off',
    'no-confusing-arrow': 'off',
    'no-else-return': 'error',
    'no-duplicate-imports': 'off',
    'no-eq-null': 'error',
    'no-magic-numbers': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'error',
    'no-return-await': 'error',
    'no-return-assign': ['error', 'except-parens'],
    'no-shadow': 'off',
    'no-undef-init': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    'no-useless-return': 'error',
    'object-curly-spacing': 'off',
    'object-curly-newline': 'off',
    'operator-assignment': ['error', 'never'],
    'operator-linebreak': 'off',
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    radix: 'error',
    'require-atomic-updates': 'error',
    'require-unicode-regexp': 'error',
    'require-await': 'off',
    semi: 'off',
    'spaced-comment': 'off',
    'space-infix-ops': 'off',
  },
}
