"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  /** id of the element that labels the dialog (usually its <h3>) */
  labelledBy: string;
  onClose: () => void;
  /** While true, Escape does not close the dialog (request in flight). */
  isBusy?: boolean;
  children: ReactNode;
};

/**
 * Accessible dialog shell shared by the plant dialogs.
 * - role="dialog", aria-modal, aria-labelledby
 * - Escape closes it
 * - focuses `[data-autofocus]` (or the first focusable element) on open
 * - returns focus to the trigger on close
 */
export default function Modal({
  labelledBy,
  onClose,
  isBusy = false,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    onCloseRef.current = onClose;
    isBusyRef.current = isBusy;
  }, [onClose, isBusy]);

  useEffect(() => {
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panel = panelRef.current;
    const target =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(
        "input, textarea, select, button, [href]",
      );
    target?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isBusyRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Keep Tab / Shift+Tab inside the dialog (aria-modal focus trap).
      if (e.key === "Tab" && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !panel.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-4 p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}
