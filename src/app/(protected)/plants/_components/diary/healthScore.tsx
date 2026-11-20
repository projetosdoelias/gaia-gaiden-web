"use client";

import { HEALTH_SCORE_MAX, HEALTH_SCORE_MIN } from "@/lib/schemas/plantLog";
import { fieldErrorClass, linkButtonClass } from "./styles";

export const HEALTH_SCORE_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "OK",
  4: "Good",
  5: "Excellent",
};

const SCORES = Array.from(
  { length: HEALTH_SCORE_MAX - HEALTH_SCORE_MIN + 1 },
  (_, i) => HEALTH_SCORE_MIN + i,
);

/** Presentation only: color of the dot next to a score. */
function scoreDotClass(score: number): string {
  if (score <= 2) return "bg-gaia-alert-critical";
  if (score === 3) return "bg-gaia-alert-warning";
  return "bg-gaia-alert-success";
}

export function HealthScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gaia-bg px-2 py-0.5 text-xs font-medium text-gaia-darkText">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${scoreDotClass(score)}`} />
      <span className="sr-only">Health score</span>
      {score}/{HEALTH_SCORE_MAX} · {HEALTH_SCORE_LABELS[score]}
    </span>
  );
}

type HealthScoreInputProps = {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** The backend can't clear a score once saved, so edit mode hides "Clear". */
  canClear: boolean;
  error?: string;
};

/** Native radio group styled as 1–5 pills (≥40px touch targets). */
export function HealthScoreInput({ id, value, onChange, canClear, error }: HealthScoreInputProps) {
  const errorId = `${id}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="block text-xs font-medium text-gaia-darkText/70 mb-1">
        Health score <span className="font-normal text-gaia-darkText/50">(optional)</span>
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {SCORES.map((score) => (
            <label
              key={score}
              title={HEALTH_SCORE_LABELS[score]}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gaia-darkText transition-all hover:bg-gaia-bg has-[:checked]:border-gaia-greenDeep has-[:checked]:bg-gaia-greenDeep has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gaia-greenMint"
            >
              <input
                type="radio"
                name={id}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                className="sr-only"
              />
              <span aria-hidden="true">{score}</span>
              <span className="sr-only">
                {score} – {HEALTH_SCORE_LABELS[score]}
              </span>
            </label>
          ))}
        </div>
        <span className="text-xs text-gaia-darkText/60" aria-hidden="true">
          {value !== null ? HEALTH_SCORE_LABELS[value] : "1 Poor · 5 Excellent"}
        </span>
        {canClear && value !== null && (
          <button type="button" onClick={() => onChange(null)} className={linkButtonClass}>
            Clear
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
