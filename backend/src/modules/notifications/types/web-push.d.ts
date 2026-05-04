declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

  export function generateVAPIDKeys(): VapidKeys;

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  interface EncryptOptions {
    contentEncoding?: string;
    padSize?: number;
  }

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: EncryptOptions,
  ): Promise<SendResult>;

  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string | Buffer,
    options?: EncryptOptions,
  ): { ciphertext: Buffer; salt: Buffer; serverPublicKey: Buffer };
}
