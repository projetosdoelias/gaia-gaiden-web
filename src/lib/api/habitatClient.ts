import { httpClient } from "./httpClient";

export type Habitat = {
  id: number;
  title: string;
  description: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Habitat API client.
 *
 * Responsibility:
 * - Knows the NestJS habitat API contract.
 * - Communicates habitat operations to the backend.
 *
 * Uses httpClient underneath — no hidden session or token logic.
 * Authentication header must be provided by the caller (BFF route handler).
 */
export const habitatClient = {
  async list(token: string): Promise<Habitat[]> {
    return (await httpClient("/habitat", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })) as Habitat[];
  },
};