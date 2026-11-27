"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useHabitat } from "@/lib/context/HabitatContext";

/**
 * Header habitat picker.
 *
 * A custom listbox instead of a native <select>: the native options popup is
 * drawn by the browser/OS and can't be positioned with CSS (it showed up in
 * the wrong place on mobile). This one always opens right under the button.
 */
export default function HabitatSelector() {
  const {
    habitats,
    selectedHabitatId,
    setSelectedHabitatId,
    isLoading,
    error,
  } = useHabitat();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // Close on a click/tap outside.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  // Move keyboard focus into the list when it opens.
  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  if (error) {
    return (
      <div className="text-xs text-gaia-alert-critical italic px-2">
        Failed to load habitats
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gaia-greenDeep border-t-transparent" />
        <span className="text-xs text-gray-400">Loading…</span>
      </div>
    );
  }

  if (habitats.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic px-2">No habitats found</div>
    );
  }

  const selectedIndex = Math.max(
    0,
    habitats.findIndex((h) => h.id === selectedHabitatId),
  );
  const selected = habitats[selectedIndex];

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const choose = (index: number) => {
    setSelectedHabitatId(habitats[index].id);
    close(true);
  };

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = habitats.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={`Habitat: ${selected.title}`}
        className="flex w-full items-center justify-between gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 sm:py-1.5
                   text-gaia-darkText focus:outline-none focus:ring-2 focus:ring-gaia-greenDeep/30 focus:border-gaia-greenDeep
                   sm:w-auto sm:min-w-[160px] sm:max-w-[240px]"
      >
        <span className="truncate">🌱 {selected.title}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label="Select habitat"
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-max min-w-full max-w-[min(18rem,calc(100vw-2rem))]
                     overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg focus:outline-none"
        >
          {habitats.map((habitat, index) => {
            const isSelected = habitat.id === selected.id;
            const isActive = index === activeIndex;
            return (
              <li
                key={habitat.id}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(index)}
                onPointerMove={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 sm:py-2 text-sm text-gaia-darkText ${
                  isActive ? "bg-gaia-bg" : ""
                } ${isSelected ? "font-semibold text-gaia-greenDeep" : ""}`}
              >
                <span className="truncate">🌱 {habitat.title}</span>
                {isSelected && (
                  <svg
                    className="ml-auto h-4 w-4 shrink-0 text-gaia-greenDeep"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
