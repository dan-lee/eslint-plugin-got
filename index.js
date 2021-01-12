const noLeadingSlashRule = require('./rules/no-leading-slash')

module.exports = {
  rules: {
    'no-leading-slash': noLeadingSlashRule,
  },
  configs: {
    recommended: {
      plugins: ['got'],
      rules: {
        'got/no-leading-slash': 'error',
      },
    },
  },
}
