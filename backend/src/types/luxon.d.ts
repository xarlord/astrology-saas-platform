declare module 'luxon' {
  export class IANAZone {
    readonly name: string;
    readonly isValid: boolean;
    constructor(name: string);
    offset(ts: number): number;
  }

  export class DateTime {
    readonly zone: IANAZone;
    readonly zoneName: string;
    readonly isValid: boolean;
    readonly invalidExplanation: string | null;
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly offset: number;
    readonly offsetNameShort: string;
    readonly offsetNameLong: string;

    static now(): DateTime;
    static fromISO(input: string, options?: { zone?: string }): DateTime;
    static fromJSDate(date: Date, options?: { zone?: string }): DateTime;
    static fromObject(obj: Record<string, number>, options?: { zone?: string }): DateTime;
    static local(year?: number, month?: number, day?: number, hour?: number, minute?: number): DateTime;
    static utc(year?: number, month?: number, day?: number, hour?: number, minute?: number): DateTime;

    setZone(zone: string): DateTime;
    set(values: Record<string, number>): DateTime;
    toISO(): string;
    toISODate(): string;
    toISOTime(): string;
    toJSDate(): Date;
    toFormat(fmt: string): string;
    toUTC(): DateTime;
  }
}
