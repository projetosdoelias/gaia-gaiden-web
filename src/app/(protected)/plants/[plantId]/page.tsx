"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, SessionExpiredError } from "@/lib/api/clientFetch";
import type { Plant } from "@/lib/api/plantMapper";
import { useHabitat } from "@/lib/context/HabitatContext";
import { idParamSchema } from "@/lib/schemas/plant";
import DeletePlantDialog from "../_components/DeletePlantDialog";
import PlantDetailView, {
  PlantDetailSkeleton,
} from "../_components/PlantDetailView";
import PlantFormModal from "../_components/PlantFormModal";

type LoadOutcome =
  | { status: "ok"; plant: Plant }
  | { status: "notFound" }
  | { status: "error"; message: string };

type LoadResult = LoadOutcome & { key: string };

async function fetchPlant(
  habitatId: number,
  plantId: number,
  signal: AbortSignal,
): Promise<LoadOutcome> {
  // `api` (not `apiJson`) so we can tell a 404 apart. A 401 ends the session;
  // a 403 throws ForbiddenError, shown as an error below.
  const response = await api(`/api/habitat/${habitatId}/plants/${plantId}`, {
    signal,
  });
  if (response.status === 404) return { status: "notFound" };
  if (!response.ok) {
    let message = `Failed to load plant (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    return { status: "error", message };
  }
  return { status: "ok", plant: (await response.json()) as Plant };
}

export default function PlantDetailPage({
  params,
}: PageProps<"/plants/[plantId]">) {
  const { plantId: rawPlantId } = use(params);
  const parsedId = idParamSchema.safeParse(rawPlantId);
  const plantId = parsedId.success ? parsedId.data : null;

  const router = useRouter();
  const {
    selectedHabitatId,
    isLoading: habitatsLoading,
    error: habitatsError,
    refetch: refetchHabitats,
  } = useHabitat();

  // The habitat this page was opened with. On refresh, selectedHabitatId goes
  // null → restored id; that first value is pinned. Any later change means
  // the user switched habitats in the header, so we go back to the list.
  const [pinnedHabitatId, setPinnedHabitatId] = useState<number | null>(null);
  if (pinnedHabitatId === null && selectedHabitatId !== null) {
    setPinnedHabitatId(selectedHabitatId);
  }
  const habitatChanged =
    pinnedHabitatId !== null && selectedHabitatId !== pinnedHabitatId;

  useEffect(() => {
    if (habitatChanged) router.push("/plants");
  }, [habitatChanged, router]);

  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);

  const requestKey = `${pinnedHabitatId}:${plantId}:${reloadKey}`;

  useEffect(() => {
    if (pinnedHabitatId === null || plantId === null) return;
    const controller = new AbortController();
    const key = `${pinnedHabitatId}:${plantId}:${reloadKey}`;

    fetchPlant(pinnedHabitatId, plantId, controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted) {
          setResult({ key, ...loaded });
        }
      })
      .catch((err: unknown) => {
        // Session end is already redirecting to /login: no error flash.
        if (controller.signal.aborted || err instanceof SessionExpiredError) {
          return;
        }
        setResult({
          key,
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load plant",
        });
      });

    return () => controller.abort();
  }, [pinnedHabitatId, plantId, reloadKey]);

  const backLink = (
    <Link
      href="/plants"
      className="inline-flex items-center gap-1 text-sm text-gaia-greenDeep hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint"
    >
      <span aria-hidden="true">←</span> Back to plants
    </Link>
  );

  const current = result?.key === requestKey ? result : null;
  const isNotFound = plantId === null || current?.status === "notFound";
  const noHabitat =
    !habitatsLoading && selectedHabitatId === null && pinnedHabitatId === null;

  let content: ReactNode;
  if (isNotFound) {
    content = (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-3">
        <p className="text-lg text-gaia-darkText/70">
          🔎 Plant not found in this habitat.
        </p>
        <Link
          href="/plants"
          className="inline-flex items-center justify-center bg-gaia-greenDeep text-white px-4 py-2 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
        >
          Back to plants
        </Link>
      </div>
    );
  } else if (noHabitat && !habitatsError) {
    content = (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-lg text-gaia-darkText/70">
          🌿 Select a habitat to view this plant.
        </p>
      </div>
    );
  } else if (noHabitat && habitatsError) {
    content = (
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
    );
  } else if (current?.status === "error") {
    content = (
      <div
        role="alert"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <p className="text-gaia-alert-critical font-medium break-words">
          {current.message}
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
        >
          Retry
        </button>
      </div>
    );
  } else if (current?.status === "ok" && !habitatChanged && pinnedHabitatId !== null) {
    content = (
      <PlantDetailView
        plant={current.plant}
        habitatId={pinnedHabitatId}
        onEdit={() => setDialog("edit")}
        onDelete={() => setDialog("delete")}
      />
    );
  } else {
    content = <PlantDetailSkeleton />;
  }

  const loadedPlant =
    current?.status === "ok" && !habitatChanged && pinnedHabitatId !== null
      ? current.plant
      : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* The not-found panel has its own link back. */}
      {!isNotFound && backLink}
      {content}

      {loadedPlant && pinnedHabitatId !== null && dialog === "edit" && (
        <PlantFormModal
          mode="edit"
          plant={loadedPlant}
          habitatId={pinnedHabitatId}
          onClose={() => setDialog(null)}
          onSaved={(updated) => {
            setResult({ key: requestKey, status: "ok", plant: updated });
            setDialog(null);
          }}
        />
      )}

      {loadedPlant && pinnedHabitatId !== null && dialog === "delete" && (
        <DeletePlantDialog
          plant={loadedPlant}
          habitatId={pinnedHabitatId}
          onClose={() => setDialog(null)}
          onDeleted={() => router.push("/plants")}
        />
      )}
    </div>
  );
}
