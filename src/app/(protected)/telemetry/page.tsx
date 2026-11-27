"use client";

import { useHabitat } from "@/lib/context/HabitatContext";
import TelemetryForm from "./_components/TelemetryForm";

/**
 * Manual telemetry entry. The habitat is the one selected in the header, as
 * on every other page. Readings are sent with the user's session (JWT) through
 * POST /api/habitat/:habitatId/telemetry.
 */
export default function TelemetryPage() {
  const { selectedHabitatId, habitats, isLoading, error, refetch } =
    useHabitat();
  const habitat = habitats.find((h) => h.id === selectedHabitatId);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
          Manual Telemetry
        </h2>
        <p className="text-xs text-gaia-darkText/60">
          Record a reading by hand. Devices send their readings automatically.
        </p>
      </div>

      {isLoading && (
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 animate-pulse"
          aria-busy="true"
          aria-label="Loading habitats"
        >
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 w-32 bg-gray-100 rounded-xl" />
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-3">
          <p className="text-sm text-gaia-alert-critical">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && !habitat && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gaia-darkText/70">
            Select a habitat from the header dropdown to record a reading.
          </p>
        </div>
      )}

      {!isLoading && !error && habitat && (
        // Keyed by habitat: switching habitats starts a fresh form.
        <TelemetryForm
          key={habitat.id}
          habitatId={habitat.id}
          habitatTitle={habitat.title}
        />
      )}
    </div>
  );
}
