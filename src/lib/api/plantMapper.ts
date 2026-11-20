import type {
  ApiPlant,
  CreatePlantApiDto,
  UpdatePlantApiDto,
} from "./plantsClient";
import type { CreatePlantInput, UpdatePlantInput } from "@/lib/schemas/plant";

/**
 * Backend ↔ UI mapping for plants.
 *
 * TEMPORARY: the backend still calls the field `strain`. The platform is
 * plant-agnostic, so the UI uses `variety`. This mapper (used only by the
 * BFF) is the single place that knows both names. Remove it once the API
 * renames the field.
 */

/** UI-facing plant shape. */
export type Plant = {
  id: number;
  name: string;
  description: string | null;
  variety: string | null;
  germinatedAt: string | null;
  seedlingAt: string | null;
  vegetativeAt: string | null;
  floweringAt: string | null;
  habitatId: number;
  createdAt: string;
  updatedAt: string;
};

export function toUiPlant(plant: ApiPlant): Plant {
  return {
    id: plant.id,
    name: plant.name,
    description: plant.description,
    variety: plant.strain,
    germinatedAt: plant.germinatedAt,
    seedlingAt: plant.seedlingAt,
    vegetativeAt: plant.vegetativeAt,
    floweringAt: plant.floweringAt,
    habitatId: plant.habitatId,
    createdAt: plant.createdAt,
    updatedAt: plant.updatedAt,
  };
}

/** `YYYY-MM-DD` → ISO string at UTC midnight. */
function toUtcMidnightIso(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function toUpdateDto(input: UpdatePlantInput): UpdatePlantApiDto {
  // Only defined keys are copied: the backend rejects `null` and ignores
  // empty dates, so neither is ever sent.
  const dto: UpdatePlantApiDto = {};
  if (input.name !== undefined) dto.name = input.name;
  if (input.description !== undefined) dto.description = input.description;
  if (input.variety !== undefined) dto.strain = input.variety;
  if (input.germinatedAt !== undefined) {
    dto.germinatedAt = toUtcMidnightIso(input.germinatedAt);
  }
  if (input.seedlingAt !== undefined) {
    dto.seedlingAt = toUtcMidnightIso(input.seedlingAt);
  }
  return dto;
}

export function toCreateDto(input: CreatePlantInput): CreatePlantApiDto {
  return { ...toUpdateDto(input), name: input.name };
}
