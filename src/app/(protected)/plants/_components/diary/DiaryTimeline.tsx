"use client";

import { useState } from "react";
import type { KnownPlantLog, PlantLog } from "@/lib/api/plantLogMapper";
import { formatDayHeading, formatTimeOfDay, localDayKey } from "@/lib/format/date";
import { HealthScoreBadge } from "./healthScore";
import { getLogType, isKnownLog } from "./logTypes";
import { secondaryButtonClass } from "./styles";

const PAGE_SIZE = 20;

type DiaryTimelineProps = {
  logs: PlantLog[];
  onEdit: (log: KnownPlantLog) => void;
  onDelete: (log: PlantLog) => void;
};

function groupByDay(logs: PlantLog[]): { key: string; heading: string; logs: PlantLog[] }[] {
  const groups: { key: string; heading: string; logs: PlantLog[] }[] = [];
  const now = new Date();
  for (const log of logs) {
    const key = localDayKey(log.occurredAt);
    const last = groups.at(-1);
    if (last?.key === key) last.logs.push(log);
    else groups.push({ key, heading: formatDayHeading(log.occurredAt, now), logs: [log] });
  }
  return groups;
}

const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-gaia-darkText/60 hover:bg-gaia-bg hover:text-gaia-darkText transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint";

function DiaryEntry({ log, onEdit, onDelete }: { log: PlantLog } & Omit<DiaryTimelineProps, "logs">) {
  const known = isKnownLog(log) ? log : null;
  const definition = known ? getLogType(known) : null;
  const label = definition?.label ?? "Entry";
  const time = formatTimeOfDay(log.occurredAt);

  return (
    <li className="relative pl-8">
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gaia-greenSignal text-xs ring-4 ring-white"
      >
        {definition?.icon ?? "•"}
      </span>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-1.5">
          <time dateTime={log.occurredAt} className="text-sm font-medium text-gaia-darkText">
            {time}
          </time>
          <span className="text-xs text-gaia-darkText/60">{label}</span>
          {log.healthScore !== null && <HealthScoreBadge score={log.healthScore} />}
        </div>
        <div className="flex shrink-0 -mr-2">
          {known && (
            <button
              type="button"
              onClick={() => onEdit(known)}
              aria-label={`Edit ${label.toLowerCase()} from ${time}`}
              className={iconButtonClass}
            >
              <span aria-hidden="true">✎</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(log)}
            aria-label={`Delete ${label.toLowerCase()} from ${time}`}
            className={`${iconButtonClass} hover:text-gaia-alert-critical`}
          >
            <span aria-hidden="true">🗑</span>
          </button>
        </div>
      </div>
      <div className="mt-1">
        {known && definition ? (
          <definition.Entry log={known} />
        ) : (
          log.notes && (
            <p className="text-sm text-gaia-darkText/80 whitespace-pre-line break-words">{log.notes}</p>
          )
        )}
      </div>
    </li>
  );
}

/** Day-grouped vertical timeline, newest first, with a "Show older" cutoff. */
export default function DiaryTimeline({ logs, onEdit, onDelete }: DiaryTimelineProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const groups = groupByDay(logs.slice(0, visible));

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.heading}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gaia-darkText/50">
            {group.heading}
          </h4>
          {/* Rail: a 1px line behind the icons. */}
          <ol className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
            {group.logs.map((log) => (
              <DiaryEntry key={log.id} log={log} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ol>
        </section>
      ))}
      {logs.length > visible && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className={`${secondaryButtonClass} w-full sm:w-auto`}
          >
            Show older entries ({logs.length - visible})
          </button>
        </div>
      )}
    </div>
  );
}

export function DiarySkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true">
      <span className="sr-only">Loading diary…</span>
      <div className="h-3 w-16 rounded bg-gray-100" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-6 w-6 shrink-0 rounded-full bg-gaia-greenSignal/60" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-32 rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-2/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
