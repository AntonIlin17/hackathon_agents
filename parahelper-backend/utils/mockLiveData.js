const weatherByCity = {
  Huntsville: {
    tempC: -8,
    condition: "Snow",
    windKph: 22,
    alert: "Roads icy on Highway 11",
  },
  Bracebridge: {
    tempC: -5,
    condition: "Cloudy",
    windKph: 18,
    alert: "",
  },
  Barrie: {
    tempC: -3,
    condition: "Light snow",
    windKph: 15,
    alert: "Reduced visibility downtown",
  },
  Toronto: {
    tempC: 1,
    condition: "Rain",
    windKph: 20,
    alert: "Slippery roads and reduced visibility",
  },
  Ottawa: {
    tempC: -6,
    condition: "Snow showers",
    windKph: 25,
    alert: "Blowing snow on major routes",
  },
};

const directionsByRoute = {
  "Huntsville->Bracebridge": {
    durationMin: 35,
    distanceKm: 50,
    summary: "Fastest route via ON-11 S",
  },
  "Huntsville->Barrie": {
    durationMin: 95,
    distanceKm: 120,
    summary: "Fastest route via ON-11 S",
  },
  "Bracebridge->Barrie": {
    durationMin: 70,
    distanceKm: 85,
    summary: "Fastest route via ON-11 S",
  },
  "Barrie->Toronto": {
    durationMin: 70,
    distanceKm: 90,
    summary: "Fastest route via ON-400 S",
  },
  "Toronto->Ottawa": {
    durationMin: 270,
    distanceKm: 450,
    summary: "Fastest route via ON-401 E",
  },
};

const stationCity = {
  "Station 7": "Toronto, Ontario",
  "Station 3": "Huntsville, Ontario",
  "Station 1": "Bracebridge, Ontario",
};

function getMockWeather(city) {
  if (!city) return null;
  return weatherByCity[city] || null;
}

function getMockDirections(from, to) {
  if (!from || !to) return null;
  const key = `${from}->${to}`;
  return directionsByRoute[key] || null;
}

function getStationCity(station) {
  if (!station) return "";
  return stationCity[station] || "";
}

module.exports = { getMockWeather, getMockDirections, getStationCity };
