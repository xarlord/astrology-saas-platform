/**
 * Authentication Step Definitions
 *
 * @description Step definitions for authentication flows
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../hooks/world';
import { testDatabase } from '../support/database';
import { faker } from '@faker-js/faker';

// Background - User State
Given('I am a new user', async function (this: ICustomWorld) {
  this.testData.user = {
    email: faker.internet.email(),
    password: 'TestPassword123!',
    name: faker.person.fullName(),
  };
});

Given('I am an existing user', async function (this: ICustomWorld) {
  const user = await testDatabase.createTestUser({
    email: `existing-${Date.now()}@example.com`,
    password: 'ExistingPassword123!',
    name: 'Existing Test User',
  });

  this.testUser = user;
  this.testData.user = user;
});

Given('I am a premium user', async function (this: ICustomWorld) {
  const user = await testDatabase.createTestUser({
    email: `premium-${Date.now()}@example.com`,
    password: 'PremiumPassword123!',
    name: 'Premium Test User',
    role: 'premium',
  });

  await testDatabase.createTestSubscription({
    userId: user.id,
    plan: 'premium',
    status: 'active',
  });

  this.testUser = user;
  this.testData.user = user;
});

Given('I am an admin user', async function (this: ICustomWorld) {
  const user = await testDatabase.createTestUser({
    email: `admin-${Date.now()}@example.com`,
    password: 'AdminPassword123!',
    name: 'Admin Test User',
    role: 'admin',
  });

  this.testUser = user;
  this.testData.user = user;
});

Given('I am not logged in', async function (this: ICustomWorld) {
  // Ensure no auth cookies
  await this.page?.context().clearCookies();
  await this.page?.context().clearPermissions();
});

Given('I am logged in', async function (this: ICustomWorld) {
  if (!this.testUser?.token) {
    const user = await testDatabase.createTestUser({
      email: `logged-in-${Date.now()}@example.com`,
      password: 'LoggedInPassword123!',
      name: 'Logged In User',
    });

    this.testUser = user;

    await this.page?.context().addCookies([
      {
        name: 'authToken',
        value: user.token,
        domain: 'localhost',
        path: '/',
      },
    ]);
  }

  await this.page?.goto('/dashboard');
});

// Registration Steps
When('I register with the following details:', async function (this: ICustomWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();

  await this.page?.goto('/register');
  await this.page?.waitForLoadState('networkidle');

  if (data.name) {
    await this.page?.getByLabel(/name/i).first().fill(data.name);
  }
  if (data.email) {
    await this.page?.getByLabel(/email/i).first().fill(data.email);
  }
  if (data.password) {
    await this.page?.getByLabel(/^password$/i).first().fill(data.password);
  }
  if (data['confirm password']) {
    await this.page?.getByLabel(/confirm password/i).first().fill(data['confirm password']);
  }
  if (data['terms of service'] === 'accepted') {
    await this.page?.getByLabel(/terms|accept/i).click();
  }
});

When('I submit the registration form', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /register|sign up|create account/i }).click();
});

Then('my account should be created', async function (this: ICustomWorld) {
  await expect(this.page!).toHaveURL(/.*dashboard.*/);
});

Then('I should be logged in automatically', async function (this: ICustomWorld) {
  const logoutButton = this.page?.getByRole('button', { name: /logout/i });
  await expect(logoutButton).toBeVisible();
});

Then('I should see a welcome message', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/welcome|account created|registration successful/i)).toBeVisible();
});

// Login Steps
When('I enter my email {string}', async function (this: ICustomWorld, email: string) {
  await this.page?.getByLabel(/email/i).first().fill(email);
});

When('I enter my password {string}', async function (this: ICustomWorld, password: string) {
  await this.page?.getByLabel(/^password$/i).first().fill(password);
});

When('I submit the login form', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /login|sign in/i }).click();
});

When('I login with valid credentials', async function (this: ICustomWorld) {
  const user = this.testData.user as { email: string; password: string };

  await this.page?.goto('/login');
  await this.page?.getByLabel(/email/i).first().fill(user.email);
  await this.page?.getByLabel(/^password$/i).first().fill(user.password);
  await this.page?.getByRole('button', { name: /login|sign in/i }).click();
});

When('I login with invalid credentials', async function (this: ICustomWorld) {
  await this.page?.goto('/login');
  await this.page?.getByLabel(/email/i).first().fill('invalid@example.com');
  await this.page?.getByLabel(/^password$/i).first().fill('InvalidPassword123!');
  await this.page?.getByRole('button', { name: /login|sign in/i }).click();
});

Then('I should see an error message {string}', async function (this: ICustomWorld, message: string) {
  await expect(this.page!.getByText(new RegExp(message, 'i'))).toBeVisible();
});

Then('I should remain on the login page', async function (this: ICustomWorld) {
  await expect(this.page!).toHaveURL(/.*login.*/);
});

// Logout Steps
When('I logout', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /logout/i }).click();
});

Then('I should be logged out', async function (this: ICustomWorld) {
  await expect(this.page!).not.toHaveURL(/.*dashboard.*/);
  const loginButton = this.page?.getByRole('button', { name: /login|sign in/i });
  await expect(loginButton).toBeVisible();
});

// Password Reset Steps
When('I request a password reset for email {string}', async function (this: ICustomWorld, email: string) {
  await this.page?.goto('/forgot-password');
  await this.page?.getByLabel(/email/i).first().fill(email);
  await this.page?.getByRole('button', { name: /reset|send/i }).click();
});

Then('I should receive a password reset email', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/email sent|check your email|reset link/i)).toBeVisible();
});

// Social Authentication Steps
When('I click {string} login', async function (this: ICustomWorld, provider: string) {
  await this.page?.getByRole('button', { name: new RegExp(provider, 'i') }).click();
});

Then('I should be redirected to {string}', async function (this: ICustomWorld, provider: string) {
  // Wait for OAuth redirect
  await this.page?.waitForURL(new RegExp(provider, 'i'));
});

// Session Steps
When('I refresh the page', async function (this: ICustomWorld) {
  await this.page?.reload();
});

Then('I should still be logged in', async function (this: ICustomWorld) {
  const logoutButton = this.page?.getByRole('button', { name: /logout/i });
  await expect(logoutButton).toBeVisible();
});

When('I open a new tab', async function (this: ICustomWorld) {
  const newPage = await this.page?.context().browserContext.newPage();
  this.testData.newPage = newPage;
});

Then('I should be logged in in the new tab', async function (this: ICustomWorld) {
  const newPage = this.testData.newPage;
  await newPage?.goto('/dashboard');
  const logoutButton = newPage?.getByRole('button', { name: /logout/i });
  await expect(logoutButton).toBeVisible();
});
