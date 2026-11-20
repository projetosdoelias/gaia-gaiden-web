import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Client code must call the BFF through clientFetch (401 → session end,
  // 403 → ForbiddenError). Server code (src/app/api, src/lib/api) and
  // Server Actions keep native fetch.
  {
    files: [
      "src/app/(protected)/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/lib/context/**/*.{ts,tsx}",
    ],
    ignores: ["src/app/(protected)/**/actions.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Use api/apiJson from '@/lib/api/clientFetch' so 401/403 are handled.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name=/^(window|globalThis|self)$/][property.name='fetch']",
          message:
            "Use api/apiJson from '@/lib/api/clientFetch' so 401/403 are handled.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
