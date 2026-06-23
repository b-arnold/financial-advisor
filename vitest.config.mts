import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit tests cover the pure logic in lib/ (formatting, selectors, routing and the
// store reducer), so a Node environment is enough — no jsdom/DOM needed. The react
// plugin is here only so the "use client" store module (a .tsx file) transforms
// cleanly when its reducer is imported. resolve.tsconfigPaths wires up the @/* alias
// natively (Vite handles this now, so no vite-tsconfig-paths plugin is needed).
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
  },
});
