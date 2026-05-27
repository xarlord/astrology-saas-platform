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
  longitude: number; // 0-360° ecliptic longitude
  latitude: number; // -90 to 90° ecliptic latitude
  distance: number; // AU (astronomical units)
  speed: number; // °/day (negative = retrograde)
  sign: string; // Zodiac sign name
  signIndex: number; // 0-11 (Aries = 0)
  degree: number; // Degree within sign (0-29)
  minute: number; // Minutes within degree (0-59)
  second: number; // Seconds within minute (0-59)
  isRetrograde: boolean;
  house?: number; // House placement (1-12), calculated later
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
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

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
    longitude: number,
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
    _observer: astronomy.Observer,
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
    let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
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
   * Uses J2000 orbital elements with heliocentric → geocentric conversion
   */
  calculateChiron(date: Date): ChironPosition {
    const time = astronomy.MakeTime(date);
    const jd = time.ut + 2451545.0;
    const T = jd / 36525.0; // Julian centuries from J2000.0

    // Chiron orbital elements (J2000 epoch, approximate)
    const a = 13.7196;       // Semi-major axis (AU)
    const e = 0.3815;        // Eccentricity
    const omega_bar = 338.96; // Longitude of perihelion (deg)
    const L0 = 209.13;       // Mean longitude at epoch (deg)
    const n = 360 / 50.7;    // Mean motion (deg/year) — orbital period ~50.7 years

    // Mean longitude
    const L = this.normalizeAngle(L0 + n * T * 100);

    // Mean anomaly
    const M = this.normalizeAngle(L - omega_bar);
    const M_rad = (M * Math.PI) / 180;

    // Solve Kepler's equation: E - e*sin(E) = M
    let E_rad = M_rad;
    for (let i = 0; i < 20; i++) {
      E_rad = M_rad + e * Math.sin(E_rad);
    }

    // True anomaly
    const v_rad = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E_rad / 2),
      Math.sqrt(1 - e) * Math.cos(E_rad / 2),
    );
    const v = (v_rad * 180) / Math.PI;

    // Heliocentric longitude
    const helioLon = this.normalizeAngle(v + omega_bar);

    // Approximate geocentric correction:
    // Earth's heliocentric longitude for the date
    const earthL = this.normalizeAngle(100.46435 + 36000.76975 * T + 0.0003 * T * T);

    // Elongation
    const elongation = helioLon - earthL;

    // Simplified geocentric longitude (project heliocentric onto ecliptic)
    // For outer bodies, geocentric ≈ heliocentric + small correction
    // The parallax correction is small for Chiron (distant body)
    // But we need the correct sign and rough magnitude
    const r = a * (1 - e * Math.cos(E_rad)); // heliocentric distance
    const R = 1.0; // Earth's distance (approximate)
    const sinE = Math.sin((elongation * Math.PI) / 180);
    const correction = (R / r) * (180 / Math.PI) * Math.sin((elongation * Math.PI) / 180) * 0.5;
    let geoLon = this.normalizeAngle(helioLon - correction);

    // Calculate speed
    const prevTime = new astronomy.AstroTime(time.ut - 1);
    const prevJd = prevTime.ut + 2451545.0;
    const prevT = prevJd / 36525.0;
    const prevL = this.normalizeAngle(L0 + n * prevT * 100);
    const prevM = this.normalizeAngle(prevL - omega_bar);
    let prevE_rad = (prevM * Math.PI) / 180;
    for (let i = 0; i < 20; i++) {
      prevE_rad = (prevM * Math.PI) / 180 + e * Math.sin(prevE_rad);
    }
    const prevV_rad = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(prevE_rad / 2),
      Math.sqrt(1 - e) * Math.cos(prevE_rad / 2),
    );
    const prevV = (prevV_rad * 180) / Math.PI;
    const prevHelioLon = this.normalizeAngle(prevV + omega_bar);
    const prevEarthL = this.normalizeAngle(100.46435 + 36000.76975 * prevT);
    const prevElongation = prevHelioLon - prevEarthL;
    const prevR = a * (1 - e * Math.cos(prevE_rad));
    const prevCorrection = (1.0 / prevR) * (180 / Math.PI) * Math.sin((prevElongation * Math.PI) / 180) * 0.5;
    const prevGeoLon = this.normalizeAngle(prevHelioLon - prevCorrection);

    let speed = geoLon - prevGeoLon;
    if (speed > 180) speed -= 360;
    if (speed < -180) speed += 360;

    const signPos = this.longitudeToSignPosition(geoLon);

    return {
      longitude: geoLon,
      sign: signPos.sign,
      degree: signPos.degree,
      isRetrograde: speed < 0,
    };
  }
  /**
   * Get all planetary positions for a given date (daily transits).
   * Returns a plain object keyed by lowercase planet names for compatibility
   * with the legacy swissEphemeris.getDailyTransits() shape.
   */
  getDailyTransits(date: Date): Record<
    string,
    {
      longitude: number;
      latitude: number;
      speed: number;
      retrograde: boolean;
      sign: string;
      degree: number;
    }
  > {
    const positions = this.calculatePlanetaryPositions(date, 0, 0);
    const chiron = this.calculateChiron(date);
    const nodes = this.calculateLunarNodes(date);

    const result: Record<
      string,
      {
        longitude: number;
        latitude: number;
        speed: number;
        retrograde: boolean;
        sign: string;
        degree: number;
      }
    > = {};

    for (const [name, pos] of positions) {
      result[name.toLowerCase()] = {
        longitude: pos.longitude,
        latitude: pos.latitude,
        speed: pos.speed,
        retrograde: pos.isRetrograde,
        sign: pos.sign.toLowerCase(),
        degree: pos.degree,
      };
    }

    result['chiron'] = {
      longitude: chiron.longitude,
      latitude: 0,
      speed: 0,
      retrograde: chiron.isRetrograde,
      sign: chiron.sign.toLowerCase(),
      degree: chiron.degree,
    };

    result['northnode'] = {
      longitude: nodes.northNode.longitude,
      latitude: 0,
      speed: 0,
      retrograde: false,
      sign: nodes.northNode.sign.toLowerCase(),
      degree: nodes.northNode.degree,
    };

    result['southnode'] = {
      longitude: nodes.southNode.longitude,
      latitude: 0,
      speed: 0,
      retrograde: false,
      sign: nodes.southNode.sign.toLowerCase(),
      degree: nodes.southNode.degree,
    };

    return result;
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
    // SiderealTime returns GST in sidereal hours (0–24); convert to degrees
    const gstDegrees = astronomy.SiderealTime(time) * 15;
    // Local Sidereal Time = GST + observer longitude
    let lst = gstDegrees + longitude;
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
