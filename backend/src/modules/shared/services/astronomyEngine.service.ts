/**
 * Astronomy Engine Service
 *
 * @requirement REQ-API-001
 * @description Real astronomical calculations using astronomy-engine library
 * @accuracy ~1 arcminute (sufficient for astrology applications)
 */

import * as astronomy from 'astronomy-engine';

export interface PlanetaryPosition {
  name: string;
  longitude: number;      // 0-360° ecliptic longitude
  latitude: number;       // -90 to 90° ecliptic latitude
  distance: number;       // AU (astronomical units)
  speed: number;          // °/day (negative = retrograde)
  sign: string;           // Zodiac sign name
  signIndex: number;      // 0-11 (Aries = 0)
  degree: number;         // Degree within sign (0-29)
  minute: number;         // Minutes within degree (0-59)
  second: number;         // Seconds within minute (0-59)
  isRetrograde: boolean;
  house?: number;         // House placement (1-12), calculated later
}

export interface LunarNodePosition {
  northNode: {
    longitude: number;
    sign: string;
    degree: number;
  };
  southNode: {
    longitude: number;
    sign: string;
    degree: number;
  };
}

export interface ChironPosition {
  longitude: number;
  sign: string;
  degree: number;
  isRetrograde: boolean;
}

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Planet symbols for display
export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Chiron: '⚷',
  NorthNode: '☊',
  SouthNode: '☋',
};

export class AstronomyEngineService {
  private static readonly PLANETS = [
    { name: 'Sun', body: astronomy.Body.Sun },
    { name: 'Moon', body: astronomy.Body.Moon },
    { name: 'Mercury', body: astronomy.Body.Mercury },
    { name: 'Venus', body: astronomy.Body.Venus },
    { name: 'Mars', body: astronomy.Body.Mars },
    { name: 'Jupiter', body: astronomy.Body.Jupiter },
    { name: 'Saturn', body: astronomy.Body.Saturn },
    { name: 'Uranus', body: astronomy.Body.Uranus },
    { name: 'Neptune', body: astronomy.Body.Neptune },
    { name: 'Pluto', body: astronomy.Body.Pluto },
  ];

