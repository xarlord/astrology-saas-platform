const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { createBrowser } = require('../helpers/browser');
const { createDatabase } = require('../helpers/database');
const { createServices } = require('../helpers/services');

// Global hooks
BeforeAll(async function() {
  // Initialize test environment
  this.testEnvironment = {
    browser: null,
    database: null,
    services: null,
    testData: {}
  };
});

AfterAll(async function() {
  // Cleanup test environment
  if (this.testEnvironment.browser) {
    await this.testEnvironment.browser.close();
  }
  if (this.testEnvironment.database) {
    await this.testEnvironment.database.disconnect();
  }
});

// Scenario hooks
Before(async function({ pickle }) {
  // Setup before each scenario
  this.scenarioName = pickle.name;
  this.scenarioTags = pickle.tags.map(t => t.name);

  // Initialize browser
  this.browser = await createBrowser();
  await this.browser.maximize();

  // Initialize database connection
  this.database = await createDatabase();
  await this.database.cleanTestDatabase();

  // Initialize services
  this.services = createServices(this.database);

  // Helper functions
  this.getService = function(serviceName) {
    return this.services[serviceName];
  };

  this.createNatalChart = async function(data) {
    return await this.services.natalChart.create({
      ...data,
      userId: this.currentUser?.id || 'test-user-id'
    });
  };

  this.createMultipleCharts = async function(count) {
    const charts = [];
    for (let i = 0; i < count; i++) {
      charts.push(await this.createNatalChart({
        name: `Test Chart ${i + 1}`,
        birthDate: '1990-05-15',
        birthTime: '12:00',
        birthPlace: 'New York, USA'
      }));
    }
    return charts;
  };

  this.createSolarReturn = async function(data) {
    return await this.services.solarReturn.create({
      ...data,
      natalChartId: this.myChart?.id
    });
  };

  this.createLunarReturn = async function(data) {
    return await this.services.lunarReturn.create({
      ...data,
      natalChartId: this.myChart?.id
    });
  };

  // Page objects
  this.page = null;
  this.currentPage = null;
  this.formData = {};
  this.loginData = {};
  this.chartData = {};

  // Storage for test data
  this.testData = {
    users: [],
    charts: [],
    reports: []
  };
});

After(async function({ pickle, result }) {
  // Cleanup after each scenario
  if (result.status === 'FAILED') {
    console.log(`\n❌ Scenario failed: ${pickle.name}`);
    console.log(`   Error: ${result.message}`);

    // Take screenshot on failure
    if (this.browser) {
      const screenshot = await this.browser.takeScreenshot();
      console.log(`   Screenshot saved: ${screenshot}`);
    }
  } else {
    console.log(`\n✅ Scenario passed: ${pickle.name}`);
  }

  // Cleanup browser
  if (this.browser) {
    await this.browser.clearCookies();
    await this.browser.clearLocalStorage();
  }

  // Cleanup test data from database
  if (this.database) {
    await this.database.cleanupTestData(this.testData);
  }

  // Close services
  if (this.services) {
    await this.services.cleanup();
  }
});

// Tagged hooks
Before({ tags: '@requires-auth' }, async function() {
  const user = await this.database.createTestUser({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });
  this.currentUser = user;
  this.testData.users.push(user.id);
});

Before({ tags: '@requires-chart' }, async function() {
  if (!this.currentUser) {
    const user = await this.database.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    this.currentUser = user;
    this.testData.users.push(user.id);
  }

  const chart = await this.createNatalChart({
    name: 'Test Chart',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'New York, USA'
  });
  this.myChart = chart;
  this.testData.charts.push(chart.id);
});

Before({ tags: '@slow' }, async function() {
  // Increase timeout for slow tests
  this.setTimeout(120000); // 2 minutes
});

Before({ tags: '@api-only' }, async function() {
  // Skip browser initialization for API-only tests
  this.skipBrowser = true;
});

// Parameter types
When('I wait {int} milliseconds', async function(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
});

// Shared step definitions
Given('the application is running', async function() {
  this.appUrl = process.env.TEST_APP_URL || 'http://localhost:3000';
  if (this.browser) {
    await this.browser.navigateTo(this.appUrl);
  }
});

Given('I am logged in as a registered user', async function() {
  if (!this.currentUser) {
    this.currentUser = await this.database.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    this.testData.users.push(this.currentUser.id);
  }

  if (!this.skipBrowser) {
    await this.browser.navigateTo(`${this.appUrl}/login`);
    await this.page.fillField('email', this.currentUser.email);
    await this.page.fillField('password', 'password123');
    await this.page.clickButton('Login');
  }
});
