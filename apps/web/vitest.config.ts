import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@aria/tokens": resolve(__dirname, "./packages/tokens/src/index.json"),
      "@aria/ui": resolve(__dirname, "./packages/ui/src/index.ts"),
      "@aria/api-client": resolve(__dirname, "./packages/api-client/src/index.ts"),
    },
  },
});
