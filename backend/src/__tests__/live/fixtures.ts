/**
 * Test Data Fixtures for Live Integration Tests
 * Known birth data with expected results for deterministic assertions
 */

// Well-known birth data with verifiable astrological results
export const KNOWN_CHARTS = {
  // Modern test case: June 15, 1990, 2:30 PM, New York
  // Sun should be in Gemini (May 21 - June 20)
  newYork1990: {
    input: {
      name: 'Test - NYC 1990',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY, USA',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
    },
    expected: {
      sunSign: 'Gemini',
    },
  },
  // London winter birth
  london1988: {
    input: {
      name: 'Test - London 1988',
      birth_date: '1988-03-22',
      birth_time: '09:15',
      birth_place_name: 'London, UK',
      birth_latitude: 51.5074,
      birth_longitude: -0.1278,
      birth_timezone: 'Europe/London',
      house_system: 'placidus',
      zodiac: 'tropical',
    },
    expected: {
      sunSign: 'Aries',
    },
  },
  // Midnight birth (edge case)
  midnight: {
    input: {
      name: 'Test - Midnight Birth',
      birth_date: '2000-01-01',
      birth_time: '00:00',
      birth_place_name: 'Tokyo, Japan',
      birth_latitude: 35.6762,
      birth_longitude: 139.6503,
      birth_timezone: 'Asia/Tokyo',
      house_system: 'placidus',
      zodiac: 'tropical',
    },
    expected: {
      sunSign: 'Capricorn',
    },
  },
  // Equator birth (house calculation edge case)
  equator: {
    input: {
      name: 'Test - Equator Birth',
      birth_date: '1995-07-04',
      birth_time: '12:00',
      birth_place_name: 'Quito, Ecuador',
      birth_latitude: 0.0,
      birth_longitude: -78.4678,
      birth_timezone: 'America/Guayaquil',
      house_system: 'placidus',
      zodiac: 'tropical',
    },
    expected: {
      sunSign: 'Cancer',
    },
  },
};

// Invalid input catalog with expected errors
export const INVALID_INPUTS = {
  missingBirthDate: {
    input: { name: 'No Date Chart', birth_time: '12:00:00' },
    expectedStatus: 400,
  },
  missingLocation: {
    input: { name: 'No Location', birth_date: '1990-01-01', birth_time: '12:00:00' },
    expectedStatus: 400,
  },
  futureDate: {
    input: {
      name: 'Future Person',
      birth_date: '2099-01-01',
      birth_time: '12:00',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
    },
    expectedStatus: 400,
  },
  invalidLatitude: {
    input: {
      name: 'Bad Coords',
      birth_date: '1990-01-01',
      birth_time: '12:00',
      birth_latitude: 999,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
    },
    expectedStatus: 400,
  },
};

// Partner chart data for synastry tests
export const PARTNER_CHART = {
  name: 'Partner Test Chart',
  birth_date: '1992-11-05',
  birth_time: '08:00',
  birth_place_name: 'Paris, France',
  birth_latitude: 48.8566,
  birth_longitude: 2.3522,
  birth_timezone: 'Europe/Paris',
  house_system: 'placidus',
  zodiac: 'tropical',
};
