import { cpSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const buildDirectory = resolve(scriptDirectory, "..", ".build");
const publishDirectory = resolve(scriptDirectory, "..", "..");

for (const entry of readdirSync(buildDirectory, { withFileTypes: true })) {
  const source = resolve(buildDirectory, entry.name);
  const destination = resolve(publishDirectory, entry.name);

  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

rmSync(buildDirectory, { recursive: true, force: true });
