import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { WeatherData } from "./weather";

// Round to 2 decimal places → ~1 km precision, good enough for weather
function buildKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}:${lon.toFixed(2)}`;
}

export async function getCachedWeather(
  lat: number,
  lon: number
): Promise<{ data: WeatherData; updatedAt: Date } | null> {
  const row = await prisma.weatherCache.findUnique({
    where: { cacheKey: buildKey(lat, lon) },
  });
  if (!row) return null;
  return { data: row.data as unknown as WeatherData, updatedAt: row.updatedAt };
}

export async function setCachedWeather(
  lat: number,
  lon: number,
  data: WeatherData
): Promise<void> {
  const key = buildKey(lat, lon);
  await prisma.weatherCache.upsert({
    where: { cacheKey: key },
    create: { cacheKey: key, data: data as unknown as Prisma.InputJsonValue },
    update: { data: data as unknown as Prisma.InputJsonValue },
  });
}
