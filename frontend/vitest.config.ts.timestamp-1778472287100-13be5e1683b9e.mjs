// vitest.config.ts
import { defineConfig } from "file:///mnt/d/Projects/astrology-saas-platform/node_modules/vitest/dist/config.js";
import react from "file:///mnt/d/Projects/astrology-saas-platform/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "/mnt/d/Projects/astrology-saas-platform/frontend";
var vitest_config_default = defineConfig({
  plugins: [react()],
  root: path.resolve(__vite_injected_original_dirname),
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/pages/**/*.{ts,tsx}",
        "src/hooks/**/*.ts",
        "src/services/**/*.ts",
        "src/stores/**/*.ts",
        "src/utils/**/*.ts"
      ],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "src/**/__tests__/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/store/**",
        "src/types/**",
        "src/assets/**"
      ],
      // 80% coverage requirement (improved from 35% -> 54% -> 65% -> 80%)
      thresholds: {
        lines: 65,
        functions: 60,
        branches: 55,
        statements: 65
      },
      perFile: false
    },
    // Timeout for async operations
    testTimeout: 1e4,
    // Use fake timers for consistent tests
    useFakeTimers: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
      "@pages": path.resolve(__vite_injected_original_dirname, "./src/pages"),
      "@services": path.resolve(__vite_injected_original_dirname, "./src/services"),
      "@hooks": path.resolve(__vite_injected_original_dirname, "./src/hooks"),
      "@stores": path.resolve(__vite_injected_original_dirname, "./src/stores"),
      "@utils": path.resolve(__vite_injected_original_dirname, "./src/utils")
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tbnQvZC9Qcm9qZWN0cy9hc3Ryb2xvZ3ktc2Fhcy1wbGF0Zm9ybS9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9kL1Byb2plY3RzL2FzdHJvbG9neS1zYWFzLXBsYXRmb3JtL2Zyb250ZW5kL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9kL1Byb2plY3RzL2FzdHJvbG9neS1zYWFzLXBsYXRmb3JtL2Zyb250ZW5kL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvX190ZXN0c19fL3NldHVwLnRzJ10sXG4gICAgaW5jbHVkZTogWydzcmMvKiovX190ZXN0c19fLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeH0nLCAnc3JjLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeH0nXSxcbiAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICdkaXN0JywgJ2UyZSddLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbicsICdodG1sJywgJ2xjb3YnXSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3NyYy9jb21wb25lbnRzLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAnc3JjL3BhZ2VzLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAnc3JjL2hvb2tzLyoqLyoudHMnLFxuICAgICAgICAnc3JjL3NlcnZpY2VzLyoqLyoudHMnLFxuICAgICAgICAnc3JjL3N0b3Jlcy8qKi8qLnRzJyxcbiAgICAgICAgJ3NyYy91dGlscy8qKi8qLnRzJyxcbiAgICAgIF0sXG4gICAgICBleGNsdWRlOiBbXG4gICAgICAgICdub2RlX21vZHVsZXMvJyxcbiAgICAgICAgJ3NyYy9fX3Rlc3RzX18vJyxcbiAgICAgICAgJ3NyYy8qKi9fX3Rlc3RzX18vKionLFxuICAgICAgICAnKiovKi5kLnRzJyxcbiAgICAgICAgJyoqLyouY29uZmlnLionLFxuICAgICAgICAnKiovbW9ja0RhdGEnLFxuICAgICAgICAnKiovKi50ZXN0Lnt0cyx0c3h9JyxcbiAgICAgICAgJyoqLyouc3BlYy57dHMsdHN4fScsXG4gICAgICAgICdzcmMvbWFpbi50c3gnLFxuICAgICAgICAnc3JjL3ZpdGUtZW52LmQudHMnLFxuICAgICAgICAnc3JjL3N0b3JlLyoqJyxcbiAgICAgICAgJ3NyYy90eXBlcy8qKicsXG4gICAgICAgICdzcmMvYXNzZXRzLyoqJyxcbiAgICAgIF0sXG4gICAgICAvLyA4MCUgY292ZXJhZ2UgcmVxdWlyZW1lbnQgKGltcHJvdmVkIGZyb20gMzUlIC0+IDU0JSAtPiA2NSUgLT4gODAlKVxuICAgICAgdGhyZXNob2xkczoge1xuICAgICAgICBsaW5lczogNjUsXG4gICAgICAgIGZ1bmN0aW9uczogNjAsXG4gICAgICAgIGJyYW5jaGVzOiA1NSxcbiAgICAgICAgc3RhdGVtZW50czogNjUsXG4gICAgICB9LFxuICAgICAgcGVyRmlsZTogZmFsc2UsXG4gICAgfSxcbiAgICAvLyBUaW1lb3V0IGZvciBhc3luYyBvcGVyYXRpb25zXG4gICAgdGVzdFRpbWVvdXQ6IDEwMDAwLFxuICAgIC8vIFVzZSBmYWtlIHRpbWVycyBmb3IgY29uc2lzdGVudCB0ZXN0c1xuICAgIHVzZUZha2VUaW1lcnM6IHRydWUsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICdAY29tcG9uZW50cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQHBhZ2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3BhZ2VzJyksXG4gICAgICAnQHNlcnZpY2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NlcnZpY2VzJyksXG4gICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hvb2tzJyksXG4gICAgICAnQHN0b3Jlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zdG9yZXMnKSxcbiAgICAgICdAdXRpbHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMnKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNVLFNBQVMsb0JBQW9CO0FBQ25XLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU0sS0FBSyxRQUFRLGdDQUFTO0FBQUEsRUFDNUIsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLDBCQUEwQjtBQUFBLElBQ3ZDLFNBQVMsQ0FBQyw4Q0FBOEMsK0JBQStCO0FBQUEsSUFDdkYsU0FBUyxDQUFDLGdCQUFnQixRQUFRLEtBQUs7QUFBQSxJQUN2QyxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQ3pDLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWTtBQUFBLFFBQ1YsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2Q7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYO0FBQUE7QUFBQSxJQUVBLGFBQWE7QUFBQTtBQUFBLElBRWIsZUFBZTtBQUFBLEVBQ2pCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsZUFBZSxLQUFLLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsTUFDekQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLGFBQWEsS0FBSyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ3JELFVBQVUsS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxNQUMvQyxXQUFXLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDakQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
