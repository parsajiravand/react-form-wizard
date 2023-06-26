import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import banner from "vite-plugin-banner";
import path from 'path'
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  // build config for npm react package 'src/components/FormWizard.tsx'
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/components/FormWizard.tsx"),
      name: "FormWizard",
      fileName: (format) => `react-form-wizard-component.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  plugins: [
    react(),
    banner(`/*
  * ${pkg.name}
  * Creator:${pkg.author}
  * ${pkg.description}
  * v${pkg.version}
  * ${pkg.license} License
  */
 `),
  ],
});
