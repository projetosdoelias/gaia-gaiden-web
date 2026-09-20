export class APIClientError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIClientError";
  }
}

export class NetworkError extends Error {
  constructor(
    public originalError: unknown,
    message?: string
  ) {
    super(message ?? "Network request failed");
    this.name = "NetworkError";
  }
}

export type HttpOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;
};