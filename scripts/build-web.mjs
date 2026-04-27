import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "www");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const item of ["index.html", "styles.css", "app.js", "app-config.js", "README.md"]) {
  await cp(join(root, item), join(outDir, item));
}

await cp(join(root, "assets"), join(outDir, "assets"), { recursive: true });
