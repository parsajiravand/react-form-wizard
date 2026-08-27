/**
 * Post-process the emitted declarations.
 *
 * 1. Strip side-effect stylesheet imports. `tsc` copies `import "../index.css"`
 *    into the .d.ts, but no such file exists beside the declarations, so every
 *    resolution mode reports an unresolved import. Style imports carry no type
 *    information, so dropping them is lossless.
 *
 * 2. Mirror the tree as CommonJS. TypeScript infers ESM-vs-CJS for a
 *    declaration file from its extension and the nearest package.json "type";
 *    pointing the `require` condition at a .d.ts under `"type": "module"` makes
 *    the package report as "masquerading as ESM" and breaks require() for
 *    TypeScript consumers. Relative specifiers are rewritten from `./x.js` to
 *    `./x.cjs` so each file resolves to its sibling .d.cts.
 */
import { cp, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const esmDir = join(root, "dist/types");
const cjsDir = join(root, "dist/types-cjs");

if (!existsSync(esmDir)) {
  console.error(
    "dist/types not found — run the declaration build before this script."
  );
  process.exit(1);
}

const STYLE_IMPORT = /^\s*import\s+["'][^"']+\.(?:css|scss|sass|less)["'];?\s*$/gm;

/** @param {string} dir @param {(file: string) => Promise<void>} visit */
const walk = async (dir, visit) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, visit);
    else await visit(full);
  }
};

let stripped = 0;
await walk(esmDir, async (file) => {
  if (!file.endsWith(".d.ts")) return;
  const source = await readFile(file, "utf8");
  const cleaned = source.replace(STYLE_IMPORT, "");
  if (cleaned !== source) {
    await writeFile(file, cleaned, "utf8");
    stripped += 1;
  }
});

await rm(cjsDir, { recursive: true, force: true });
await cp(esmDir, cjsDir, { recursive: true });

let mirrored = 0;
await walk(cjsDir, async (file) => {
  if (!file.endsWith(".d.ts")) {
    // Declaration maps point at the ESM tree; they are meaningless here.
    if (file.endsWith(".d.ts.map")) await rm(file);
    return;
  }
  const source = await readFile(file, "utf8");
  // Only relative specifiers are rewritten; bare imports such as "react" must
  // keep resolving through node_modules.
  const rewritten = source
    .replace(/(from\s+["'])(\.{1,2}\/[^"']*?)\.js(["'])/g, "$1$2.cjs$3")
    .replace(/(\/\/#\s*sourceMappingURL=.*)$/gm, "");

  await writeFile(file, rewritten, "utf8");
  await rename(file, file.replace(/\.d\.ts$/, ".d.cts"));
  mirrored += 1;
});

// Belt and braces: pin the tree as CommonJS regardless of the root "type".
await writeFile(
  join(cjsDir, "package.json"),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
  "utf8"
);

console.log(
  `types: stripped style imports from ${stripped} file(s), mirrored ${mirrored} file(s) to dist/types-cjs`
);
