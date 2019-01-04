module.exports = {
  "env": {
    "node": true
  },
  "extends": [
    'eslint:all'
  ],
  "parser": "babel-eslint",
  "plugins": [
  ],
  "rules": {
    // enable additional rules
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", 'single'],
    "semi": ["error", "always"],

    // override default options
    "arrow-parens": ["error", "as-needed"],
    "comma-dangle": ["error", "never"],
    "dot-location": ["error", "property"],
    "indent": ["error", 2],
    "max-len": ["error", 100],
    "max-lines-per-function": ["error", 100],
    "max-statements": ["error", 20],
    "no-cond-assign": ["error", "always"],
    "no-magic-numbers": ["error", { "ignore": [0, 1] }],
    "object-curly-spacing": ["error", "always"],
    "one-var": ["error", "never"],
    "padded-blocks": ["error", "never"],

    // disable from base
    "arrow-body-style": "off",
    "callback-return": "off",
    "func-style": "off",
    "newline-per-chained-call": "off",
    "no-console": "off",
    "no-invalid-this": "off",
    "no-plusplus": "off",
    "object-property-newline": "off",
    "quote-props": "off",
    "require-jsdoc": "off",
    "sort-imports": "off",
    "sort-keys": "off",
    "space-before-function-paren": "off"
  }
};
