"use client";

import { useEffect, useState } from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { Plant } from "@/lib/api/plantMapper";
import { useHabitat } from "@/lib/context/HabitatContext";
import PlantFormModal from "./_components/PlantFormModal";
import PlantGrid from "./_components/PlantGrid";
import PlantGridSkeleton from "./_components/PlantGridSkeleton";

type LoadResult = { key: string; plants: Plant[]; error: string | null };

const panelClass =
  "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 bg-gaia-greenDeep text-white px-4 py-2 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint disabled:opacity-50 disabled:cursor-not-allowed";

export default function PlantsPage() {
  const {
    habitats,
    selectedHabitatId,
    isLoading: habitatsLoading,
    error: habitatsError,
    refetch: refetchHabitats,
  } = useHabitat();
  const selectedHabitat = habitats.find((h) => h.id === selectedHabitatId);

  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  // The create modal belongs to the habitat it was opened for.
  const [createForHabitat, setCreateForHabitat] = useState<number | null>(
    null,
  );

  // Close any open modal when the habitat changes (adjusting state during
  // render, so switching A → B → A doesn't reopen it).
  const [prevHabitatId, setPrevHabitatId] = useState(selectedHabitatId);
  if (prevHabitatId !== selectedHabitatId) {
    setPrevHabitatId(selectedHabitatId);
    setCreateForHabitat(null);
  }

  const requestKey = `${selectedHabitatId}:${reloadKey}`;

  useEffect(() => {
    if (selectedHabitatId === null) return;
    const controller = new AbortController();
    const key = `${selectedHabitatId}:${reloadKey}`;

    apiJson<Plant[]>(`/api/habitat/${selectedHabitatId}/plants`, {
      signal: controller.signal,
    })
      .then((plants) => {
        if (!controller.signal.aborted) {
          setResult({ key, plants, error: null });
        }
      })
      .catch((err: unknown) => {
        // Session end is already redirecting to /login: no error flash.
        if (controller.signal.aborted || err instanceof SessionExpiredError) {
          return;
        }
        setResult({
          key,
          plants: [],
          error: err instanceof Error ? err.message : "Failed to load plants",
        });
      });

    // Abort the in-flight request when the habitat changes or on unmount.
    return () => controller.abort();
  }, [selectedHabitatId, reloadKey]);

  const isLoading =
    (selectedHabitatId === null && habitatsLoading) ||
    (selectedHabitatId !== null && result?.key !== requestKey);
  const current = !isLoading && result?.key === requestKey ? result : null;
  const plants = current?.plants ?? [];
  const error = current?.error ?? null;

  const openCreate = () => setCreateForHabitat(selectedHabitatId);
  const closeCreate = () => setCreateForHabitat(null);

  const handleCreated = (plant: Plant) => {
    setResult((prev) =>
      prev && prev.key === requestKey
        ? { ...prev, plants: [plant, ...prev.plants] }
        : prev,
    );
    closeCreate();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
            Plants
          </h2>
          <p className="text-xs text-gaia-darkText/60">
            {selectedHabitat
              ? `Plants in ${selectedHabitat.title}`
              : "Manage the plants in your habitats"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={selectedHabitatId === null || isLoading}
          className={`${primaryButtonClass} w-full sm:w-auto`}
        >
          <span aria-hidden="true">+</span>
          <span>New Plant</span>
        </button>
      </div>

      {!isLoading && selectedHabitatId === null && habitatsError && (
        <div
          role="alert"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p className="text-gaia-alert-critical font-medium break-words">
            {habitatsError}
          </p>
          <button
            type="button"
            onClick={() => void refetchHabitats()}
            className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && selectedHabitatId === null && !habitatsError && (
        <div className={panelClass}>
          <p className="text-lg text-gaia-darkText/70">
            🌿 Select a habitat to view plants.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Choose a habitat from the selector in the header above.
          </p>
        </div>
      )}

      {isLoading && <PlantGridSkeleton />}

      {error && (
        <div
          role="alert"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p className="text-gaia-alert-critical font-medium break-words">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
          >
            Retry
          </button>
        </div>
      )}

      {current && !error && plants.length === 0 && (
        <div className={`${panelClass} space-y-3`}>
          <p className="text-lg text-gaia-darkText/70">🌱 No plants yet.</p>
          <p className="text-sm text-gray-400">
            Add your first plant to start following it in this habitat.
          </p>
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            Create your first plant
          </button>
        </div>
      )}

      {current && !error && plants.length > 0 && <PlantGrid plants={plants} />}

      {createForHabitat !== null && createForHabitat === selectedHabitatId && (
        <PlantFormModal
          mode="create"
          habitatId={createForHabitat}
          onClose={closeCreate}
          onSaved={handleCreated}
        />
      )}
    </div>
  );
}
