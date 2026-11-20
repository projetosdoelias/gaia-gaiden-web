import { httpClient } from "./httpClient";

/**
 * Plant as returned by the NestJS backend (dates are ISO strings).
 * Uses the backend field names; the UI shape lives in `plantMapper.ts`.
 */
export type ApiPlant = {
  id: number;
  name: string;
  description: string | null;
  strain: string | null;
  germinatedAt: string | null;
  seedlingAt: string | null;
  vegetativeAt: string | null;
  floweringAt: string | null;
  habitatId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Body accepted by POST /habitat/:habitatId/plants. Never send `null`. */
export type CreatePlantApiDto = {
  name: string;
  description?: string;
  strain?: string;
  germinatedAt?: string;
  seedlingAt?: string;
};

/** Body accepted by PATCH /habitat/:habitatId/plants/:id (all optional). */
export type UpdatePlantApiDto = Partial<CreatePlantApiDto>;

/**
 * Plants API client.
 *
 * Knows the NestJS contract under /habitat/:habitatId/plants.
 * No session logic: the caller (BFF route handler) passes the token.
 */
export const plantsClient = {
  async list(token: string, habitatId: number): Promise<ApiPlant[]> {
    return httpClient(`/habitat/${habitatId}/plants`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<ApiPlant[]>;
  },

  async create(
    token: string,
    habitatId: number,
    dto: CreatePlantApiDto,
  ): Promise<ApiPlant> {
    return httpClient(`/habitat/${habitatId}/plants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    }) as Promise<ApiPlant>;
  },

  async retrieve(
    token: string,
    habitatId: number,
    plantId: number,
  ): Promise<ApiPlant> {
    return httpClient(`/habitat/${habitatId}/plants/${plantId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }) as Promise<ApiPlant>;
  },

  async update(
    token: string,
    habitatId: number,
    plantId: number,
    dto: UpdatePlantApiDto,
  ): Promise<ApiPlant> {
    return httpClient(`/habitat/${habitatId}/plants/${plantId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    }) as Promise<ApiPlant>;
  },

  async delete(
    token: string,
    habitatId: number,
    plantId: number,
  ): Promise<void> {
    // Backend returns { deleted: true } (soft delete); the BFF answers 204.
    await httpClient(`/habitat/${habitatId}/plants/${plantId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
