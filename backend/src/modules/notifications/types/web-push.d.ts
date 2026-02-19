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

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function generateVAPIDKeys(): VapidKeys;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: any
  ): Promise<any>;

  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string | Buffer,
    options?: any
  ): { ciphertext: Buffer; salt: Buffer; serverPublicKey: Buffer };
}
