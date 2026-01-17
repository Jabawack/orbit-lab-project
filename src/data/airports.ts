/**
 * Major airports database for trajectory endpoint inference
 * Contains ~100 busiest airports in USA, Europe, and East Asia
 */

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  region: 'usa' | 'europe' | 'eastAsia';
}

export const airports: Airport[] = [
  // USA - Major airports
  { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277, region: 'usa' },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081, region: 'usa' },
  { icao: 'KORD', iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, region: 'usa' },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', lat: 32.8998, lng: -97.0403, region: 'usa' },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', lat: 39.8561, lng: -104.6737, region: 'usa' },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, region: 'usa' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.379, region: 'usa' },
  { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', lat: 36.086, lng: -115.1537, region: 'usa' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.287, region: 'usa' },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088, region: 'usa' },
  { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA', lat: 40.6895, lng: -74.1745, region: 'usa' },
  { icao: 'KMCO', iata: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', lat: 28.4312, lng: -81.308, region: 'usa' },
  { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', country: 'USA', lat: 33.4373, lng: -112.0078, region: 'usa' },
  { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', lat: 29.9844, lng: -95.3414, region: 'usa' },
  { icao: 'KBOS', iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'USA', lat: 42.3656, lng: -71.0096, region: 'usa' },
  { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-St Paul International', city: 'Minneapolis', country: 'USA', lat: 44.8848, lng: -93.2223, region: 'usa' },
  { icao: 'KDTW', iata: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA', lat: 42.2162, lng: -83.3554, region: 'usa' },
  { icao: 'KPHL', iata: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA', lat: 39.8744, lng: -75.2424, region: 'usa' },
  { icao: 'KLGA', iata: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA', lat: 40.7769, lng: -73.874, region: 'usa' },
  { icao: 'KFLL', iata: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale', country: 'USA', lat: 26.0742, lng: -80.1506, region: 'usa' },
  { icao: 'KDCA', iata: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'USA', lat: 38.8512, lng: -77.0402, region: 'usa' },
  { icao: 'KIAD', iata: 'IAD', name: 'Washington Dulles International', city: 'Washington', country: 'USA', lat: 38.9531, lng: -77.4565, region: 'usa' },
  { icao: 'KSAN', iata: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA', lat: 32.7336, lng: -117.1897, region: 'usa' },
  { icao: 'KTPA', iata: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA', lat: 27.9755, lng: -82.5332, region: 'usa' },
  { icao: 'KPDX', iata: 'PDX', name: 'Portland International', city: 'Portland', country: 'USA', lat: 45.5898, lng: -122.5951, region: 'usa' },

  // Europe - Major airports
  { icao: 'EGLL', iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543, region: 'europe' },
  { icao: 'LFPG', iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, region: 'europe' },
  { icao: 'EHAM', iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, region: 'europe' },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, region: 'europe' },
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4983, lng: -3.5676, region: 'europe' },
  { icao: 'LEBL', iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lng: 2.0833, region: 'europe' },
  { icao: 'EGKK', iata: 'LGW', name: 'Gatwick', city: 'London', country: 'UK', lat: 51.1537, lng: -0.1821, region: 'europe' },
  { icao: 'EDDM', iata: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', lat: 48.3538, lng: 11.7861, region: 'europe' },
  { icao: 'LIRF', iata: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389, region: 'europe' },
  { icao: 'EIDW', iata: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', lat: 53.4213, lng: -6.2701, region: 'europe' },
  { icao: 'LSZH', iata: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland', lat: 47.4582, lng: 8.5555, region: 'europe' },
  { icao: 'LOWW', iata: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria', lat: 48.1103, lng: 16.5697, region: 'europe' },
  { icao: 'EBBR', iata: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium', lat: 50.9014, lng: 4.4844, region: 'europe' },
  { icao: 'EKCH', iata: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark', lat: 55.6180, lng: 12.6508, region: 'europe' },
  { icao: 'EGCC', iata: 'MAN', name: 'Manchester', city: 'Manchester', country: 'UK', lat: 53.3537, lng: -2.2750, region: 'europe' },
  { icao: 'LPPT', iata: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal', lat: 38.7813, lng: -9.1359, region: 'europe' },
  { icao: 'ESSA', iata: 'ARN', name: 'Arlanda', city: 'Stockholm', country: 'Sweden', lat: 59.6519, lng: 17.9186, region: 'europe' },
  { icao: 'ENGM', iata: 'OSL', name: 'Gardermoen', city: 'Oslo', country: 'Norway', lat: 60.1976, lng: 11.1004, region: 'europe' },
  { icao: 'EFHK', iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', lat: 60.3172, lng: 24.9633, region: 'europe' },
  { icao: 'LGAV', iata: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9445, region: 'europe' },
  { icao: 'LTFM', iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519, region: 'europe' },
  { icao: 'UUEE', iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow', country: 'Russia', lat: 55.9726, lng: 37.4146, region: 'europe' },
  { icao: 'EPWA', iata: 'WAW', name: 'Chopin', city: 'Warsaw', country: 'Poland', lat: 52.1657, lng: 20.9671, region: 'europe' },
  { icao: 'LKPR', iata: 'PRG', name: 'Václav Havel', city: 'Prague', country: 'Czech Republic', lat: 50.1008, lng: 14.2600, region: 'europe' },
  { icao: 'LHBP', iata: 'BUD', name: 'Ferenc Liszt', city: 'Budapest', country: 'Hungary', lat: 47.4369, lng: 19.2556, region: 'europe' },

  // East Asia - Major airports
  { icao: 'RJTT', iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798, region: 'eastAsia' },
  { icao: 'RJAA', iata: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan', lat: 35.7653, lng: 140.3856, region: 'eastAsia' },
  { icao: 'ZBAA', iata: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China', lat: 40.0799, lng: 116.6031, region: 'eastAsia' },
  { icao: 'ZSPD', iata: 'PVG', name: 'Pudong', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083, region: 'eastAsia' },
  { icao: 'VHHH', iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185, region: 'eastAsia' },
  { icao: 'RKSI', iata: 'ICN', name: 'Incheon', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, region: 'eastAsia' },
  { icao: 'WSSS', iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, region: 'eastAsia' },
  { icao: 'RCTP', iata: 'TPE', name: 'Taoyuan', city: 'Taipei', country: 'Taiwan', lat: 25.0777, lng: 121.2325, region: 'eastAsia' },
  { icao: 'ZGGG', iata: 'CAN', name: 'Baiyun', city: 'Guangzhou', country: 'China', lat: 23.3924, lng: 113.2988, region: 'eastAsia' },
  { icao: 'ZGSZ', iata: 'SZX', name: "Bao'an", city: 'Shenzhen', country: 'China', lat: 22.6393, lng: 113.8128, region: 'eastAsia' },
  { icao: 'RJBB', iata: 'KIX', name: 'Kansai', city: 'Osaka', country: 'Japan', lat: 34.4347, lng: 135.2441, region: 'eastAsia' },
  { icao: 'VTBS', iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501, region: 'eastAsia' },
  { icao: 'WMKK', iata: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7099, region: 'eastAsia' },
  { icao: 'RPLL', iata: 'MNL', name: 'Ninoy Aquino', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0194, region: 'eastAsia' },
  { icao: 'WIII', iata: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta', country: 'Indonesia', lat: -6.1256, lng: 106.6558, region: 'eastAsia' },
  { icao: 'VVNB', iata: 'HAN', name: 'Noi Bai', city: 'Hanoi', country: 'Vietnam', lat: 21.2187, lng: 105.8072, region: 'eastAsia' },
  { icao: 'VVTS', iata: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8188, lng: 106.6519, region: 'eastAsia' },
  { icao: 'ZUUU', iata: 'CTU', name: 'Shuangliu', city: 'Chengdu', country: 'China', lat: 30.5785, lng: 103.9471, region: 'eastAsia' },
  { icao: 'ZLXY', iata: 'XIY', name: "Xi'an Xianyang", city: "Xi'an", country: 'China', lat: 34.4471, lng: 108.7516, region: 'eastAsia' },
  { icao: 'ZUCK', iata: 'CKG', name: 'Jiangbei', city: 'Chongqing', country: 'China', lat: 29.7192, lng: 106.6417, region: 'eastAsia' },
  { icao: 'RJGG', iata: 'NGO', name: 'Chubu Centrair', city: 'Nagoya', country: 'Japan', lat: 34.8584, lng: 136.8047, region: 'eastAsia' },
  { icao: 'RJFF', iata: 'FUK', name: 'Fukuoka', city: 'Fukuoka', country: 'Japan', lat: 33.5859, lng: 130.4513, region: 'eastAsia' },
  { icao: 'RKPK', iata: 'PUS', name: 'Gimhae', city: 'Busan', country: 'South Korea', lat: 35.1795, lng: 128.9382, region: 'eastAsia' },
  { icao: 'ZSNJ', iata: 'NKG', name: 'Lukou', city: 'Nanjing', country: 'China', lat: 31.7420, lng: 118.8620, region: 'eastAsia' },
  { icao: 'ZSSS', iata: 'SHA', name: 'Hongqiao', city: 'Shanghai', country: 'China', lat: 31.1979, lng: 121.3363, region: 'eastAsia' },
];

/**
 * Find nearest airport to a given coordinate
 */
export function findNearestAirport(
  lat: number,
  lng: number,
  maxDistanceKm: number = 50
): Airport | null {
  let nearest: Airport | null = null;
  let nearestDistance = Infinity;

  for (const airport of airports) {
    const distance = haversineDistance(lat, lng, airport.lat, airport.lng);
    if (distance < nearestDistance && distance <= maxDistanceKm) {
      nearest = airport;
      nearestDistance = distance;
    }
  }

  return nearest;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Infer origin and destination airports from trajectory
 * Uses first and last points plus altitude/velocity to guess airports
 */
export function inferAirports(
  trajectory: { lat: number; lng: number; altitude?: number; velocity?: number }[]
): { origin: Airport | null; destination: Airport | null } {
  if (trajectory.length < 2) {
    return { origin: null, destination: null };
  }

  const first = trajectory[0];
  const last = trajectory[trajectory.length - 1];

  // Look for airports near start and end points
  // Use larger radius for origin (plane may have taken off and gained altitude)
  // Use smaller radius for destination (plane is descending)
  const origin = findNearestAirport(first.lat, first.lng, 100);
  const destination = findNearestAirport(last.lat, last.lng, 100);

  return { origin, destination };
}
