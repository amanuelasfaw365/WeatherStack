"use client";

import Image from "next/image";

interface WeatherData {
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

interface WeatherCardProps {
  data: WeatherData;
  stale?: boolean;
  cachedAt?: string;
}

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function WeatherCard({ data, stale, cachedAt }: WeatherCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
      {stale && cachedAt && (
        <div className="flex items-center gap-2 mb-4 bg-amber-950/60 border border-amber-700/50 rounded-xl px-3 py-2">
          <span className="text-amber-400 text-xs">⚡</span>
          <p className="text-amber-300 text-xs">
            Serving cached data — Last updated{" "}
            <span className="font-semibold">{formatRelative(cachedAt)}</span>{" "}
            ({new Date(cachedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
          </p>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Image
              src={data.flagUrl}
              alt={data.country}
              width={32}
              height={24}
              className="rounded"
              unoptimized
            />
            <h2 className="text-2xl font-bold text-white">
              {data.city}, {data.country}
            </h2>
          </div>
          <p className="text-slate-400 text-sm">
            {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
          </p>
        </div>
        <Image
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.description}
          width={64}
          height={64}
          unoptimized
        />
      </div>

      <div className="mb-4">
        <p className="text-6xl font-light text-white">
          {Math.round(data.temp)}°<span className="text-3xl">C</span>
        </p>
        <p className="text-slate-300 capitalize mt-1">{data.description}</p>
        <p className="text-slate-400 text-sm">Feels like {Math.round(data.feels_like)}°C</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Humidity" value={`${data.humidity}%`} />
        <Stat label="Pressure" value={`${data.pressure} hPa`} />
        <Stat label="Wind" value={`${data.wind_speed} m/s`} />
        <Stat
          label="Sunrise / Sunset"
          value={`${formatTime(data.sunrise)} / ${formatTime(data.sunset)}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/50 rounded-xl p-3">
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}
