"use client";

import { Suspense, useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const DEFAULT_REDIRECT = "/dashboard";

/**
 * Shown when the app ended the session (`?reason=session_expired`).
 * Lives in its own Suspense boundary so useSearchParams doesn't opt the
 * whole page out of prerendering.
 */
function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("reason") !== "session_expired") return null;

  return (
    <div
      role="status"
      className="px-4 py-3 text-sm text-gaia-darkText bg-gaia-alert-warning/10 border border-gaia-alert-warning/30 rounded-xl"
    >
      Your session has expired. Please sign in again.
    </div>
  );
}

/**
 * Prevents open redirects: only same-origin relative paths are allowed.
 * Rejects absolute URLs, protocol-relative ("//evil.com") and
 * backslash tricks ("/\evil.com") by resolving against the current origin.
 */
function getSafeRedirect(redirect: string | null): string {
  if (!redirect || !redirect.startsWith("/")) return DEFAULT_REDIRECT;

  try {
    const url = new URL(redirect, window.location.origin);
    if (url.origin !== window.location.origin) return DEFAULT_REDIRECT;
    return url.pathname + url.search + url.hash;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const validatedData = loginSchema.parse(data);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
        credentials: "include",
      });

      if (!response.ok) {
        // The login route returns `{ success: false, error }` for auth/backend
        // failures and `{ message, errors }` for validation failures.
        let errorMessage = "Login failed";
        if (response.status === 401) {
          throw new Error("Invalid username or password.");
        }
        try {
          const errorData = (await response.json()) as {
            error?: string;
            message?: string;
          };
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Non-JSON error body: keep the generic message.
        }
        throw new Error(errorMessage);
      }

      // Handle redirect — go to dashboard after login
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = getSafeRedirect(urlParams.get("redirect"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent disabled:opacity-60";
  const labelClass = "block text-xs font-medium text-gaia-darkText/70 mb-1";

  return (
    <div className="min-h-dvh bg-gaia-bg flex flex-col justify-between p-4 sm:p-6 md:p-12 antialiased selection:bg-gaia-greenMint selection:text-gaia-greenDeep">
      {/* Top bar: same brand block as the landing page */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint"
        >
          <div className="w-10 h-10 rounded-xl bg-gaia-greenDeep flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 rounded-full border-2 border-gaia-greenMint flex items-center justify-center">
              <div className="w-1 h-1 bg-gaia-greenMint rounded-full" />
            </div>
          </div>
          <div>
            <span className="block text-xl font-bold text-gaia-greenDeep tracking-tight leading-none">
              Gaia
            </span>
            <span className="text-xs font-semibold text-gaia-greenDeep/60 tracking-wider uppercase">
              Garden
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-sm font-semibold text-gaia-greenDeep hover:opacity-80 transition-all border-b-2 border-gaia-greenDeep/20 hover:border-gaia-greenDeep pb-0.5"
        >
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs text-gaia-darkText/60">
              Monitor and automate your habitats.
            </p>
          </div>

          <Suspense fallback={null}>
            <SessionExpiredNotice />
          </Suspense>

          {error && (
            <div
              role="alert"
              className="px-4 py-3 text-sm text-gaia-alert-critical bg-gaia-alert-critical/10 border border-gaia-alert-critical/20 rounded-xl"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className={labelClass}>
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={inputClass}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-gaia-greenDeep text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gaia-greenMint"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  <span>Sign in</span>
                  <span className="ml-2 text-gaia-greenMint" aria-hidden="true">
                    →
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto flex items-center justify-center text-[11px] text-gaia-darkText/40 tracking-wide">
        <span>GAIA GARDEN AGROTECH SYSTEMS &bull; ENTERPRISE GRADE</span>
      </footer>
    </div>
  );
}
