import type { ApiPlantLog } from "./plantLogsClient";
import type { PlantLogTypeName } from "@/lib/schemas/plantLog";

/** Fields shared by every log type (UI shape). */
type PlantLogBase = {
  id: number;
  plantId: number;
  notes: string | null;
  healthScore: number | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ObservationLog = PlantLogBase & { type: "OBSERVATION" };

/**
 * Discriminated union of the log types the UI knows how to render and edit.
 * Add a member here (plus a schema member and a registry entry) per new type,
 * e.g. `| WateringLog` with its typed `details`.
 */
export type KnownPlantLog = ObservationLog;

/** A type the API may return before the UI supports it (rendered generically). */
export type UnknownPlantLog = PlantLogBase & {
  type: Exclude<PlantLogTypeName, KnownPlantLog["type"]>;
};

export type PlantLog = KnownPlantLog | UnknownPlantLog;

/** Backend → UI. Drops `deletedAt` and `details` (unused by OBSERVATION). */
export function toUiPlantLog(log: ApiPlantLog): PlantLog {
  return {
    id: log.id,
    plantId: log.plantId,
    type: log.type,
    notes: log.notes,
    healthScore: log.healthScore,
    occurredAt: log.occurredAt,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  } as PlantLog;
}
