const MAPBOX_BASE_URL = "https://api.mapbox.com";

function getMapboxKey() {
  return process.env.MAPBOX_API_KEY || "";
}

async function geocodePlace(place) {
  const apiKey = getMapboxKey();
  if (!apiKey) return null;
  const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
    place
  )}.json?limit=1&access_token=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const feature = data?.features?.[0];
  if (!feature?.center) return null;
  return {
    lon: feature.center[0],
    lat: feature.center[1],
    label: feature.place_name || place,
  };
}

async function getDirections(fromPlace, toPlace) {
  const apiKey = getMapboxKey();
  if (!apiKey) return null;
  const from = await geocodePlace(fromPlace);
  const to = await geocodePlace(toPlace);
  if (!from || !to) return null;

  const url = `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&access_token=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route) return null;
  return {
    from: from.label,
    to: to.label,
    durationMin: Math.round(route.duration / 60),
    distanceKm: Math.round(route.distance / 1000),
    summary: "Fastest route calculated by Mapbox",
  };
}

module.exports = { getDirections };
