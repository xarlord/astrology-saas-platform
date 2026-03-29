const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// User Registration Steps

Given('I am on the registration page', async function() {
  // Implementation: Navigate to registration page
  this.page = await this.browser.navigateTo('/register');
  this.currentPage = 'register';
});

Given('a user with email {string} already exists', async function(email) {
  // Implementation: Create user in database
  await this.database.createUser({ email, password: 'password123' });
});

When('I enter a valid email {string}', async function(email) {
  // Implementation: Fill email field
  await this.page.fillField('email', email);
  this.formData.email = email;
});

When('I enter a valid password {string}', async function(password) {
  // Implementation: Fill password field
  await this.page.fillField('password', password);
  this.formData.password = password;
});

When('I confirm the password {string}', async function(password) {
  // Implementation: Fill confirm password field
  await this.page.fillField('confirmPassword', password);
  this.formData.confirmPassword = password;
});

When('I enter my name {string}', async function(name) {
  // Implementation: Fill name field
  await this.page.fillField('name', name);
  this.formData.name = name;
});

When('I accept the terms and conditions', async function() {
  // Implementation: Check terms checkbox
  await this.page.checkCheckbox('terms', true);
  this.formData.acceptedTerms = true;
});

When('I click the {string} button', async function(buttonText) {
  // Implementation: Click button
  this.lastAction = await this.page.clickButton(buttonText);
});

When('I enter a weak password {string}', async function(password) {
  await this.page.fillField('password', password);
  await this.page.fillField('confirmPassword', password);
  this.formData.password = password;
  this.formData.confirmPassword = password;
});

Then('I should see a success message {string}', async function(message) {
  const successMessage = await this.page.getSuccessMessage();
  assert.strictEqual(successMessage, message);
});

Then('I should see an error message {string}', async function(message) {
  const errorMessage = await this.page.getErrorMessage();
  assert.strictEqual(errorMessage, message);
});

Then('I should see the validation message {string}', async function(message) {
  const validationMessage = await this.page.getValidationMessage();
  assert.strictEqual(validationMessage, message);
});

Then('my account should be created', async function() {
  const user = await this.database.findUserByEmail(this.formData.email);
  assert.ok(user, 'User should exist in database');
  assert.strictEqual(user.email, this.formData.email);
  assert.strictEqual(user.name, this.formData.name);
});

Then('my account should not be created', async function() {
  const user = await this.database.findUserByEmail(this.formData.email);
  assert.ok(!user, 'User should not exist in database');
});

Then('I should be redirected to the dashboard', async function() {
  const currentUrl = await this.browser.getCurrentUrl();
  assert.ok(currentUrl.includes('/dashboard'), 'Should be on dashboard');
  this.currentPage = 'dashboard';
});

Then('I should remain on the registration page', async function() {
  const currentUrl = await this.browser.getCurrentUrl();
  assert.ok(currentUrl.includes('/register'), 'Should remain on registration page');
});

Then('a confirmation email should be sent', async function() {
  const emails = await this.emailService.getEmailsSentTo(this.formData.email);
  assert.ok(emails.length > 0, 'Confirmation email should be sent');
  assert.ok(emails[0].subject.includes('confirm'), 'Email should be about confirmation');
});

// Login Steps

Given('I am registered with email {string} and password {string}', async function(email, password) {
  await this.database.createUser({
    email,
    password: await this.hashPassword(password),
    name: 'Test User'
  });
  this.registeredUser = { email, password };
});

Given('I am on the login page', async function() {
  this.page = await this.browser.navigateTo('/login');
  this.currentPage = 'login';
});

When('I enter my email {string}', async function(email) {
  await this.page.fillField('email', email);
  this.loginData = { ...this.loginData, email };
});

When('I enter my password {string}', async function(password) {
  await this.page.fillField('password', password);
  this.loginData = { ...this.loginData, password };
});

When('I enter an unregistered email {string}', async function(email) {
  await this.page.fillField('email', email);
  this.loginData = { email };
});

When('I enter an incorrect password {string}', async function(password) {
  await this.page.fillField('password', password);
  this.loginData = { ...this.loginData, password };
});

Then('my session should be authenticated', async function() {
  const isAuthenticated = await this.authService.isAuthenticated();
  assert.ok(isAuthenticated, 'User should be authenticated');
});

Then('my session should not be authenticated', async function() {
  const isAuthenticated = await this.authService.isAuthenticated();
  assert.ok(!isAuthenticated, 'User should not be authenticated');
});

Then('I should remain on the login page', async function() {
  const currentUrl = await this.browser.getCurrentUrl();
  assert.ok(currentUrl.includes('/login'), 'Should remain on login page');
});

Then('I should see a welcome message {string}', async function(message) {
  const welcomeMessage = await this.page.getWelcomeMessage();
  assert.ok(welcomeMessage.includes('Welcome'), 'Should show welcome message');
});

// Logout Steps

Given('I am logged in as {string}', async function(email) {
  const user = await this.database.findUserByEmail(email);
  await this.authService.login(user);
  this.currentUser = user;
});

Given('I am on the dashboard', async function() {
  this.page = await this.browser.navigateTo('/dashboard');
  this.currentPage = 'dashboard';
});

Given('I have accessed a protected page {string}', async function(path) {
  this.protectedPage = path;
});

Then('I should be redirected to the login page', async function() {
  const currentUrl = await this.browser.getCurrentUrl();
  assert.ok(currentUrl.includes('/login'), 'Should be redirected to login');
});

Then('my session should be cleared', async function() {
  const session = await this.authService.getSession();
  assert.ok(!session, 'Session should be cleared');
});

Then('I should see a message {string}', async function(message) {
  const infoMessage = await this.page.getInfoMessage();
  assert.ok(infoMessage.includes(message) || infoMessage === message, 'Should see info message');
});

When('I try to access {string}', async function(path) {
  try {
    this.page = await this.browser.navigateTo(path);
    this.accessGranted = true;
  } catch (error) {
    this.accessGranted = false;
  }
});

Then('I should not be able to access the page', async function() {
  assert.ok(!this.accessGranted, 'Should not be able to access protected page');
});

// Remember Me Steps

When('I check the {string} checkbox', async function(checkboxLabel) {
  await this.page.checkCheckbox(checkboxLabel, true);
  this.rememberMeChecked = true;
});

Then('a remember me token should be stored', async function() {
  const token = await this.browser.getCookie('remember_me');
  assert.ok(token, 'Remember me token should be stored');
});

Then('I should remain logged in after closing the browser', async function() {
  await this.browser.close();
  await this.browser.open();
  const isAuthenticated = await this.authService.isAuthenticated();
  assert.ok(isAuthenticated, 'User should remain logged in');
});

// Session Timeout Steps

Given('the session timeout is set to {int} minutes', async function(minutes) {
  await this.authService.setSessionTimeout(minutes);
  this.sessionTimeout = minutes;
});

Given('I am inactive for {int} minutes', async function(minutes) {
  await this.browser.simulateInactivity(minutes * 60 * 1000);
});

When('I try to access any protected page', async function() {
  this.page = await this.browser.navigateTo('/dashboard');
});

Then('I should see a message {string}', async function(message) {
  const infoMessage = await this.page.getInfoMessage();
  assert.ok(infoMessage.includes(message) || infoMessage === message, 'Should see session expired message');
});

// Helper Functions

async function hashPassword(password) {
  // Implementation: Hash password using bcrypt or similar
  return `hashed_${password}`;
}
