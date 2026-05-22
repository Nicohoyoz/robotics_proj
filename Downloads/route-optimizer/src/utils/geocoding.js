/**
 * Geocoding utilities — placeholder for Phase 2 Google Maps API integration.
 *
 * In Phase 2 (AWS Lambda + Terraform), these stubs will be replaced with
 * calls to a Lambda function that proxies the Google Maps Geocoding API,
 * keeping the API key server-side.
 */

/**
 * Reverse-geocode a coordinate to a human-readable address.
 * Currently returns a formatted lat/lng string.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
export async function reverseGeocode(latitude, longitude) {
  // TODO (Phase 2): call AWS Lambda /geocode endpoint
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/**
 * Forward-geocode an address string to coordinates.
 * Currently unimplemented — returns null.
 *
 * @param {string} address
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function forwardGeocode(address) {
  // TODO (Phase 2): call AWS Lambda /geocode endpoint
  console.warn('forwardGeocode is not yet implemented (Phase 2).');
  return null;
}
