declare module 'jspdf' {
  interface JsPDFOptions {
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
    format?: string | number[];
    compress?: boolean;
    precision?: number;
    filters?: string[];
    userUnit?: number;
    encryption?: unknown;
    putOnlyUsedFonts?: boolean;
    hotfixes?: string[];
    floatPrecision?: number | 'smart';
  }

  class jsPDF {
    constructor(options?: JsPDFOptions);
    addPage(format?: string | number[], orientation?: string): jsPDF;
    addImage(imageData: string, format: string, x: number, y: number, w: number, h: number, alias?: string, compression?: unknown, rotation?: number): jsPDF;
    addFont(postScriptName: string, id: string, fontStyle: string, fontWeight?: string, encoding?: string): jsPDF;
    addFileToVFS(filename: string, filecontent: string): jsPDF;
    setFont(fontName: string, fontStyle?: string, fontWeight?: string): jsPDF;
    setFontSize(size: number): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    setDrawColor(r: number, g: number, b: number): jsPDF;
    setFillColor(r: number, g: number, b: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    text(text: string | string[], x: number, y: number, options?: unknown): jsPDF;
    rect(x: number, y: number, w: number, h: number, style?: string): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    circle(x: number, y: number, r: number, style?: string): jsPDF;
    getPageWidth(): number;
    getPageHeight(): number;
    getNumberOfPages(): number;
    getPageNumber(): number;
    setPage(pageNumber: number): jsPDF;
    save(filename?: string): jsPDF;
    setProperties(properties: { title?: string; subject?: string; author?: string; keywords?: string; creator?: string }): jsPDF;
    output(type: 'blob'): Blob;
    output(type: 'datauristring'): string;
    output(type: 'arraybuffer'): ArrayBuffer;
    internal: {
      pageSize: { width: number; height: number; getWidth: () => number; getHeight: () => number };
      scaleFactor: number;
    };
    html(src: HTMLElement | string, options?: unknown): Promise<jsPDF>;
    splitTextToSize(text: string, maxWidth: number): string[];
    getTextWidth(text: string): number;
    getFontList(): Record<string, string[]>;
  }

  export default jsPDF;
  export { jsPDF };
}
