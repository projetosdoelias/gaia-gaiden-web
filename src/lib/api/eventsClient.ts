import { httpClient } from "./httpClient";

export type Event = {
  id: number;
  description: string;
  habitatId: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Events API client.
 *
 * Responsibility:
 * - Knows the NestJS events API contract under /habitat/:id/events.
 * - Communicates event operations to the backend.
 *
 * Uses httpClient underneath — no hidden session or token logic.
 * Authentication header must be provided by the caller (BFF route handler).
 */
export const eventsClient = {
  async list(token: string, habitatId: number): Promise<Event[]> {
    return httpClient(`/habitat/${habitatId}/events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) as Promise<Event[]>;
  },

  async create(
    token: string,
    habitatId: number,
    description: string,
  ): Promise<Event> {
    return httpClient(`/habitat/${habitatId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    }) as Promise<Event>;
  },

  async retrieve(
    token: string,
    habitatId: number,
    eventId: number,
  ): Promise<Event> {
    return httpClient(`/habitat/${habitatId}/events/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) as Promise<Event>;
  },

  async update(
    token: string,
    habitatId: number,
    eventId: number,
    description: string,
  ): Promise<Event> {
    return httpClient(`/habitat/${habitatId}/events/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    }) as Promise<Event>;
  },

  async delete(
    token: string,
    habitatId: number,
    eventId: number,
  ): Promise<void> {
    await httpClient(`/habitat/${habitatId}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};