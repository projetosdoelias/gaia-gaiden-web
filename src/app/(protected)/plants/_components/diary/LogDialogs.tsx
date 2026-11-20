"use client";

import { useId, useRef, useState } from "react";
import { SessionExpiredError } from "@/lib/api/clientFetch";
import type { KnownPlantLog, PlantLog } from "@/lib/api/plantLogMapper";
import type { UpdatePlantLogInput } from "@/lib/schemas/plantLog";
import { formatTimestamp } from "@/lib/format/date";
import Modal from "../Modal";
import { errorMessage } from "./errorMessage";
import LogForm from "./LogForm";
import { getLogType } from "./logTypes";
import { dangerButtonClass, secondaryButtonClass } from "./styles";

export function EditLogModal({
  log,
  onClose,
  onSubmit,
}: {
  log: KnownPlantLog;
  onClose: () => void;
  onSubmit: (body: UpdatePlantLogInput) => Promise<void>;
}) {
  const titleId = useId();
  const [isBusy, setIsBusy] = useState(false);
  const { label } = getLogType(log);

  return (
    <Modal labelledBy={titleId} onClose={onClose} isBusy={isBusy}>
      <h3 id={titleId} className="text-lg font-bold text-gaia-greenDeep">
        Edit {label.toLowerCase()}
      </h3>
      <LogForm
        mode="edit"
        log={log}
        onCancel={onClose}
        onSubmit={async (body) => {
          setIsBusy(true);
          try {
            await onSubmit(body);
          } finally {
            setIsBusy(false);
          }
        }}
      />
    </Modal>
  );
}

export function DeleteLogDialog({
  log,
  onClose,
  onConfirm,
}: {
  log: PlantLog;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const titleId = useId();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletingRef = useRef(false);

  async function handleDelete() {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setError(errorMessage(err, "Failed to delete the entry"));
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} isBusy={isDeleting}>
      <h3 id={titleId} className="text-lg font-bold text-gaia-darkText">
        Delete entry
      </h3>
      <p className="text-sm text-gaia-darkText/70">
        Are you sure you want to delete this diary entry? This action cannot be undone.
      </p>
      <blockquote className="text-sm text-gaia-darkText border-l-2 border-gray-200 pl-3 space-y-1">
        <span className="block font-medium">{formatTimestamp(log.occurredAt)}</span>
        {log.notes && (
          <span className="block text-gaia-darkText/70 line-clamp-2 break-words">{log.notes}</span>
        )}
      </blockquote>
      {error && (
        <p role="alert" className="text-xs text-gaia-alert-critical break-words">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <button type="button" data-autofocus onClick={onClose} disabled={isDeleting} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete} disabled={isDeleting} className={dangerButtonClass}>
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
