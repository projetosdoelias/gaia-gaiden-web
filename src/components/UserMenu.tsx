"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/lib/context/UserContext";

export default function UserMenu() {
  const { user, isLoading, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if still loading or no user
  if (isLoading || !user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-sm text-gray-400 hidden md:inline">...</span>
      </div>
    );
  }

  // Safely extract initials — username may be undefined on old sessions
  const displayName = user.username || user.email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gaia-greenDeep/10 text-gaia-greenDeep flex items-center justify-center font-bold text-sm">
          {initials}
        </div>
        <span className="text-sm font-medium text-gaia-darkText hidden md:inline">
          {user.username}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform hidden md:block ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {/* User info header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gaia-darkText">
              {user.username || user.email || "User"}
            </p>
            {user.email && (
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign out</span>
          </button>

          {/* Future: refresh token placeholder */}
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 italic">
              Token auto-refresh coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}