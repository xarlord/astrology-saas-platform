/**
 * Cucumber World Setup
 *
 * @description Custom world with Playwright integration
 */

import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, APIRequestContext } from 'playwright';

interface CustomWorldOptions extends IWorldOptions {
  parameters: {
    baseUrl: string;
    apiBaseUrl: string;
  };
}

export interface ICustomWorld extends World {
  page?: Page;
  context?: BrowserContext;
  browser?: Browser;
  request?: APIRequestContext;
  baseUrl: string;
  apiBaseUrl: string;
  testData: Record<string, unknown>;
  testUser: {
    email?: string;
    password?: string;
    name?: string;
    id?: string;
    token?: string;
  };
}

export class CustomWorld extends World implements ICustomWorld {
  page?: Page;
  context?: BrowserContext;
  browser?: Browser;
  request?: APIRequestContext;
  testData: Record<string, unknown> = {};
  testUser: ICustomWorld['testUser'] = {};

  constructor(options: CustomWorldOptions) {
    super(options);
    this.baseUrl = options.parameters.baseUrl;
    this.apiBaseUrl = options.parameters.apiBaseUrl;
  }
}

setWorldConstructor(CustomWorld);
