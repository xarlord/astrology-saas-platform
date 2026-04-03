/**
 * Billing Service
 *
 * Handles Stripe checkout sessions, customer portal, and subscription management.
 * Backend endpoints are expected at /api/v1/billing/*.
 */

import api from './api';

export interface CheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'expired' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface PlanDetail {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'none';
  features: string[];
  maxCharts: number;
  highlighted?: boolean;
  priceId?: string;
}

class BillingService {
  private readonly BASE = '/v1/billing';
  private readonly TIMEOUT = 15000;

  /**
   * Create a Stripe Checkout session and redirect the user.
   */
  async createCheckoutSession(data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const response = await api.post<{ data: CheckoutSessionResponse }>(
      `${this.BASE}/checkout`,
      data,
      { timeout: this.TIMEOUT },
    );
    return response.data.data;
  }

  /**
   * Create a Stripe Customer Portal session for plan management.
   */
  async createPortalSession(returnUrl?: string): Promise<PortalSessionResponse> {
    const response = await api.post<{ data: PortalSessionResponse }>(
      `${this.BASE}/portal`,
      { returnUrl },
      { timeout: this.TIMEOUT },
    );
    return response.data.data;
  }

  /**
   * Get current subscription info for the authenticated user.
   */
  async getSubscription(): Promise<SubscriptionInfo> {
    const response = await api.get<{ data: SubscriptionInfo }>(
      `${this.BASE}/subscription`,
      { timeout: this.TIMEOUT },
    );
    return response.data.data;
  }

  /**
   * Get available plans with pricing.
   */
  async getPlans(): Promise<PlanDetail[]> {
    const response = await api.get<{ data: PlanDetail[] }>(
      `${this.BASE}/plans`,
      { timeout: this.TIMEOUT },
    );
    return response.data.data;
  }
}

export const billingService = new BillingService();
export default billingService;
