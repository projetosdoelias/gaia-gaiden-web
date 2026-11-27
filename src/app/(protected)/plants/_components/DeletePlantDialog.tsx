"use client";

import { useId, useRef, useState } from "react";
import { apiJson, SessionExpiredError } from "@/lib/api/clientFetch";
import type { Plant } from "@/lib/api/plantMapper";
import Modal from "./Modal";

type DeletePlantDialogProps = {
  habitatId: number;
  plant: Plant;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeletePlantDialog({
  habitatId,
  plant,
  onClose,
  onDeleted,
}: DeletePlantDialogProps) {
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
      await apiJson<void>(`/api/habitat/${habitatId}/plants/${plant.id}`, {
        method: "DELETE",
      });
      onDeleted();
    } catch (err) {
      // Session end is already redirecting to /login: no error flash.
      if (err instanceof SessionExpiredError) return;
      setError(err instanceof Error ? err.message : "Failed to delete plant");
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} isBusy={isDeleting}>
      <h3 id={titleId} className="text-lg font-bold text-gaia-darkText">
        Delete Plant
      </h3>
      <p className="text-sm text-gaia-darkText/70">
        Are you sure you want to delete this plant? This action cannot be
        undone.
      </p>
      <blockquote className="text-sm font-medium text-gaia-darkText border-l-2 border-gray-200 pl-3 break-words">
        {plant.name}
      </blockquote>
      {error && (
        <p role="alert" className="text-xs text-gaia-alert-critical">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          disabled={isDeleting}
          className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm px-4 py-2 rounded-xl bg-gaia-alert-critical text-white hover:bg-gaia-alert-critical/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
