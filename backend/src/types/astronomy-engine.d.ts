declare module 'astronomy-engine' {
  export enum Body {
    Sun = 'Sun',
    Moon = 'Moon',
    Mercury = 'Mercury',
    Venus = 'Venus',
    Mars = 'Mars',
    Jupiter = 'Jupiter',
    Saturn = 'Saturn',
    Uranus = 'Uranus',
    Neptune = 'Neptune',
    Pluto = 'Pluto',
  }

  export class AstroTime {
    ut: number;
    constructor(date: Date);
    constructor(ut: number);
  }

  export class Observer {
    latitude: number;
    longitude: number;
    height: number;
    constructor(latitude: number, longitude: number, height: number);
  }

  export interface Vector {
    x: number;
    y: number;
    z: number;
    t: AstroTime;
    Length(): number;
  }

  export interface EclipticCoordinates {
    elon: number;
    elat: number;
    vec: Vector;
  }

  export function MakeTime(date: Date): AstroTime;
  export function GeoVector(body: Body, time: AstroTime, aberration: boolean): Vector;
  export function Ecliptic(eqj: Vector): EclipticCoordinates;
  export function SiderealTime(time: AstroTime): number;
}
