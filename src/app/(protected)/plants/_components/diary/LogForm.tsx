"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SessionExpiredError } from "@/lib/api/clientFetch";
import type { KnownPlantLog } from "@/lib/api/plantLogMapper";
import { dateTimeLocalToIso, isoToDateTimeLocal } from "@/lib/format/date";
import {
  createPlantLogSchema,
  toPlantLogFormErrors,
  updatePlantLogSchema,
  type CreatePlantLogInput,
  type PlantLogFormErrors,
  type UpdatePlantLogInput,
} from "@/lib/schemas/plantLog";
import { errorMessage } from "./errorMessage";
import { LOG_TYPES, type LogFormValues } from "./logTypes";
import {
  fieldErrorClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./styles";

type LogFormProps = {
  onCancel: () => void;
  /** Focus the first field on mount (the Modal already does this for edit). */
  autoFocus?: boolean;
} & (
  | {
      mode: "create";
      type: KnownPlantLog["type"];
      log?: undefined;
      onSubmit: (body: CreatePlantLogInput) => Promise<void>;
    }
  | {
      mode: "edit";
      type?: undefined;
      log: KnownPlantLog;
      onSubmit: (body: UpdatePlantLogInput) => Promise<void>;
    }
);

/** Client-side hint only; the backend enforces the rule (with 60s tolerance). */
const FUTURE_TOLERANCE_MS = 60_000;

export default function LogForm(props: LogFormProps) {
  const { mode, onCancel, autoFocus = false } = props;
  const type = mode === "edit" ? props.log.type : props.type;
  const definition = LOG_TYPES[type];

  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);

  const original: LogFormValues = {
    notes: props.log?.notes ?? "",
    healthScore: props.log?.healthScore ?? null,
  };
  const originalWhen = props.log ? isoToDateTimeLocal(props.log.occurredAt) : "";

  const [values, setValues] = useState<LogFormValues>(original);
  // Create: "now" leaves occurredAt out so the backend stamps the save time.
  const [whenMode, setWhenMode] = useState<"now" | "custom">(mode === "edit" ? "custom" : "now");
  const [when, setWhen] = useState(originalWhen);
  const [errors, setErrors] = useState<PlantLogFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      formRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
  }, [autoFocus]);

  const whenId = `${idPrefix}-when`;
  const whenErrorId = `${whenId}-error`;

  function setField<F extends keyof LogFormValues>(field: F, value: LogFormValues[F]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, ...(field === "healthScore" ? { notes: undefined } : {}) }));
  }

  function validateWhen(): { ok: true; iso?: string } | { ok: false; message: string } {
    if (whenMode === "now") return { ok: true };
    const iso = dateTimeLocalToIso(when);
    if (!iso) return { ok: false, message: "Enter a date and time" };
    if (new Date(iso).getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      return { ok: false, message: "The date can't be in the future" };
    }
    return { ok: true, iso };
  }

  function buildBody():
    | { ok: true; body: CreatePlantLogInput | UpdatePlantLogInput | null }
    | { ok: false; errors: PlantLogFormErrors } {
    const whenResult = validateWhen();
    const notes = values.notes.trim();

    if (mode === "create") {
      const parsed = createPlantLogSchema.safeParse({
        type,
        notes: notes || undefined,
        healthScore: values.healthScore ?? undefined,
        occurredAt: whenResult.ok ? whenResult.iso : undefined,
      });
      if (!parsed.success || !whenResult.ok) {
        return {
          ok: false,
          errors: {
            ...(parsed.success ? {} : toPlantLogFormErrors(parsed.error)),
            ...(whenResult.ok ? {} : { occurredAt: whenResult.message }),
          },
        };
      }
      return { ok: true, body: parsed.data };
    }

    // Edit: send only what changed. The backend can't clear a field.
    const diff: UpdatePlantLogInput = {};
    const fieldErrors: PlantLogFormErrors = {};
    if (notes !== original.notes.trim()) {
      if (notes) diff.notes = notes;
      else fieldErrors.notes = "Notes can't be removed once saved. Delete the entry instead.";
    }
    if (values.healthScore !== null && values.healthScore !== original.healthScore) {
      diff.healthScore = values.healthScore;
    }
    if (!whenResult.ok) fieldErrors.occurredAt = whenResult.message;
    else if (when !== originalWhen && whenResult.iso) diff.occurredAt = whenResult.iso;

    if (Object.keys(fieldErrors).length > 0) return { ok: false, errors: fieldErrors };
    if (Object.keys(diff).length === 0) return { ok: true, body: null };

    const parsed = updatePlantLogSchema.safeParse(diff);
    if (!parsed.success) return { ok: false, errors: toPlantLogFormErrors(parsed.error) };
    return { ok: true, body: parsed.data };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;

    const result = buildBody();
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    if (result.body === null) {
      onCancel(); // nothing changed
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setServerError(null);
    try {
      if (props.mode === "create") {
        await props.onSubmit(result.body as CreatePlantLogInput);
      } else {
        await props.onSubmit(result.body as UpdatePlantLogInput);
      }
      // The parent usually unmounts the form on success; reset in case it doesn't.
      submittingRef.current = false;
      setIsSubmitting(false);
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setServerError(errorMessage(err, "Failed to save the entry"));
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const { Fields } = definition;
  const submitLabel = mode === "create" ? "Add entry" : "Save";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      <Fields idPrefix={idPrefix} mode={mode} values={values} errors={errors} onChange={setField} />

      <div>
        {whenMode === "now" ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-gaia-darkText/80">
            <span className="text-xs font-medium text-gaia-darkText/70">When</span>
            <span>Now</span>
            <button
              type="button"
              onClick={() => {
                setWhen(isoToDateTimeLocal(new Date()));
                setWhenMode("custom");
              }}
              className={linkButtonClass}
            >
              Change
            </button>
          </p>
        ) : (
          <>
            <label htmlFor={whenId} className={labelClass}>
              When
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                id={whenId}
                type="datetime-local"
                value={when}
                max={isoToDateTimeLocal(new Date())}
                onChange={(e) => {
                  setWhen(e.target.value);
                  setErrors((prev) => ({ ...prev, occurredAt: undefined }));
                }}
                aria-invalid={errors.occurredAt ? true : undefined}
                aria-describedby={errors.occurredAt ? whenErrorId : undefined}
                className={`${inputClass} sm:max-w-64`}
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => {
                    setWhenMode("now");
                    setErrors((prev) => ({ ...prev, occurredAt: undefined }));
                  }}
                  className={`${linkButtonClass} self-start sm:self-auto`}
                >
                  Use now
                </button>
              )}
            </div>
          </>
        )}
        {errors.occurredAt && (
          <p id={whenErrorId} className={fieldErrorClass}>
            {errors.occurredAt}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-xs text-gaia-alert-critical break-words">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
