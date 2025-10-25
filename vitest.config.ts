import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    test: {
      environment: "node",
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/**/*.spec.ts"],
      testTimeout: 60000, // 60 seconds (Supabase queries are slow)
      hookTimeout: 120000, // 120 seconds for cleanup
      env: {
        ...env,
        SKIP_AUDIT_LOGS: "true",
        AUDIT_ALL_TRANSACTIONS: "false",
      },
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: [
          "src/lib/ledger/**",
          "src/lib/revenue/**",
          "src/app/api/payments/**",
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
