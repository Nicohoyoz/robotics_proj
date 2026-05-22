/**
 * Haversine formula — great-circle distance between two lat/lng points (km).
 * @param {object} a  { latitude, longitude }
 * @param {object} b  { latitude, longitude }
 * @returns {number} distance in kilometres
 */
export function haversineDistance(a, b) {
  const R = 6371; // Earth's radius in km
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      sinLon *
      sinLon;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Greedy nearest-neighbour TSP heuristic.  O(n²) — suitable for ≤ ~200 stops.
 *
 * Starting from `origin`, repeatedly visit the closest unvisited stop.
 *
 * @param {object}   origin  { latitude, longitude } — device GPS location
 * @param {object[]} stops   Array of { id, latitude, longitude, label? }
 * @returns {object[]} stops reordered along the greedy route (origin not included)
 */
export function optimizeRoute(origin, stops) {
  if (!stops || stops.length === 0) {
    return [];
  }
  if (stops.length === 1) {
    return [...stops];
  }

  const unvisited = [...stops];
  const route = [];
  let current = origin;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversineDistance(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = haversineDistance(current, unvisited[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    current = unvisited[nearestIdx];
    route.push(current);
    unvisited.splice(nearestIdx, 1);
  }

  return route;
}

/**
 * Total route distance in km: origin → stop[0] → stop[1] → … → stop[n-1].
 * @param {object}   origin
 * @param {object[]} orderedStops
 * @returns {number}
 */
export function totalRouteDistance(origin, orderedStops) {
  if (!orderedStops || orderedStops.length === 0) {
    return 0;
  }

  let total = haversineDistance(origin, orderedStops[0]);
  for (let i = 1; i < orderedStops.length; i++) {
    total += haversineDistance(orderedStops[i - 1], orderedStops[i]);
  }
  return total;
}
