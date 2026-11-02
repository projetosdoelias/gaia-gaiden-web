"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

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

  const fetchHabitats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/habitat");
      if (!response.ok) {
        throw new Error(`Failed to fetch habitats (${response.status})`);
      }
      const data = (await response.json()) as Habitat[];
      setHabitats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load habitats";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch habitats on mount
  useEffect(() => {
    fetchHabitats();
  }, [fetchHabitats]);

  // Auto-select the first habitat when list loads and none is selected
  useEffect(() => {
    if (habitats.length > 0 && selectedHabitatId === null) {
      setSelectedHabitatId(habitats[0].id);
    }
  }, [habitats, selectedHabitatId]);

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