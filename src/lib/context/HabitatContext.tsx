"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";

export type Habitat = {
  id: number;
  title: string;
  description: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type HabitatContextValue = {
  /** List of habitats for the logged-in user */
  habitats: Habitat[];
  /** Currently selected habitat ID (null when none selected) */
  selectedHabitatId: number | null;
  /** Select a habitat by ID */
  setSelectedHabitatId: (id: number) => void;
  /** Whether habitats are being loaded */
  isLoading: boolean;
  /** Error message if fetching failed */
  error: string | null;
  /** Refetch habitats from the API */
  refetch: () => Promise<void>;
};

/** Only a non-sensitive habitat id is stored here (never tokens). */
const SELECTED_HABITAT_STORAGE_KEY = "gaia:selectedHabitatId";

function readStoredHabitatId(): number | null {
  try {
    const raw = window.localStorage.getItem(SELECTED_HABITAT_STORAGE_KEY);
    return raw !== null && /^\d+$/.test(raw) ? Number(raw) : null;
  } catch {
    // Storage unavailable (private mode, blocked): no restore.
    return null;
  }
}

function requestHabitats(): Promise<Habitat[]> {
  return apiJson<Habitat[]>("/api/habitat");
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to load habitats";
}

const HabitatContext = createContext<HabitatContextValue | undefined>(
  undefined,
);

export function HabitatProvider({ children }: { children: ReactNode }) {
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [selectedHabitatId, setSelectedHabitatId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stores the list and, if nothing is selected yet, restores the persisted
  // habitat when it still belongs to the user (otherwise the first one).
  // Storage is only read here, after the request resolves (never during
  // render), so this stays hydration-safe.
  const applyHabitats = useCallback((data: Habitat[]) => {
    setHabitats(data);
    if (data.length > 0) {
      const restored = data.find((h) => h.id === readStoredHabitatId());
      const fallbackId = restored ? restored.id : data[0].id;
      setSelectedHabitatId((prev) => prev ?? fallbackId);
    }
  }, []);

  const fetchHabitats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      applyHabitats(await requestHabitats());
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [applyHabitats]);

  // Auto-fetch habitats on mount (initial state is already loading/no error)
  useEffect(() => {
    let cancelled = false;
    requestHabitats()
      .then((data) => {
        if (!cancelled) applyHabitats(data);
      })
      .catch((err: unknown) => {
        if (cancelled || err instanceof SessionExpiredError) return;
        setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyHabitats]);

  // Persist the selection whenever it changes.
  useEffect(() => {
    if (selectedHabitatId === null) return;
    try {
      window.localStorage.setItem(
        SELECTED_HABITAT_STORAGE_KEY,
        String(selectedHabitatId),
      );
    } catch {
      // Ignore storage failures; selection still works in memory.
    }
  }, [selectedHabitatId]);

  const value: HabitatContextValue = {
    habitats,
    selectedHabitatId,
    setSelectedHabitatId,
    isLoading,
    error,
    refetch: fetchHabitats,
  };

  return (
    <HabitatContext.Provider value={value}>
      {children}
    </HabitatContext.Provider>
  );
}

export function useHabitat(): HabitatContextValue {
  const context = useContext(HabitatContext);
  if (context === undefined) {
    throw new Error(
      "useHabitat must be used within a HabitatProvider",
    );
  }
  return context;
}