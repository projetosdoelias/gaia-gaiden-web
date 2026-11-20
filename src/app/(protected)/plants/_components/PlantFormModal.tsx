"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { Plant } from "@/lib/api/plantMapper";
import { isoToDateInput } from "@/lib/format/date";
import {
  createPlantSchema,
  toFormErrors,
  type PlantFormErrors,
  type UpdatePlantInput,
} from "@/lib/schemas/plant";
import Modal from "./Modal";

type PlantFormModalProps = {
  habitatId: number;
  onClose: () => void;
  onSaved: (plant: Plant) => void;
} & ({ mode: "create"; plant?: undefined } | { mode: "edit"; plant: Plant });

type FormState = {
  name: string;
  description: string;
  variety: string;
  germinatedAt: string;
  seedlingAt: string;
};

const DATE_FIELDS = ["germinatedAt", "seedlingAt"] as const;
const TEXT_FIELDS = ["name", "description", "variety"] as const;

function initialState(plant?: Plant): FormState {
  return {
    name: plant?.name ?? "",
    description: plant?.description ?? "",
    variety: plant?.variety ?? "",
    germinatedAt: isoToDateInput(plant?.germinatedAt ?? null),
    seedlingAt: isoToDateInput(plant?.seedlingAt ?? null),
  };
}

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent aria-[invalid=true]:border-gaia-alert-critical";
const labelClass = "block text-xs font-medium text-gaia-darkText/70 mb-1";

export default function PlantFormModal(props: PlantFormModalProps) {
  const { mode, plant, habitatId, onClose, onSaved } = props;
  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    name: `${uid}-name`,
    description: `${uid}-description`,
    variety: `${uid}-variety`,
    germinatedAt: `${uid}-germinatedAt`,
    seedlingAt: `${uid}-seedlingAt`,
  };

  const original = initialState(plant);
  const [values, setValues] = useState<FormState>(original);
  const [errors, setErrors] = useState<PlantFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const setField = (field: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // TODO(api): support clearing stage dates
  // The backend ignores empty dates, so a date that was already set cannot
  // be cleared. We show a hint and leave the field out of the PATCH.
  const isClearingDate = (field: (typeof DATE_FIELDS)[number]) =>
    mode === "edit" && original[field] !== "" && values[field] === "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;

    const parsed = createPlantSchema.safeParse({
      name: values.name,
      description: values.description,
      variety: values.variety,
      germinatedAt: values.germinatedAt || undefined,
      seedlingAt: values.seedlingAt || undefined,
    });
    if (!parsed.success) {
      setErrors(toFormErrors(parsed.error));
      return;
    }

    let body: UpdatePlantInput = parsed.data;
    let url = `/api/habitat/${habitatId}/plants`;
    let method: "POST" | "PATCH" = "POST";

    if (mode === "edit") {
      // Send only the fields that changed.
      const diff: UpdatePlantInput = {};
      for (const field of TEXT_FIELDS) {
        if (parsed.data[field] !== original[field].trim()) {
          diff[field] = parsed.data[field];
        }
      }
      for (const field of DATE_FIELDS) {
        const next = parsed.data[field];
        if (next !== undefined && next !== original[field]) {
          diff[field] = next;
        }
      }
      if (Object.keys(diff).length === 0) {
        onClose();
        return;
      }
      body = diff;
      url = `/api/habitat/${habitatId}/plants/${plant.id}`;
      method = "PATCH";
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setServerError(null);
    try {
      const saved = await apiJson<Plant>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSaved(saved);
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setServerError(
        err instanceof Error ? err.message : "Failed to save plant",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const fieldError = (field: keyof PlantFormErrors) =>
    errors[field] ? (
      <p id={`${ids[field]}-error`} className="mt-1 text-xs text-gaia-alert-critical">
        {errors[field]}
      </p>
    ) : null;

  const describedBy = (field: keyof PlantFormErrors) =>
    errors[field] ? `${ids[field]}-error` : undefined;

  const required = (
    <span className="text-gaia-alert-critical" aria-hidden="true">
      {" "}
      *
    </span>
  );

  return (
    <Modal labelledBy={ids.title} onClose={onClose} isBusy={isSubmitting}>
      <h3 id={ids.title} className="text-lg font-bold text-gaia-greenDeep">
        {mode === "create" ? "New Plant" : "Edit Plant"}
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor={ids.name} className={labelClass}>
            Name{required}
          </label>
          <input
            id={ids.name}
            data-autofocus
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            maxLength={100}
            required
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor={ids.description} className={labelClass}>
            Description{required}
          </label>
          <textarea
            id={ids.description}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            maxLength={1000}
            required
            aria-required="true"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy("description")}
            className={`${inputClass} resize-none`}
          />
          {fieldError("description")}
        </div>

        <div>
          <label htmlFor={ids.variety} className={labelClass}>
            Variety{required}
          </label>
          <input
            id={ids.variety}
            type="text"
            value={values.variety}
            onChange={(e) => setField("variety", e.target.value)}
            maxLength={100}
            placeholder="e.g. Cherry tomato, Genovese basil"
            required
            aria-required="true"
            aria-invalid={errors.variety ? true : undefined}
            aria-describedby={describedBy("variety")}
            className={inputClass}
          />
          {fieldError("variety")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DATE_FIELDS.map((field) => (
            <div key={field}>
              <label htmlFor={ids[field]} className={labelClass}>
                {field === "germinatedAt" ? "Germination date" : "Seedling date"}
              </label>
              <input
                id={ids[field]}
                type="date"
                value={values[field]}
                onChange={(e) => setField(field, e.target.value)}
                aria-invalid={errors[field] ? true : undefined}
                aria-describedby={
                  describedBy(field) ??
                  (isClearingDate(field) ? `${ids[field]}-hint` : undefined)
                }
                className={inputClass}
              />
              {fieldError(field)}
              {isClearingDate(field) && (
                <p
                  id={`${ids[field]}-hint`}
                  className="mt-1 text-xs text-gaia-alert-warning"
                >
                  Clearing a date isn&apos;t supported yet. The current date
                  will be kept.
                </p>
              )}
            </div>
          ))}
        </div>

        {serverError && (
          <p role="alert" className="text-xs text-gaia-alert-critical">
            {serverError}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm px-4 py-2 rounded-xl bg-gaia-greenDeep text-white hover:bg-gaia-greenDeep/90 transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === "create"
              ? isSubmitting
                ? "Creating…"
                : "Create"
              : isSubmitting
                ? "Saving…"
                : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
