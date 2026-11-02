"use client";

import { useHabitat } from "@/lib/context/HabitatContext";

export default function HabitatSelector() {
  const {
    habitats,
    selectedHabitatId,
    setSelectedHabitatId,
    isLoading,
    error,
  } = useHabitat();

  // Don't render anything if there's an error or no habitats yet
  if (error) {
    return (
      <div className="text-xs text-red-500 italic px-2">
        Erro ao carregar habitats
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gaia-greenDeep border-t-transparent" />
        <span className="text-xs text-gray-400">Carregando...</span>
      </div>
    );
  }

  if (habitats.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic px-2">
        Nenhum habitat encontrado
      </div>
    );
  }

  return (
    <select
      value={selectedHabitatId ?? ""}
      onChange={(e) => setSelectedHabitatId(Number(e.target.value))}
      className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 
                 text-gaia-darkText focus:outline-none focus:ring-2 focus:ring-gaia-greenDeep/30 
                 focus:border-gaia-greenDeep cursor-pointer min-w-[160px]"
      aria-label="Selecionar habitat"
    >
      {habitats.map((habitat) => (
        <option key={habitat.id} value={habitat.id}>
          🌱 {habitat.title}
        </option>
      ))}
    </select>
  );
}