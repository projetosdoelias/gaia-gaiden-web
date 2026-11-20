import type { ReactNode } from "react";
import type { Plant } from "@/lib/api/plantMapper";
import PlantCard from "./PlantCard";

export const PLANT_GRID_CLASSES =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4";

type PlantGridProps = {
  plants: Plant[];
  /**
   * Rendered after the grid. Reserved for a future infinite-scroll
   * sentinel (IntersectionObserver "load more"). The backend has no
   * pagination yet, so nothing passes it today.
   */
  footer?: ReactNode;
};

export default function PlantGrid({ plants, footer }: PlantGridProps) {
  return (
    <div className="space-y-4">
      <ul className={PLANT_GRID_CLASSES}>
        {plants.map((plant) => (
          <li key={plant.id} className="h-full">
            <PlantCard plant={plant} />
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}
