declare module 'swagger-jsdoc' {
  function swaggerJsdoc(options: swaggerJsdoc.Options): Record<string, unknown>;
  namespace swaggerJsdoc {
    interface Options {
      definition?: Record<string, unknown>;
      apis?: string[];
    }
  }
  export = swaggerJsdoc;
}

declare module 'bullmq' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface Job<T = unknown, R = unknown, N = string> {
    id: string | undefined;
    name: string;
    data: T;
    returnvalue: R | undefined;
    attemptsMade: number;
    progress(progress: number | object): Promise<void>;
    update(data: T): Promise<void>;
    remove(): Promise<void>;
  }

  export class QueueEvents {
    constructor(name: string, opts?: Record<string, unknown>);
    on(event: string, listener: (...args: unknown[]) => void): QueueEvents;
    close(): Promise<void>;
  }

  export class Queue {
    constructor(name: string, opts?: Record<string, unknown>);
    add(name: string, data: unknown, opts?: Record<string, unknown>): Promise<Job>;
    close(): Promise<void>;
    getWaitingCount(): Promise<number>;
    getActiveCount(): Promise<number>;
    getCompletedCount(): Promise<number>;
    getFailedCount(): Promise<number>;
    getDelayedCount(): Promise<number>;
    getRepeatableJobs(): Promise<Array<{ key: string; id: string; name: string; next: number | undefined; }>>;
    removeRepeatableByKey(key: string): Promise<void>;
  }

  export class Worker {
    constructor(name: string, processor: (job: Job<unknown>) => Promise<unknown>, opts?: Record<string, unknown>);
    on(event: string, listener: (...args: unknown[]) => void): Worker;
    close(): Promise<void>;
  }

  export type Processor = (job: Job) => Promise<unknown>;
}

declare module 'stripe' {
  namespace Stripe {
    interface ChargeCreateParams {
      amount: number;
      currency: string;
      source: string;
      description?: string;
    }
    interface Charge {
      id: string;
      amount: number;
      currency: string;
      status: string;
    }
    interface Customer {
      id: string;
      email?: string;
      metadata?: Record<string, string>;
    }
    interface Subscription {
      id: string;
      customer: string;
      status: string;
    }
    interface Token {
      id: string;
    }
  }

  class Stripe {
    constructor(apiKey: string, opts?: Record<string, unknown>);
    charges: {
      create(params: Stripe.ChargeCreateParams): Promise<Stripe.Charge>;
      retrieve(id: string): Promise<Stripe.Charge>;
    };
    customers: {
      create(params: Record<string, unknown>): Promise<Stripe.Customer>;
      retrieve(id: string): Promise<Stripe.Customer>;
      update(id: string, params: Record<string, unknown>): Promise<Stripe.Customer>;
    };
    subscriptions: {
      create(params: Record<string, unknown>): Promise<Stripe.Subscription>;
      retrieve(id: string): Promise<Stripe.Subscription>;
      update(id: string, params: Record<string, unknown>): Promise<Stripe.Subscription>;
      del(id: string): Promise<Stripe.Subscription>;
    };
    tokens: {
      create(params: Record<string, unknown>): Promise<Stripe.Token>;
    };
  }

  export default Stripe;
}
