/**
 * Vite PWA Plugin Type Declarations
 * Provides TypeScript support for Workbox manifest injection
 */

// ImportMeta environment types
interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
