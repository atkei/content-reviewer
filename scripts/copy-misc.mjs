#!/usr/bin/env node
/* global console */

import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const packagesDir = join(rootDir, "packages");

const filesToCopy = ["LICENSE"];

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

for (const pkg of packages) {
  const distDir = join(packagesDir, pkg, "dist");

  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  for (const file of filesToCopy) {
    const src = join(rootDir, file);
    const dest = join(distDir, file);

    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`Copied ${file} to packages/${pkg}/dist/`);
    }
  }
}

console.log("Done copying misc files.");
