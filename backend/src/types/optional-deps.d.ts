/**
 * Type declarations for optional dependencies that may not be installed.
 * These packages are feature-gated and only required when their features are enabled.
 */

declare module 'swagger-jsdoc' {
  namespace swaggerJsdoc {
    interface Options {
      definition: Record<string, unknown>;
      apis: string[];
    }
  }
  function swaggerJsdoc(options: swaggerJsdoc.Options): object;
  export = swaggerJsdoc;
}

declare module 'replicate' {
  interface ReplicateConfig {
    auth?: string;
  }
  class Replicate {
    constructor(config?: ReplicateConfig);
    run(model: string, options: Record<string, unknown>): Promise<unknown>;
  }
  export = Replicate;
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
      status: string;
    }
  }
  class Stripe {
    constructor(secretKey: string, options?: Record<string, unknown>);
    charges: {
      create(params: Stripe.ChargeCreateParams): Promise<Stripe.Charge>;
    };
  }
  export = Stripe;
  export default Stripe;
}

declare module 'bullmq' {
  interface ConnectionOptions {
    host?: string;
    port?: number;
    [key: string]: unknown;
  }
  interface QueueBaseOptions {
    connection?: ConnectionOptions;
  }
  interface QueueOptions extends QueueBaseOptions {
    defaultJobOptions?: JobOptions;
    limiter?: {
      max: number;
      duration: number;
    };
  }
  interface QueueEventsOptions extends QueueBaseOptions {}
  interface WorkerOptions extends QueueBaseOptions {
    concurrency?: number;
    limiter?: {
      max: number;
      duration: number;
    };
  }
  interface RepeatOptions {
    pattern?: string;
    every?: number;
    tz?: string;
    startDate?: Date | string | number;
    endDate?: Date | string | number;
  }
  interface JobOptions {
    attempts?: number;
    backoff?: number | { type: string; delay: number };
    delay?: number;
    jobId?: string;
    repeat?: RepeatOptions;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Job<T = any> {
    id: string | undefined;
    data: T;
    progress(progress: number): Promise<void>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Queue<T = any> {
    constructor(name: string, opts?: QueueOptions);
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>>;
    close(): Promise<void>;
    getWaitingCount(): Promise<number>;
    getActiveCount(): Promise<number>;
    getCompletedCount(): Promise<number>;
    getFailedCount(): Promise<number>;
    getDelayedCount(): Promise<number>;
    getRepeatableJobs(): Promise<Array<{ key: string; [k: string]: unknown }>>;
    removeRepeatableByKey(key: string): Promise<void>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Worker<T = any> {
    constructor(name: string, processor: (job: Job<T>) => Promise<unknown>, opts?: WorkerOptions);
    close(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (...args: any[]) => void): this;
  }
  class QueueEvents {
    constructor(name: string, opts?: QueueEventsOptions);
    close(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (...args: any[]) => void): this;
  }
}

declare module 'ioredis' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Redis {
    constructor(url?: string, options?: Record<string, unknown>);
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    ping(): Promise<string>;
    quit(): Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (...args: any[]) => void): this;
    duplicate(): Redis;
    subscribe(...channels: string[]): Promise<number>;
    publish(channel: string, message: string): Promise<number>;
  }
  export = Redis;
}

declare module 'resend' {
  interface SendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }
  interface SendEmailResponse {
    id: string;
  }
  class Resend {
    constructor(apiKey: string);
    emails: {
      send(options: SendEmailOptions): Promise<SendEmailResponse>;
    };
  }
  export = Resend;
}
