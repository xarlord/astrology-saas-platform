declare module 'puppeteer' {
  export interface PDFOptions {
    format?: string;
    landscape?: boolean;
    printBackground?: boolean;
    margin?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    path?: string;
    timeout?: number;
  }

  export interface Page {
    setContent(html: string, options?: { waitUntil?: string; timeout?: number }): Promise<void>;
    pdf(options?: PDFOptions): Promise<Buffer>;
    close(): Promise<void>;
  }

  export class Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
    isConnected(): boolean;
  }

  export interface LaunchOptions {
    headless?: boolean | 'new';
    args?: string[];
    executablePath?: string;
  }

  function launch(options?: LaunchOptions): Promise<Browser>;

  export { launch };
}

declare module 'puppeteer' {
  export default { launch };
}
