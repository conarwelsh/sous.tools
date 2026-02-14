#!/usr/bin/env -S pnpm tsx

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");

function runCommand(command: string, description: string): boolean {
  console.log(`\n🔹 [${description}] Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", cwd: ROOT_DIR });
    console.log(`✅ [${description}] Passed.`);
    return true;
  } catch (error) {
    console.error(`❌ [${description}] Failed.`);
    return false;
  }
}

function checkPlaceholders(): boolean {
  console.log("\n🔹 [Placeholders] Checking for TODO, FIXME, etc...");
  const keywords = ["TODO", "FIXME", "HACK", "XXX", "TEMP"];
  // Exclude node_modules, .git, dist, build, and this script itself
  const excludeDirs = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".gemini",
    ".turbo",
    ".next",
    ".next-signage",
    ".next-pos",
    ".next-kds",
    ".next-mobile",
    "playwright-report",
    "test-results",
  ];
  const excludeFiles = ["audit-codebase.ts", "pnpm-lock.yaml"];

  let foundIssues = false;

  // Simple recursive search (could be replaced with 'grep' via execSync for speed if preferred)
  function searchDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          searchDir(fullPath);
        }
      } else if (stat.isFile()) {
        if (excludeFiles.includes(file)) continue;

        // Skip non-text files roughly
        if (
          file.endsWith(".png") ||
          file.endsWith(".jpg") ||
          file.endsWith(".ico") ||
          file.endsWith(".woff2")
        )
          continue;

        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          for (const keyword of keywords) {
            if (content.includes(keyword)) {
              // Check if it's not just the keyword in a string (simple check)
              const lines = content.split("\n");
              lines.forEach((line, index) => {
                if (line.includes(keyword)) {
                  console.log(
                    `⚠️  ${keyword} found in ${path.relative(ROOT_DIR, fullPath)}:${index + 1}`,
                  );
                  console.log(`   Line: ${line.trim().substring(0, 100)}...`);
                  foundIssues = true;
                }
              });
            }
          }
        } catch (err) {
          // Ignore read errors
        }
      }
    }
  }

  searchDir(ROOT_DIR);

  if (foundIssues) {
    console.log("⚠️  [Placeholders] Found potential issues. Review above.");
    // We don't fail the build for TODOs, just warn.
    return true;
  } else {
    console.log("✅ [Placeholders] Clean.");
    return true;
  }
}

async function main() {
  console.log("🚀 Starting Comprehensive Codebase Audit...\n");

  const results = {
    dependencies: runCommand("pnpm audit --prod", "Dependency Security Audit"),
    lint: runCommand("pnpm turbo run lint", "Linting"),
    typecheck: runCommand("pnpm turbo run typecheck", "Type Checking"),
    test: runCommand("pnpm turbo run test", "Unit Testing"),
    placeholders: checkPlaceholders(),
    // deadCode: runCommand('npx ts-prune', 'Dead Code Analysis (ts-prune)'), // Optional, requires ts-prune
  };

  console.log("\n📊 Audit Summary:");
  Object.entries(results).forEach(([key, passed]) => {
    console.log(`  - ${key}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  });

  if (Object.values(results).every((r) => r)) {
    console.log("\n✅ Audit Complete. Ready for next steps.");
    process.exit(0);
  } else {
    console.error("\n❌ Audit Failed. Please fix the issues above.");
    process.exit(1);
  }
}

main();
