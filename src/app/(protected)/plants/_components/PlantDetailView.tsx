import type { Plant } from "@/lib/api/plantMapper";
import { formatStageDate, formatTimestamp } from "@/lib/format/date";
import PlantDiary from "./diary/PlantDiary";
import PlantImagePlaceholder from "./PlantImagePlaceholder";

type PlantDetailViewProps = {
  plant: Plant;
  habitatId: number;
  onEdit: () => void;
  onDelete: () => void;
};

const sectionClass = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";
const sectionTitleClass =
  "text-sm font-semibold uppercase tracking-wide text-gaia-darkText/60 mb-3";

/**
 * Detail layout split in <section>s so tracking, images and more can be
 * added later as new sections.
 */
export default function PlantDetailView({
  plant,
  habitatId,
  onEdit,
  onDelete,
}: PlantDetailViewProps) {
  // Vegetative / flowering are not editable yet; show them only when set.
  const stages: { label: string; value: string | null }[] = [
    { label: "Germination", value: plant.germinatedAt },
    { label: "Seedling", value: plant.seedlingAt },
    ...(plant.vegetativeAt
      ? [{ label: "Vegetative", value: plant.vegetativeAt }]
      : []),
    ...(plant.floweringAt
      ? [{ label: "Flowering", value: plant.floweringAt }]
      : []),
  ];

  return (
    <article className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight break-words">
            {plant.name}
          </h2>
          {plant.variety && (
            <span className="inline-block max-w-full truncate text-xs font-medium px-2 py-0.5 rounded-full bg-gaia-greenSignal text-gaia-greenDeep">
              {plant.variety}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="w-full sm:w-auto text-sm px-4 py-2 rounded-xl bg-gaia-greenDeep text-white shadow-sm hover:bg-gaia-greenDeep/90 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-full sm:w-auto text-sm px-4 py-2 rounded-xl bg-gaia-alert-critical text-white hover:bg-gaia-alert-critical/90 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section
          aria-label="Plant image"
          className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden self-start"
        >
          <PlantImagePlaceholder name={plant.name} size="large" />
        </section>

        <div className="lg:col-span-2 space-y-6">
          <section aria-labelledby="plant-details-title" className={sectionClass}>
            <h3 id="plant-details-title" className={sectionTitleClass}>
              Details
            </h3>
            <p className="text-sm text-gaia-darkText/80 whitespace-pre-line break-words">
              {plant.description || "No description."}
            </p>
          </section>

          <section aria-labelledby="plant-stages-title" className={sectionClass}>
            <h3 id="plant-stages-title" className={sectionTitleClass}>
              Stages
            </h3>
            <ol className="space-y-3">
              {stages.map((stage) => (
                <li key={stage.label} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      stage.value ? "bg-gaia-greenDeep" : "bg-gray-200"
                    }`}
                  />
                  <span className="text-sm font-medium text-gaia-darkText w-28">
                    {stage.label}
                  </span>
                  <span
                    className={`text-sm ${
                      stage.value ? "text-gaia-darkText/80" : "text-gray-400"
                    }`}
                  >
                    {stage.value ? formatStageDate(stage.value) : "Not set"}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="plant-meta-title" className={sectionClass}>
            <h3 id="plant-meta-title" className={sectionTitleClass}>
              Metadata
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gaia-darkText/60">Created</dt>
                <dd className="text-gaia-darkText/80">
                  {formatTimestamp(plant.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gaia-darkText/60">Last updated</dt>
                <dd className="text-gaia-darkText/80">
                  {formatTimestamp(plant.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          <PlantDiary
            habitatId={habitatId}
            plantId={plant.id}
            sectionClass={sectionClass}
            sectionTitleClass={sectionTitleClass}
          />
        </div>
      </div>
    </article>
  );
}

export function PlantDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <span className="sr-only">Loading plant…</span>
      <div className="space-y-2">
        <div className="h-7 w-1/2 max-w-xs rounded bg-gray-200" />
        <div className="h-4 w-24 rounded-full bg-gaia-greenSignal/60" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-gray-100" />
        <div className="lg:col-span-2 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${sectionClass} space-y-3`}>
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
