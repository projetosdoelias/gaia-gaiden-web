"use client";

import { useSidebar } from "@/lib/context/SidebarContext";

export default function SidebarToggle() {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl text-gray-500 hover:bg-gaia-bg hover:text-gaia-darkText transition-all lg:hidden"
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
    >
      {/* Hamburger / Close icon */}
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}