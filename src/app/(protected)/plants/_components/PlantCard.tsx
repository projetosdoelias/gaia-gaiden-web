import Link from "next/link";
import type { Plant } from "@/lib/api/plantMapper";
import { formatStageDate } from "@/lib/format/date";
import PlantImagePlaceholder from "./PlantImagePlaceholder";

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/plants/${plant.id}`}
      className="group h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:border-gaia-greenMint focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint focus-visible:ring-offset-2"
    >
      <PlantImagePlaceholder name={plant.name} />

      <div className="flex-1 flex flex-col gap-2 p-4">
        <h3 className="font-semibold text-gaia-darkText truncate group-hover:text-gaia-greenDeep">
          {plant.name}
        </h3>

        {plant.variety && (
          <span className="self-start max-w-full truncate text-xs font-medium px-2 py-0.5 rounded-full bg-gaia-greenSignal text-gaia-greenDeep">
            {plant.variety}
          </span>
        )}

        {plant.description && (
          <p className="text-sm text-gaia-darkText/70 line-clamp-2 break-words">
            {plant.description}
          </p>
        )}

        {plant.germinatedAt && (
          <p className="mt-auto pt-1 text-xs text-gray-400">
            Germinated {formatStageDate(plant.germinatedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
