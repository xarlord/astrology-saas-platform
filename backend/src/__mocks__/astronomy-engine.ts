/**
 * Mock for astronomy-engine npm module
 *
 * Jest automatically picks up this file from <rootDir>/src/__mocks__/
 * when a source file does `import * as astronomy from 'astronomy-engine'`.
 *
 * The mock provides time-varying planetary positions so that tests for
 * retrograde detection, date-based position changes, and sidereal time
 * advancement all pass without the real astronomy-engine npm package.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Lightweight stand-in for astronomy.Observer
 */
class Observer {
  constructor(
    public latitude: number,
    public longitude: number,
    public height: number,
  ) {}
}

/**
 * Lightweight stand-in for astronomy.AstroTime
 */
class AstroTime {
  public tt: number;
  constructor(public ut: number) {
    // tt ≈ ut + ΔT (simplified; ~69s offset is fine for mock purposes)
    this.tt = ut + 69.2 / 86400;
  }
}

/**
 * Body enum values – strings are fine for the mock;
 * the real library uses numeric constants internally.
 */
const Body: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto',
};

/** Base ecliptic longitudes (degrees) at J2000.0 epoch per body */
const BASE_LONGITUDES: Record<string, number> = {
  Sun: 280.5,
  Moon: 135.2,
  Mercury: 252.25,
  Venus: 181.98,
  Mars: 355.45,
  Jupiter: 34.4,
  Saturn: 58.87,
  Uranus: 313.23,
  Neptune: 304.88,
  Pluto: 238.93,
};

/** Mean daily motion (degrees/day) per body — used to simulate time-varying positions */
const DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.1764,
  Mercury: 4.0923,    // mean; actual varies widely during retrograde cycles
  Venus: 1.6021,
  Mars: 0.5240,
  Jupiter: 0.0831,
  Saturn: 0.0335,
  Uranus: 0.0117,
  Neptune: 0.0060,
  Pluto: 0.0040,
};

/** Mercury has retrograde periods. We approximate by detecting when the
 *  simulated longitude crosses certain thresholds relative to the Sun.
 *  For the mock, we use a simplified sinusoidal speed variation that
 *  produces retrograde around the dates the tests expect.
 */
function getMercuryLongitude(daysSinceJ2000: number): number {
  // Mercury's synodic period is ~115.88 days
  const synodicPeriod = 115.88;
  // Use a sinusoidal speed modulation: mean speed ± amplitude
  // When speed goes negative, Mercury appears retrograde
  const meanSpeed = 4.0923; // deg/day
  const amplitude = 5.5;    // enough to push speed negative

  // Phase offset chosen so retrograde occurs around April 15, 2024
  // J2000.0 to April 15, 2024 ≈ 8871 days
  // We want speed < 0 around that time.
  // Speed = meanSpeed + amplitude * sin(omega * days + phase)
  // Setting the angle to 3π/2 at the target date gives sin = -1, speed = -1.4°/day
  const targetUt = 8871;
  const omega = 2 * Math.PI / synodicPeriod;
  const modAngle = (omega * targetUt) % (2 * Math.PI);
  const phase = (3 * Math.PI / 2) - modAngle;

  // Compute longitude by integrating speed over time
  const base = 252.25;
  const longitude = base
    + meanSpeed * daysSinceJ2000
    + (amplitude / omega) * (-Math.cos(omega * daysSinceJ2000 + phase) + Math.cos(phase));

  return ((longitude % 360) + 360) % 360;
}

function MakeTime(dateOrNumber: Date | number): AstroTime {
  if (dateOrNumber instanceof Date) {
    // Convert to approximate Julian centuries from J2000
    const ut = (dateOrNumber.getTime() / 86400000) + 2440587.5 - 2451545.0;
    return new AstroTime(ut);
  }
  return new AstroTime(dateOrNumber);
}

function GeoVector(body: string, time: AstroTime, _aberration: boolean) {
  const daysSinceJ2000 = time.ut;
  let lon: number;

  if (body === 'Mercury') {
    lon = getMercuryLongitude(daysSinceJ2000);
  } else {
    const base = BASE_LONGITUDES[body] ?? 0;
    const motion = DAILY_MOTION[body] ?? 0;
    lon = base + motion * daysSinceJ2000;
    lon = ((lon % 360) + 360) % 360;
  }

  const rad = ((lon - 180) * Math.PI) / 180;
  return {
    x: Math.cos(rad),
    y: Math.sin(rad),
    z: 0,
    Length() { return 1; },
  };
}

function Ecliptic(vector: { x: number; y: number }) {
  let lon = (Math.atan2(vector.y, vector.x) * 180) / Math.PI + 180;
  lon = ((lon % 360) + 360) % 360;
  return { elon: lon, elat: 0 };
}

/**
 * Sidereal time that varies with the input time.
 * GST advances ~360° per sidereal day (~23h 56m).
 * At J2000.0 (ut=0), GST ≈ 100.46° (approximate real value).
 * Advance rate: ~360.9856° per UT day.
 */
function SiderealTime(time: AstroTime): number {
  const gstBase = 100.46;
  const advancePerDay = 360.9856;
  const gst = gstBase + advancePerDay * time.ut;
  return ((gst % 360) + 360) % 360;
}

const astronomy = {
  Body,
  Observer,
  AstroTime,
  MakeTime,
  GeoVector,
  Ecliptic,
  SiderealTime,
};

export default astronomy;
export {
  astronomy,
  Body,
  Observer,
  AstroTime,
  MakeTime,
  GeoVector,
  Ecliptic,
  SiderealTime,
};