  /**
   * Calculate planetary positions for a given date and location
   */
  calculatePlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number
  ): Map<string, PlanetaryPosition> {
    const positions = new Map<string, PlanetaryPosition>();
    const observer = new astronomy.Observer(latitude, longitude, 0);
    const time = astronomy.MakeTime(date);

    for (const planet of AstronomyEngineService.PLANETS) {
      const pos = this.calculatePlanetPosition(planet.name, planet.body, time, observer);
      positions.set(planet.name, pos);
    }

    return positions;
  }

  /**
   * Calculate a single planet's position
   */
  private calculatePlanetPosition(
    name: string,
    body: astronomy.Body,
    time: astronomy.AstroTime,
    _observer: astronomy.Observer
  ): PlanetaryPosition {
    // Get geocentric vector
    const geoVector = astronomy.GeoVector(body, time, true);

    // Convert to ecliptic coordinates (takes vector as single argument)
    const ecliptic = astronomy.Ecliptic(geoVector);

    // Calculate speed by comparing with position 1 day later
    const nextTime = new astronomy.AstroTime(time.ut + 1);
    const nextGeoVector = astronomy.GeoVector(body, nextTime, true);
    const nextEcliptic = astronomy.Ecliptic(nextGeoVector);

    // Calculate daily motion
    let speed = nextEcliptic.elon - ecliptic.elon;

    // Handle wrap-around at 0°/360°
    if (speed > 180) speed -= 360;
    if (speed < -180) speed += 360;
    const isRetrograde = speed < 0;
    // Calculate zodiac sign and position within sign
    const longitude = this.normalizeAngle(ecliptic.elon);
    const { sign, signIndex, degree, minute, second } = this.longitudeToSignPosition(longitude);
    return {
      name,
      longitude,
      latitude: ecliptic.elat,
      distance: geoVector.Length(),
      speed,
      sign,
      signIndex,
      degree,
      minute,
      second,
      isRetrograde,
    };
  }
  /**
   * Calculate Lunar Nodes (North Node / Rahu, South Node / Ketu)
   * Uses mean node calculation
   */
  calculateLunarNodes(date: Date): LunarNodePosition {
    const time = astronomy.MakeTime(date);
    const jd = time.ut + 2451545.0;
    const T = jd / 36525.0; // Julian centuries from J2000.0

    // Mean longitude of ascending node (Meeus formula)
    let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0;
    omega = this.normalizeAngle(omega);
    const northSignPos = this.longitudeToSignPosition(omega);
    const southLongitude = this.normalizeAngle(omega + 180);
    const southSignPos = this.longitudeToSignPosition(southLongitude);
    return {
      northNode: {
        longitude: omega,
        sign: northSignPos.sign,
        degree: northSignPos.degree,
      },
      southNode: {
        longitude: southLongitude,
        sign: southSignPos.sign,
        degree: southSignPos.degree,
      },
    };
  }
  /**
   * Calculate Chiron position
   * Chiron is a centaur object - we calculate it using orbital elements
   */
  calculateChiron(date: Date): ChironPosition {
    const time = astronomy.MakeTime(date);
    const jd = time.ut + 2451545.0;
    const T = jd / 36525.0;

    // Mean anomaly
    const M = this.normalizeAngle(224.0347 + 11.046329090 * T);

    // Eccentricity
    const e = 0.3815;

    // Solve Kepler's equation (simplified)
    let E = M;
    for (let i = 0; i < 10; i++) {
      E = M + e * (180 / Math.PI) * Math.sin(E * Math.PI / 180);
    }

    // True anomaly
    const v = 2 * Math.atan(
      Math.sqrt((1 + e) / (1 - e)) * Math.tan(E * Math.PI / 360)
    ) * 180 / Math.PI;

    // Heliocentric longitude (approximate)
    const longitude = this.normalizeAngle(v + 33.6342);

    // Calculate speed (simplified - Chiron moves very slowly)
    const prevTime = new astronomy.AstroTime(time.ut - 1);
    const prevJd = prevTime.ut + 2451545.0;
    const prevT = prevJd / 36525.0;
    const prevM = this.normalizeAngle(224.0347 + 11.046329090 * prevT);
    let prevE = prevM;
    for (let i = 0; i < 10; i++) {
      prevE = prevM + e * (180 / Math.PI) * Math.sin(prevE * Math.PI / 180);
    }
    const prevV = 2 * Math.atan(
      Math.sqrt((1 + e) / (1 - e)) * Math.tan(prevE * Math.PI / 360)
    ) * 180 / Math.PI;
    const prevLongitude = this.normalizeAngle(prevV + 33.6342);

    let speed = longitude - prevLongitude;
    if (speed > 180) speed -= 360;
    if (speed < -180) speed += 360;

    const signPos = this.longitudeToSignPosition(longitude);

    return {
      longitude,
      sign: signPos.sign,
      degree: signPos.degree,
      isRetrograde: speed < 0,
    };
  }
  /**
   * Calculate Julian Day from Date
   */
  calculateJulianDay(date: Date): number {
    const time = astronomy.MakeTime(date);
    return time.ut + 2451545.0;
  }
  /**
   * Calculate Local Sidereal Time
   */
  calculateLocalSiderealTime(date: Date, longitude: number): number {
    const time = astronomy.MakeTime(date);
    // Get Greenwich Sidereal Time in degrees
    const gst = astronomy.SiderealTime(time);
    // Local Sidereal Time = GST + observer longitude
    let lst = gst + longitude;
    lst = this.normalizeAngle(lst);
    return lst; // Return in degrees
  }
  /**
   * Convert longitude to sign, degree, minute, second
   */
  private longitudeToSignPosition(longitude: number): {
    sign: ZodiacSign;
    signIndex: number;
    degree: number;
    minute: number;
    second: number;
  } {
    const normalized = this.normalizeAngle(longitude);
    const signIndex = Math.floor(normalized / 30);
    const posInSign = normalized % 30;
    const degree = Math.floor(posInSign);
    const minuteFloat = (posInSign - degree) * 60;
    const minute = Math.floor(minuteFloat);
    const second = Math.floor((minuteFloat - minute) * 60);
    return {
      sign: ZODIAC_SIGNS[signIndex],
      signIndex,
      degree,
      minute,
      second,
    };
  }
  /**
   * Normalize angle to 0-360°
   */
  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }
}
export default AstronomyEngineService;
