import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import pkg from "./package.json";

const banner = `/*
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 * (c) ${pkg.author} — ${pkg.license} License
 */
"use client";
`;

/**
 * Every React entry point must stay external. Listing only "react" and
 * "react-dom" lets Rollup inline React's JSX runtime into the bundle, which
 * both bloats the output and pins consumers to the React major the library
 * was built against.
 */
const REACT_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "react-dom/server",
];

export default defineConfig({
  // The library ships from src/main.ts (the public barrel), not from the
  // component file, so the generated types and the runtime entry agree.
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "FormWizard",
      formats: ["es", "umd", "cjs"],
      fileName: (format) =>
        format === "cjs"
          ? "react-form-wizard-component.cjs"
          : `react-form-wizard-component.${format}.js`,
      cssFileName: "react-form-wizard-component",
    },
    sourcemap: true,
    // The demo app's public/ assets have no business in a library tarball.
    copyPublicDir: false,
    rollupOptions: {
      external: REACT_EXTERNALS,
      output: {
        // Without this, Rollup hoists the default export under `.default`,
        // which makes require() of the CJS/UMD build return an empty object.
        exports: "named",
        banner,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "react/jsx-dev-runtime": "jsxDevRuntime",
          "react-dom/client": "ReactDOMClient",
          "react-dom/server": "ReactDOMServer",
        },
      },
      plugins: [
        {
          name: "rfw-style-alias",
          writeBundle() {
            // Back-compat: existing docs tell users to import
            // "react-form-wizard-component/dist/style.css".
            const dist = path.resolve(__dirname, "dist");
            if (!fs.existsSync(dist)) return;
            fs.writeFileSync(
              path.join(dist, "style.css"),
              `@import "./react-form-wizard-component.css";\n`
            );
          },
        },
      ],
    },
  },
  plugins: [react()],
});
