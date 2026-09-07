import { httpClient } from "./httpClient";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthResponse = {
  access_token?: string;
};

/**
 * Authentication API client.
 *
 * Responsibility:
 * - Knows the NestJS authentication API contract.
 * - Communicates authentication operations to the backend.
 *
 * Uses httpClient underneath — no hidden session or token logic.
 */
export const authClient = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return (await httpClient("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })) as AuthResponse;
  },

  async logout(): Promise<void> {
    await httpClient("/auth/logout", {
      method: "POST",
    });
  },

  async refresh(): Promise<AuthResponse> {
    return (await httpClient("/auth/refresh", {
      method: "POST",
    })) as AuthResponse;
  },
};