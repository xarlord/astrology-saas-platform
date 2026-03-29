/**
 * Cucumber.js Configuration for BDD Testing
 *
 * @description Configuration for Gherkin-based BDD tests
 * Run with: npx cucumber-js
 */

module.exports = {
  default: {
    require: [
      'tests/bdd/steps/**/*.ts',
      'tests/bdd/hooks/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    paths: ['tests/bdd/features/**/*.feature'],
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter:reports/bdd/cucumber-report.html',
      'json:reports/bdd/cucumber-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    parallel: 4,
    retry: 2,
    retryTagFilter: '@flaky',
    tags: 'not @ignore',
    worldParameters: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
    },
  },
};
