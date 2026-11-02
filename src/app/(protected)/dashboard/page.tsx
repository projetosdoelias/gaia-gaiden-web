"use client";

import { useEffect, useState, useCallback } from "react";
import { useHabitat } from "@/lib/context/HabitatContext";

type TelemetryEntry = {
  id: number;
  habitatId: number;
  recordedAt: string;
  createdAt: string;
  temperature: number;
  humidity: number;
  vpd: number;
};

type TelemetryResponse = {
  message?: string;
  data: TelemetryEntry | null;
};

function getVpdStatus(vpd: number) {
  if (vpd < 0.4) return { label: "Too Low", color: "text-blue-600", bg: "bg-blue-50" };
  if (vpd < 0.8) return { label: "Low", color: "text-amber-600", bg: "bg-amber-50" };
  if (vpd <= 1.2) return { label: "Ideal", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (vpd <= 1.6) return { label: "High", color: "text-orange-600", bg: "bg-orange-50" };
  return { label: "Critical", color: "text-red-600", bg: "bg-red-50" };
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { selectedHabitatId, habitats, isLoading: habitatsLoading } =
    useHabitat();

  const [telemetry, setTelemetry] = useState<TelemetryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const selectedHabitat = habitats.find((h) => h.id === selectedHabitatId);

  const fetchLastTelemetry = useCallback(async () => {
    if (selectedHabitatId === null) {
      setTelemetry(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/telemetry/${selectedHabitatId}/last`);
      if (!response.ok) {
        throw new Error(`Failed to fetch telemetry (${response.status})`);
      }
      const result = (await response.json()) as TelemetryResponse;
      setTelemetry(result.data ?? null);
      setLastFetched(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load telemetry data";
      setError(message);
      setTelemetry(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHabitatId]);

  useEffect(() => {
    if (selectedHabitatId !== null) {
      fetchLastTelemetry();
    }
  }, [selectedHabitatId, fetchLastTelemetry]);

  const habitatName = selectedHabitat?.title ?? "Climate Zone";

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
            Environmental Telemetry
          </h2>
          <p className="text-xs text-gaia-darkText/60">
            Live metrics from{" "}
            <span className="font-semibold text-gaia-greenDeep">
              {habitatName}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLastTelemetry}
            disabled={isLoading || selectedHabitatId === null}
            className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh telemetry data"
          >
            <svg className={`h-4 w-4 text-gaia-greenDeep ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-semibold text-gaia-darkText">
              {isLoading ? "Loading..." : "Refresh"}
            </span>
          </button>

          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-gray-100">
            <span className={`h-2 w-2 rounded-full animate-pulse ${telemetry ? "bg-gaia-alert-success" : "bg-gray-300"}`} />
            <span className="text-xs font-semibold text-gaia-greenDeep">
              {telemetry ? "Sensors Syncing" : "Awaiting Data"}
            </span>
          </div>
        </div>
      </div>

      {/* No habitat selected */}
      {selectedHabitatId === null && !habitatsLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-medium">Please select a habitat from the header dropdown to view telemetry data.</p>
        </div>
      )}

      {/* Habitats loading */}
      {habitatsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gaia-greenDeep border-t-transparent" />
            <span className="text-sm text-gray-500">Loading habitats...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={fetchLastTelemetry} className="mt-2 text-xs text-red-600 underline hover:no-underline">Try again</button>
        </div>
      )}

      {/* Telemetry loading */}
      {isLoading && selectedHabitatId !== null && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gaia-greenDeep border-t-transparent" />
            <span className="text-sm text-gray-500">Loading telemetry...</span>
          </div>
        </div>
      )}

      {/* No telemetry data */}
      {!isLoading && !error && !telemetry && selectedHabitatId !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-blue-800 font-medium">No telemetry data yet for this habitat.</p>
          <p className="text-blue-600 text-sm mt-1">Submit telemetry data or wait for sensors to report.</p>
        </div>
      )}

      {/* METRICS GRID + CHART */}
      {telemetry && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CARD: Temperature */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">Ambient Temperature</span>
                  <span className="text-lg">🌡️</span>
                </div>
                <div className="flex items-baseline space-x-1 my-3">
                  <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">{telemetry.temperature.toFixed(1)}</span>
                  <span className="text-lg text-gaia-darkText/60 font-semibold">°C</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Last updated: {lastFetched ? formatTimestamp(lastFetched.toISOString()) : "—"}
              </span>
            </div>

            {/* CARD: Humidity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">Relative Humidity</span>
                  <span className="text-lg">💧</span>
                </div>
                <div className="flex items-baseline space-x-1 my-3">
                  <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">{Math.round(telemetry.humidity)}</span>
                  <span className="text-lg text-gaia-darkText/60 font-semibold">%</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Last updated: {lastFetched ? formatTimestamp(lastFetched.toISOString()) : "—"}
              </span>
            </div>

            {/* CARD: VPD */}
            <div className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-shadow relative overflow-hidden min-h-[140px] hover:shadow-md flex flex-col justify-between ${getVpdStatus(telemetry.vpd).bg}/40`}>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider bg-white/80 shadow-xs">
                <span className={getVpdStatus(telemetry.vpd).color}>{getVpdStatus(telemetry.vpd).label}</span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">Vapor Pressure Deficit</span>
                  <span className="text-lg">🌿</span>
                </div>
                <div className="flex items-baseline space-x-1 my-3">
                  <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">{telemetry.vpd.toFixed(2)}</span>
                  <span className="text-lg text-gaia-darkText/60 font-semibold">kPa</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Last updated: {lastFetched ? formatTimestamp(lastFetched.toISOString()) : "—"}
              </span>
            </div>
          </div>

          {/* VPD CHART placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gaia-greenDeep uppercase tracking-wider">VPD Historical Trend</h3>
                <p className="text-xs text-gray-400">
                  Last 24 hours timeline performance · Current: <span className="font-semibold text-gaia-greenDeep">{telemetry.vpd.toFixed(2)} kPa</span>
                </p>
              </div>
              <div className="flex bg-gaia-bg p-1 rounded-lg text-xs font-medium text-gaia-darkText/70 self-start sm:self-auto">
                <span className="bg-white text-gaia-greenDeep px-3 py-1 rounded-md shadow-2xs font-bold">24h</span>
                <span className="px-3 py-1 opacity-50">7d</span>
                <span className="px-3 py-1 opacity-50">30d</span>
              </div>
            </div>

            <div className="w-full bg-gaia-bg/30 rounded-xl p-4 border border-gray-100/50">
              <div className="h-64 w-full relative flex flex-col justify-between">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-gray-200 w-full h-0" />
                  <div className="border-b border-dashed border-gray-200 w-full h-0" />
                  <div className="border-b border-dashed border-gray-200 w-full h-0" />
                  <div className="border-b border-dashed border-gray-200 w-full h-0" />
                </div>

                <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="vpdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A4E0C3" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A4E0C3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 80 Q 20 40 40 60 T 80 30 T 100 50 L 100 100 L 0 100 Z" fill="url(#vpdGradient)" />
                  <path d="M 0 80 Q 20 40 40 60 T 80 30 T 100 50" fill="none" stroke="#0F3B2E" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-400 font-mono pointer-events-none">
                  <span>1.6 kPa</span>
                  <span>1.2 kPa</span>
                  <span>0.8 kPa</span>
                  <span>0.4 kPa</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium px-4">
                <span>Yesterday, 10 PM</span>
                <span>6 AM</span>
                <span>2 PM</span>
                <span>Today, 10 PM</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
