import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  geocodeByName,
  getWeatherByCoords,
  validateCoords,
  WeatherApiError,
} from "@/lib/weather";
import { getCachedWeather, setCachedWeather } from "@/lib/weatherCache";
import { upsertSearchHistory } from "@/lib/history";

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { mode, query, lat: rawLat, lon: rawLon } = body;

    let lat: number, lon: number, city: string | undefined, country: string;

    if (mode === "coords") {
      // Guard missing inputs before parsing
      if (rawLat == null || rawLon == null)
        return NextResponse.json(
          { error: "Latitude and longitude are required" },
          { status: 400 }
        );

      lat = parseFloat(String(rawLat));
      lon = parseFloat(String(rawLon));

      const coordErr = validateCoords(lat, lon);
      if (coordErr) return NextResponse.json({ error: coordErr }, { status: 400 });
    } else {
      // mode === "name"
      if (!query?.trim())
        return NextResponse.json({ error: "Query is required" }, { status: 400 });

      const geoResults = await geocodeByName(query).catch((err) => {
        if (err instanceof WeatherApiError) throw err;
        throw err;
      });

      if (!geoResults.length)
        return NextResponse.json(
          { error: "Country not found" },
          { status: 404 }
        );

      const geo = geoResults[0];
      lat = geo.lat;
      lon = geo.lon;
      city = geo.name;
      country = geo.country;
    }

    try {
      const weather = await getWeatherByCoords(lat!, lon!);
      country = weather.country;
      city = city ?? weather.city;

      // Fire-and-forget — cache update should never block the response
      setCachedWeather(lat!, lon!, weather).catch(console.error);
      await upsertSearchHistory(authUser.sub, { country, city, lat, lon });

      return NextResponse.json({ weather, stale: false });
    } catch (weatherErr) {
      // On rate-limit (429), transparently serve the last cached result
      if (
        weatherErr instanceof WeatherApiError &&
        weatherErr.status === 429
      ) {
        const cached = await getCachedWeather(lat!, lon!);
        if (cached) {
          return NextResponse.json({
            weather: cached.data,
            stale: true,
            cachedAt: cached.updatedAt.toISOString(),
          });
        }
        return NextResponse.json(
          { error: "Rate limit exceeded and no cached data available. Try again shortly." },
          { status: 429 }
        );
      }
      throw weatherErr;
    }
  } catch (err) {
    console.error(err);
    if (err instanceof WeatherApiError)
      return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
