/**
 * Cucumber Configuration
 *
 * @description Configuration for running BDD tests with Cucumber CLI
 * Run with: npx cucumber-js
 *
 * Note: The primary BDD test runner is Playwright (see playwright.bdd.config.ts).
 * This config enables running Cucumber .feature files directly with step definitions.
 */

export default {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],
    import: [
      'tests/bdd/steps/**/*.ts',
      'tests/bdd/hooks/**/*.ts',
    ],
    require: [],
    requireModule: ['tsx/cjs'],
    format: [
      'progress',
      'html:reports/bdd/cucumber-report.html',
      'json:reports/bdd/cucumber-report.json',
    ],
    formatOptions: {
      snippetSyntax: undefined,
    },
    publishQuiet: true,
    parameters: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    },
  },
};
