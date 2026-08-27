/**
 * Copy the opt-in legacy skin into dist.
 *
 * It is deliberately not bundled into styles.css: the v1 appearance is roughly
 * 1.5 kB gzipped that most sites will never use. Consumers who want it import
 * `react-form-wizard-component/legacy.css` alongside the default stylesheet.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");

if (!existsSync(dist)) {
  console.error("dist not found — run the bundle build first.");
  process.exit(1);
}

await mkdir(dist, { recursive: true });
await copyFile(join(root, "src/styles/legacy.css"), join(dist, "legacy.css"));
await copyFile(join(root, "src/styles/tailwind.css"), join(dist, "tailwind.css"));
console.log("css: dist/legacy.css + dist/tailwind.css written (opt-in)");
