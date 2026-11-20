import { PLANT_GRID_CLASSES } from "./PlantGrid";

export default function PlantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={PLANT_GRID_CLASSES} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading plants…</span>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-gaia-bg" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-4 w-1/3 rounded-full bg-gaia-greenSignal/60" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
