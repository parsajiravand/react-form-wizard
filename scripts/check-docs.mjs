/**
 * Typecheck the documented examples against the packed tarball.
 *
 * Every complete component in docs/recipes.md and README.md is extracted and
 * compiled against the real published artifact, with real `zod` and
 * `react-hook-form` installed. Docs that do not compile are a defect: the
 * 1.1.x README documented type exports the package never shipped, and this is
 * the check that catches that class of mistake.
 *
 * Usage: node scripts/check-docs.mjs [path-to-tarball]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const findTarball = () => {
  const explicit = process.argv[2];
  if (explicit) return resolve(explicit);
  const found = readdirSync(root).filter((f) => f.endsWith(".tgz")).sort();
  if (found.length === 0) {
    console.error("No .tgz found. Run `npm pack` first, or pass a path.");
    process.exit(1);
  }
  return join(root, found[found.length - 1]);
};

const tarball = findTarball();
const work = mkdtempSync(join(tmpdir(), "rfw-docs-"));
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: work, stdio: "pipe", encoding: "utf8", ...opts });

try {
  console.log(`Checking documented examples against ${tarball.split("/").pop()}`);

  writeFileSync(
    join(work, "package.json"),
    JSON.stringify({ name: "docs-check", private: true }, null, 2)
  );

  run("npm", [
    "install", "--silent", "--no-audit", "--no-fund",
    "react@19", "react-dom@19", "@types/react@19", "@types/react-dom@19",
    "typescript@5", "zod", "react-hook-form", "@hookform/resolvers",
    tarball,
  ]);

  writeFileSync(
    join(work, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          module: "esnext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          esModuleInterop: true,
          target: "ES2020",
          lib: ["ES2020", "DOM"],
          types: [],
        },
        include: ["src"],
      },
      null,
      2
    )
  );

  mkdirSync(join(work, "src"), { recursive: true });

  let extracted = 0;
  for (const doc of ["docs/recipes.md", "README.md"]) {
    const md = readFileSync(join(root, doc), "utf8");
    const blocks = [...md.matchAll(/```tsx\n([\s\S]*?)```/g)].map((m) => m[1]);
    for (const block of blocks) {
      // Only self-contained modules; fragments would need scaffolding that
      // would obscure whichever real error we are looking for.
      if (!block.includes("export default function")) continue;
      extracted += 1;
      writeFileSync(
        join(work, "src", `example${extracted}.tsx`),
        `/// <reference lib="dom" />\n${block}`
      );
    }
  }

  if (extracted === 0) {
    console.error("No complete examples found — the extraction pattern broke.");
    process.exit(1);
  }
  console.log(`Extracted ${extracted} complete example(s)`);

  try {
    run("npx", ["--no-install", "tsc", "-p", "tsconfig.json"]);
    console.log(`OK: all ${extracted} documented example(s) typecheck`);
  } catch (error) {
    console.error("Documented examples failed to typecheck:\n");
    console.error(error.stdout || error.message);
    process.exit(1);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
