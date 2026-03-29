#!/usr/bin/env node

/**
 * Production Smoke Tests
 * Verifies critical endpoints after deployment
 */

const https = require('https');

const API_BASE_URL = process.env.API_BASE_URL || 'https://your-backend.up.railway.app';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${API_BASE_URL}/health`);
    if (response.status === 200 && response.data.status === 'healthy') {
      log('✅ Health check passed', 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Uptime: ${Math.floor(response.data.uptime)}s`, 'green');
      return true;
    } else {
      log('❌ Health check failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Health check failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseHealth() {
  log('\n💾 Testing Database Connection...', 'blue');
  try {
    const response = await makeRequest(`${API_BASE_URL}/health/db`);
    if (response.status === 200 && response.data.status === 'healthy') {
      log('✅ Database connection healthy', 'green');
      log(`   Status: ${response.data.database}`, 'green');
      log(`   Latency: ${response.data.latency}ms`, 'green');
      return true;
    } else {
      log('❌ Database health check failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Database health check failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testUserRegistration() {
  log('\n👤 Testing User Registration...', 'blue');
  const timestamp = Date.now();
  const testUser = {
    email: `smoke-test-${timestamp}@example.com`,
    password: 'TestPass123!',
    name: 'Smoke Test User'
  };

  try {
    const response = await makeRequest(
      `${API_BASE_URL}/api/auth/register`,
      'POST',
      testUser
    );

    if (response.status === 201 && response.data.success) {
      log('✅ User registration successful', 'green');
      log(`   User ID: ${response.data.data.user.id}`, 'green');
      log(`   Email: ${response.data.data.user.email}`, 'green');
      return { success: true, token: response.data.data.token };
    } else {
      log('❌ User registration failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ User registration failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testUserLogin(email, password) {
  log('\n🔐 Testing User Login...', 'blue');
  try {
    const response = await makeRequest(
      `${API_BASE_URL}/api/auth/login`,
      'POST',
      { email, password }
    );

    if (response.status === 200 && response.data.success) {
      log('✅ User login successful', 'green');
      log(`   Token received: ${response.data.data.token.substring(0, 20)}...`, 'green');
      return { success: true, token: response.data.data.token };
    } else {
      log('❌ User login failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ User login failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

async function testChartCreation(token) {
  log('\n🌙 Testing Chart Creation...', 'blue');
  const chartData = {
    name: 'Smoke Test Chart',
    birth_date: '1990-01-15',
    birth_time: '14:30',
    birth_place: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  };

  try {
    const response = await makeRequest(
      `${API_BASE_URL}/api/charts`,
      'POST',
      chartData
    );

    if (response.status === 201 && response.data.success) {
      log('✅ Chart creation successful', 'green');
      log(`   Chart ID: ${response.data.data.chart.id}`, 'green');
      log(`   Name: ${response.data.data.chart.name}`, 'green');
      return true;
    } else {
      log('❌ Chart creation failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Chart creation failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testGetCharts(token) {
  log('\n📋 Testing Get Charts...', 'blue');
  try {
    const url = new URL(`${API_BASE_URL}/api/charts`);
    const response = await makeRequest(url.toString());

    if (response.status === 200 && response.data.success) {
      log('✅ Get charts successful', 'green');
      log(`   Charts count: ${response.data.data.charts.length}`, 'green');
      return true;
    } else {
      log('❌ Get charts failed', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Get charts failed with error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function runSmokeTests() {
  log('\n========================================', 'blue');
  log('  PRODUCTION SMOKE TESTS', 'blue');
  log('========================================', 'blue');
  log(`\n🎯 Testing API: ${API_BASE_URL}\n`, 'yellow');

  const results = {
    healthCheck: false,
    databaseHealth: false,
    userRegistration: false,
    userLogin: false,
    chartCreation: false,
    getCharts: false
  };

  let authToken = null;
  let testEmail = null;

  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();

  // Test 2: Database Health
  results.databaseHealth = await testDatabaseHealth();

  // Test 3: User Registration
  const regResult = await testUserRegistration();
  results.userRegistration = regResult.success;
  if (regResult.success) {
    authToken = regResult.token;
    testEmail = `smoke-test-${Date.now()}@example.com`;
  }

  // Test 4: User Login (use registration test credentials)
  if (results.userRegistration) {
    const loginResult = await testUserLogin(
      `smoke-test-${Date.now()}@example.com`,
      'TestPass123!'
    );
    results.userLogin = loginResult.success;
    if (loginResult.success) {
      authToken = loginResult.token;
    }
  }

  // Test 5: Chart Creation
  if (authToken) {
    results.chartCreation = await testChartCreation(authToken);
  }

  // Test 6: Get Charts
  if (authToken) {
    results.getCharts = await testGetCharts(authToken);
  }

  // Summary
  log('\n========================================', 'blue');
  log('  TEST SUMMARY', 'blue');
  log('========================================', 'blue');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${test}`, color);
  });

  log('\n========================================', 'blue');
  log(`Total: ${passedTests}/${totalTests} tests passed`, 'blue');
  log('========================================\n', 'blue');

  if (passedTests === totalTests) {
    log('🎉 ALL TESTS PASSED! Production is ready!', 'green');
    process.exit(0);
  } else {
    log('⚠️  SOME TESTS FAILED! Please check the errors above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
runSmokeTests().catch(error => {
  log('\n💥 Fatal error running smoke tests:', 'red');
  log(`   ${error.message}`, 'red');
  process.exit(1);
});
