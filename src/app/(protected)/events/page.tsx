"use client";

import { useEffect, useState, useCallback } from "react";
import { useHabitat } from "@/lib/context/HabitatContext";
import type { Event } from "@/lib/api/eventsClient";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortByCreatedAtDesc(events: Event[]): Event[] {
  return [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { selectedHabitatId, habitats } = useHabitat();

  // ── State declarations ─────────────────────────────────────────────────────

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit modal
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete modal
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selectedHabitat = habitats.find((h) => h.id === selectedHabitatId);

  // ── Fetch events ────────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async (signal?: AbortSignal) => {
    if (selectedHabitatId === null) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/habitat/${selectedHabitatId}/events`, {
        signal,
      });

      if (!response.ok) {
        let msg = `Failed to fetch events (${response.status})`;
        try {
          const errBody = (await response.json()) as { message?: string };
          if (errBody.message) msg = errBody.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = (await response.json()) as Event[];
      setEvents(sortByCreatedAtDesc(data));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Failed to load events";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHabitatId]);

  useEffect(() => {
    if (selectedHabitatId !== null) {
      const abortController = new AbortController();

      fetchEvents(abortController.signal);

      return () => {
        abortController.abort();
      };
    } else {
      setEvents([]);
    }
  }, [selectedHabitatId, fetchEvents]);

  // ── Create event ────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    const desc = newDescription.trim();
    if (!desc) {
      setCreateError("Description is required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(`/api/habitat/${selectedHabitatId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });

      if (!response.ok) {
        let msg = `Failed to create event (${response.status})`;
        try {
          const errBody = (await response.json()) as { message?: string };
          if (errBody.message) msg = errBody.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const created = (await response.json()) as Event;
      setEvents(sortByCreatedAtDesc([...events, created]));
      setShowCreateModal(false);
      setNewDescription("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create event";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  // ── Update event ────────────────────────────────────────────────────────────

  const handleUpdate = async () => {
    if (!editingEvent) return;

    const desc = editDescription.trim();
    if (!desc) {
      setUpdateError("Description is required.");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(
        `/api/habitat/${selectedHabitatId}/events/${editingEvent.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: desc }),
        },
      );

      if (!response.ok) {
        let msg = `Failed to update event (${response.status})`;
        try {
          const errBody = (await response.json()) as { message?: string };
          if (errBody.message) msg = errBody.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const updated = (await response.json()) as Event;
      const updatedList = sortByCreatedAtDesc(
        events.map((e) => (e.id === updated.id ? updated : e)),
      );
      setEvents(updatedList);
      setEditingEvent(null);
      setEditDescription("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update event";
      setUpdateError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Delete event ────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingEvent) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/habitat/${selectedHabitatId}/events/${deletingEvent.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        let msg = `Failed to delete event (${response.status})`;
        try {
          const errBody = (await response.json()) as { message?: string };
          if (errBody.message) msg = errBody.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      setEvents(events.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEditDescription(event.description);
    setUpdateError(null);
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setEditDescription("");
    setUpdateError(null);
  };

  const openDeleteModal = (event: Event) => {
    setDeletingEvent(event);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeletingEvent(null);
    setDeleteError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
            Events
          </h2>
          <p className="text-xs text-gaia-darkText/60">
            {selectedHabitatId !== null && selectedHabitat
              ? `Events for ${selectedHabitat.title}`
              : "Monitor activities in your habitats"}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setNewDescription("");
            setCreateError(null);
          }}
          disabled={selectedHabitatId === null || isLoading}
          className="flex items-center space-x-1.5 bg-gaia-greenDeep text-white px-4 py-2 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>+</span>
          <span>New Event</span>
        </button>
      </div>

      {/* No habitat selected */}
      {selectedHabitatId === null && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-lg text-gaia-darkText/70">
            🌿 Select a habitat to view events.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Choose a habitat from the selector in the header above.
          </p>
        </div>
      )}

      {/* Loading */}
      {selectedHabitatId !== null && isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gaia-darkText/60 animate-pulse">
            Loading events…
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-4">
          <p className="text-gaia-alert-critical font-medium">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && selectedHabitatId !== null && events.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-lg text-gaia-darkText/70">
            📋 No events recorded yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first event to start tracking habitat activities.
          </p>
        </div>
      )}

      {/* Event cards */}
      {!isLoading && !error && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gaia-darkText/80 font-medium whitespace-pre-line break-words">
                  {event.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(event.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => openEditModal(event)}
                  disabled={selectedHabitatId === null}
                  className="text-xs px-2.5 py-1 rounded-lg bg-gaia-bg text-gaia-greenDeep border border-gray-100 hover:bg-gray-100 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(event)}
                  disabled={selectedHabitatId === null}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white text-gaia-alert-critical border border-gray-100 hover:bg-red-50 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
{/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gaia-greenDeep">
              New Event
            </h3>
            <div>
              <label className="block text-xs font-medium text-gaia-darkText/70 mb-1">
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                placeholder="What happened?"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent"
              />
            </div>
            {createError && (
              <p className="text-xs text-gaia-alert-critical">
                {createError}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDescription("");
                  setCreateError(null);
                }}
                className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="text-sm px-4 py-2 rounded-xl bg-gaia-greenDeep text-white hover:bg-gaia-greenDeep/90 transition-all disabled:opacity-50"
              >
                {isCreating ? "Creating\u2026" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gaia-greenDeep">
              Edit Event
            </h3>
            <div>
              <label className="block text-xs font-medium text-gaia-darkText/70 mb-1">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                placeholder="What happened?"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent"
              />
            </div>
            {updateError && (
              <p className="text-xs text-gaia-alert-critical">
                {updateError}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="text-sm px-4 py-2 rounded-xl bg-gaia-greenDeep text-white hover:bg-gaia-greenDeep/90 transition-all disabled:opacity-50"
              >
                {isUpdating ? "Saving\u2026" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gaia-darkText">
              Delete Event
            </h3>
            <p className="text-sm text-gaia-darkText/70">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <blockquote className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3 mt-1">
              {deletingEvent.description}
            </blockquote>
            {deleteError && (
              <p className="text-xs text-gaia-alert-critical">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="text-sm px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm px-4 py-2 rounded-xl bg-gaia-alert-critical text-white hover:bg-gaia-alert-critical/90 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting\u2026" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}