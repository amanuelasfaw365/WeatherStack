import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { geocodeByName, getWeatherByCoords, validateCoords } from "@/lib/weather";
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
      lat = parseFloat(rawLat);
      lon = parseFloat(rawLon);
      const err = validateCoords(lat, lon);
      if (err) return NextResponse.json({ error: err }, { status: 400 });

      const weather = await getWeatherByCoords(lat, lon);
      country = weather.country;
      city = weather.city;

      await upsertSearchHistory(authUser.sub, { country, city, lat, lon });
      return NextResponse.json({ weather });
    }

    // mode === "name"
    if (!query?.trim())
      return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const geoResults = await geocodeByName(query);
    if (!geoResults.length)
      return NextResponse.json({ error: "Location not found" }, { status: 404 });

    const geo = geoResults[0];
    lat = geo.lat;
    lon = geo.lon;
    city = geo.name;
    country = geo.country;

    const weather = await getWeatherByCoords(lat, lon);
    await upsertSearchHistory(authUser.sub, { country, city, lat, lon });

    return NextResponse.json({ weather });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
