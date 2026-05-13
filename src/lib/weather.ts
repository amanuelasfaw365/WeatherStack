const OWM_KEY = process.env.OPENWEATHER_API_KEY!;
const GEO_URL = "https://api.openweathermap.org/geo/1.0";
const OWM_URL = "https://api.openweathermap.org/data/2.5";

export interface GeoResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  flagUrl: string;
}

export async function geocodeByName(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_KEY}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Geocoding failed");
  return res.json();
}

export async function getWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const res = await fetch(
    `${OWM_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Weather fetch failed");
  const d = await res.json();

  return {
    city: d.name,
    country: d.sys.country,
    lat,
    lon,
    temp: d.main.temp,
    feels_like: d.main.feels_like,
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    wind_speed: d.wind.speed,
    description: d.weather[0].description,
    icon: d.weather[0].icon,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    flagUrl: `https://flagcdn.com/w80/${d.sys.country.toLowerCase()}.png`,
  };
}

export function validateCoords(lat: number, lon: number): string | null {
  if (isNaN(lat) || lat < -90 || lat > 90)
    return "Latitude must be between -90 and 90";
  if (isNaN(lon) || lon < -180 || lon > 180)
    return "Longitude must be between -180 and 180";
  return null;
}
