import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["lib"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.app.json"
    })
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es", "cjs", "umd", "iife"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        "@mui/material",
        "@mui/x-date-pickers",
        "@mui/x-date-pickers/AdapterDateFnsJalali",
        "date-fns-jalali",
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-hook-form",
        "react-imask"
      ]
    }
  }
});
