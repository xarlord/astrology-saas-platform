declare module 'web-push' {
  interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
  }

  interface PushSubscription {
    endpoint: string;
    keys: PushSubscriptionKeys;
  }

  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  interface RequestQueueLengthResult {
    statusCode: number;
    headers: Record<string, string>;
  }

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  interface EncryptOptions {
    contentEncoding?: string;
    padSize?: number;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    TTL?: number;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
    topic?: string;
  }

  interface WebPushClient {
    setVapidDetails(
      subject: string,
      publicKey: string,
      privateKey: string
    ): void;
    generateVAPIDKeys(): VapidKeys;
    sendNotification(
      subscription: PushSubscription,
      payload?: string | Buffer,
      options?: EncryptOptions
    ): Promise<SendResult>;
    encrypt(
      userPublicKey: string,
      userAuth: string,
      payload: string | Buffer,
      options?: EncryptOptions
    ): { ciphertext: Buffer; salt: Buffer; serverPublicKey: Buffer };
  }

  const webpush: WebPushClient;

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  export function generateVAPIDKeys(): VapidKeys;
  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: EncryptOptions
  ): Promise<SendResult>;
  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string | Buffer,
    options?: EncryptOptions
  ): { ciphertext: Buffer; salt: Buffer; serverPublicKey: Buffer };

  export default webpush;
}
