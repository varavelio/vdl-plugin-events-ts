import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "..");
const fixturesDir = resolve(__dirname, "fixtures");
const localVdlBin = resolve(repoRoot, "node_modules/.bin/vdl");
const localTscBin = resolve(repoRoot, "node_modules/.bin/tsc");

// All generated files must type-check under a strict ES6-only baseline.
// --ignoreConfig avoids loading the solution-style root tsconfig.json.
const tscArgs = [
  "--ignoreConfig",
  "--noEmit",
  "--moduleResolution",
  "bundler",
  "--module",
  "esnext",
  "--target",
  "es6",
  "--lib",
  "es6",
  "--strict",
  "--allowImportingTsExtensions",
  "--skipLibCheck",
] as const;

const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(fixturesDir, name, "vdl.config.vdl")))
  .sort();

describe("VDL Plugin TS events e2e", () => {
  beforeAll(() => {
    runCommand("npm", ["run", "build"], repoRoot, "pipe");
  });

  it.each(fixtures)("executes fixture: %s", (fixtureName) => {
    const fixturePath = join(fixturesDir, fixtureName);
    const expectedError = readExpectedError(fixturePath);

    cleanGeneratedOutput(fixturePath);

    if (expectedError) {
      expect(() =>
        runCommand(localVdlBin, ["generate"], fixturePath, "pipe"),
      ).toThrowError(expectedError);
      expect(existsSync(join(fixturePath, "gen"))).toBe(false);
      return;
    }

    runCommand(localVdlBin, ["generate"], fixturePath, "pipe");

    const generatedFiles = collectTypeScriptFiles(
      join(fixturePath, "gen"),
      fixturePath,
    );
    expect(generatedFiles.length).toBeGreaterThan(0);

    for (const filePath of generatedFiles) {
      const content = readFileSync(
        join(fixturePath, filePath.replace(/^\.\//, "")),
        "utf-8",
      )
        .trim()
        .split("\n")
        .slice(3)
        .join("\n")
        .trim();
      expect(content).toMatchSnapshot(toSnapshotKey(filePath));
    }

    runFixtureTypeCheck(fixturePath, generatedFiles);
    runFixtureRuntime(fixturePath);
  });
});

/**
 * Returns the expected failure message for a fixture when it is intended to fail.
 */
function readExpectedError(fixturePath: string): string | null {
  const errorFile = join(fixturePath, "expect-error.txt");
  if (!existsSync(errorFile)) {
    return null;
  }

  return readFileSync(errorFile, "utf-8").trim();
}

/**
 * Removes the fixture output directory to ensure each run starts clean.
 */
function cleanGeneratedOutput(fixturePath: string): void {
  const generatedRoot = join(fixturePath, "gen");
  if (existsSync(generatedRoot)) {
    rmSync(generatedRoot, { recursive: true, force: true });
  }
}

/**
 * Collects generated TypeScript files relative to the fixture root.
 */
function collectTypeScriptFiles(
  rootDir: string,
  fixturePath: string,
): string[] {
  if (!existsSync(rootDir)) {
    return [];
  }

  const files: string[] = [];
  const pendingDirs = [rootDir];

  while (pendingDirs.length > 0) {
    const currentDir = pendingDirs.pop();
    if (!currentDir) {
      continue;
    }

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        pendingDirs.push(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(`./${relative(fixturePath, absolutePath)}`);
      }
    }
  }

  return files.sort();
}

/**
 * Type-checks only generated files to validate the plugin output surface itself.
 */
function runFixtureTypeCheck(
  fixturePath: string,
  generatedFiles: string[],
): void {
  if (generatedFiles.length === 0) {
    return;
  }

  runCommand(localTscBin, [...generatedFiles, ...tscArgs], fixturePath, "pipe");
}

/**
 * Runs optional runtime assertions living in fixture-local main.ts files.
 */
function runFixtureRuntime(fixturePath: string): void {
  if (!existsSync(join(fixturePath, "main.ts"))) {
    return;
  }

  runCommand("node", ["main.ts"], fixturePath, "inherit");
}

function toSnapshotKey(fixtureRelativePath: string): string {
  return fixtureRelativePath.replace(/^\.\/gen\//, "");
}

function runCommand(
  command: string,
  args: readonly string[],
  cwd: string,
  stdio: "inherit" | "pipe",
): void {
  execFileSync(command, [...args], { cwd, stdio });
}
