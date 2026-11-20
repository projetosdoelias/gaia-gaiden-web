import { httpClient } from "./httpClient";
import type { PlantLogQuery, PlantLogTypeName } from "@/lib/schemas/plantLog";

/** Plant log as returned by the NestJS backend (dates are ISO strings). */
export type ApiPlantLog = {
  id: number;
  plantId: number;
  type: PlantLogTypeName;
  notes: string | null;
  healthScore: number | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Body accepted by POST .../logs. Never send `null`. */
export type CreatePlantLogApiDto = {
  type: PlantLogTypeName;
  notes?: string;
  healthScore?: number;
  occurredAt?: string;
};

/** Body accepted by PATCH .../logs/:logId (all optional, never `null`). */
export type UpdatePlantLogApiDto = {
  notes?: string;
  healthScore?: number;
  occurredAt?: string;
};

const basePath = (habitatId: number, plantId: number) =>
  `/habitat/${habitatId}/plants/${plantId}/logs`;

/**
 * Plant logs API client.
 *
 * Knows the NestJS contract under /habitat/:habitatId/plants/:plantId/logs.
 * No session logic: the caller (BFF route handler) passes the token.
 */
export const plantLogsClient = {
  async list(
    token: string,
    habitatId: number,
    plantId: number,
    query: PlantLogQuery = {},
  ): Promise<ApiPlantLog[]> {
    return httpClient(basePath(habitatId, plantId), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      params: query,
    }) as Promise<ApiPlantLog[]>;
  },

  async create(
    token: string,
    habitatId: number,
    plantId: number,
    dto: CreatePlantLogApiDto,
  ): Promise<ApiPlantLog> {
    return httpClient(basePath(habitatId, plantId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    }) as Promise<ApiPlantLog>;
  },

  async update(
    token: string,
    habitatId: number,
    plantId: number,
    logId: number,
    dto: UpdatePlantLogApiDto,
  ): Promise<ApiPlantLog> {
    return httpClient(`${basePath(habitatId, plantId)}/${logId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    }) as Promise<ApiPlantLog>;
  },

  async delete(
    token: string,
    habitatId: number,
    plantId: number,
    logId: number,
  ): Promise<void> {
    // Backend returns { deleted: true } (soft delete); the BFF answers 204.
    await httpClient(`${basePath(habitatId, plantId)}/${logId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
