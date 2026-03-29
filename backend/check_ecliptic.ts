import * as astronomy from 'astronomy-engine';

const time = astronomy.MakeTime(new Date());
const vec = astronomy.GeoVector(astronomy.Body.Sun, time, true);

console.log('GeoVector:', vec);
console.log('Vector type:', vec.constructor.name);

// Check Ecliptic signature
console.log('\nEcliptic function length:', astronomy.Ecliptic.length);

// Try with vector
try {
  const ecl = astronomy.Ecliptic(vec);
  console.log('Ecliptic(vec):', ecl);
} catch (e: any) {
  console.log('Error:', e.message);
}
