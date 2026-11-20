"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { KnownPlantLog, PlantLog } from "@/lib/api/plantLogMapper";
import type { CreatePlantLogInput, UpdatePlantLogInput } from "@/lib/schemas/plantLog";
import DiaryTimeline, { DiarySkeleton } from "./DiaryTimeline";
import { errorMessage } from "./errorMessage";
import { DeleteLogDialog, EditLogModal } from "./LogDialogs";
import LogForm from "./LogForm";
import { secondaryButtonClass } from "./styles";

type PlantDiaryProps = {
  habitatId: number;
  plantId: number;
  sectionClass: string;
  sectionTitleClass: string;
};

type LoadResult =
  | { key: string; status: "ok"; logs: PlantLog[] }
  | { key: string; status: "error"; message: string };

/** Same order as the backend list: occurredAt desc, id desc. */
function sortLogs(logs: PlantLog[]): PlantLog[] {
  return [...logs].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || b.id - a.id,
  );
}

/** Plant diary: quick-add composer plus a day-grouped timeline of log entries. */
export default function PlantDiary({
  habitatId,
  plantId,
  sectionClass,
  sectionTitleClass,
}: PlantDiaryProps) {
  const baseUrl = `/api/habitat/${habitatId}/plants/${plantId}/logs`;

  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<KnownPlantLog | null>(null);
  const [deleting, setDeleting] = useState<PlantLog | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const composerTriggerRef = useRef<HTMLButtonElement>(null);
  const focusTriggerNext = useRef(false);

  const requestKey = `${baseUrl}:${reloadKey}`;

  useEffect(() => {
    const controller = new AbortController();
    const key = `${baseUrl}:${reloadKey}`;
    apiJson<PlantLog[]>(baseUrl, { signal: controller.signal })
      .then((logs) => {
        if (!controller.signal.aborted) setResult({ key, status: "ok", logs: sortLogs(logs) });
      })
      .catch((err: unknown) => {
        // Session end is already redirecting to /login: no error flash.
        if (controller.signal.aborted || err instanceof SessionExpiredError) return;
        setResult({ key, status: "error", message: errorMessage(err, "Failed to load the diary") });
      });
    return () => controller.abort();
  }, [baseUrl, reloadKey]);

  // Return focus to the "Add" trigger once the composer has collapsed.
  useEffect(() => {
    if (!composerOpen && focusTriggerNext.current) {
      focusTriggerNext.current = false;
      composerTriggerRef.current?.focus();
    }
  }, [composerOpen]);

  const current = result?.key === requestKey ? result : null;

  /** Apply a change to the loaded list; reload if the list isn't loaded. */
  function updateLogs(change: (logs: PlantLog[]) => PlantLog[]) {
    if (current?.status !== "ok") {
      setReloadKey((k) => k + 1);
      return;
    }
    setResult((prev) =>
      prev?.key === requestKey && prev.status === "ok"
        ? { ...prev, logs: sortLogs(change(prev.logs)) }
        : prev,
    );
  }

  function closeComposer() {
    focusTriggerNext.current = true;
    setComposerOpen(false);
  }

  async function handleCreate(body: CreatePlantLogInput) {
    const created = await apiJson<PlantLog>(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    updateLogs((logs) => [created, ...logs]);
    setAnnouncement("Observation added.");
    closeComposer();
  }

  async function handleUpdate(log: KnownPlantLog, body: UpdatePlantLogInput) {
    const updated = await apiJson<PlantLog>(`${baseUrl}/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    updateLogs((logs) => logs.map((l) => (l.id === updated.id ? updated : l)));
    setAnnouncement("Entry updated.");
    setEditing(null);
  }

  async function handleDelete(log: PlantLog) {
    await apiJson<void>(`${baseUrl}/${log.id}`, { method: "DELETE" });
    updateLogs((logs) => logs.filter((l) => l.id !== log.id));
    setAnnouncement("Entry deleted.");
    setDeleting(null);
  }

  let body: ReactNode;
  if (current?.status === "error") {
    body = (
      <div role="alert" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gaia-alert-critical font-medium break-words">{current.message}</p>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={secondaryButtonClass}>
          Retry
        </button>
      </div>
    );
  } else if (current?.status === "ok" && current.logs.length === 0) {
    body = (
      <div className="rounded-xl bg-gaia-bg p-6 text-center space-y-3">
        <p className="text-sm text-gaia-darkText/70">
          🌱 No observations yet. Note how your plant looks today.
        </p>
        {!composerOpen && (
          <button type="button" onClick={() => setComposerOpen(true)} className={secondaryButtonClass}>
            Add the first observation
          </button>
        )}
      </div>
    );
  } else if (current?.status === "ok") {
    body = <DiaryTimeline logs={current.logs} onEdit={setEditing} onDelete={setDeleting} />;
  } else {
    body = <DiarySkeleton />;
  }

  return (
    <section aria-labelledby="plant-diary-title" className={`${sectionClass} space-y-4`}>
      <h3 id="plant-diary-title" className={sectionTitleClass}>
        Diary
      </h3>

      {composerOpen ? (
        <div className="rounded-xl border border-gray-100 bg-gaia-bg/50 p-4">
          <LogForm
            mode="create"
            type="OBSERVATION"
            autoFocus
            onCancel={closeComposer}
            onSubmit={handleCreate}
          />
        </div>
      ) : (
        <button
          ref={composerTriggerRef}
          type="button"
          onClick={() => setComposerOpen(true)}
          className="w-full min-h-11 rounded-xl border border-dashed border-gray-200 px-4 py-3 text-left text-sm text-gaia-darkText/60 hover:border-gaia-greenMint hover:bg-gaia-bg transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint"
        >
          <span aria-hidden="true">＋ </span>Add an observation…
        </button>
      )}

      {body}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {editing && (
        <EditLogModal
          log={editing}
          onClose={() => setEditing(null)}
          onSubmit={(input) => handleUpdate(editing, input)}
        />
      )}
      {deleting && (
        <DeleteLogDialog
          log={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
    </section>
  );
}
