import request from 'supertest';
import app from '../../server';

describe('Stripe Content Security Policy', () => {
  it('allows Stripe Checkout and Stripe.js in CSP directives', async () => {
    const response = await request(app).get('/health');
    const cspHeader = response.headers['content-security-policy'];

    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain('script-src');
    expect(cspHeader).toContain('https://js.stripe.com');
    expect(cspHeader).toContain('frame-src');
    expect(cspHeader).toContain('https://checkout.stripe.com');
    expect(cspHeader).toContain('connect-src');
    expect(cspHeader).toContain('https://api.stripe.com');
    expect(cspHeader).toContain('img-src');
    expect(cspHeader).toContain('https://*.stripe.com');
  });
});
