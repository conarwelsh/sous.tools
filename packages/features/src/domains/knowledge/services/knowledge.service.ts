import "server-only";
import fs from "fs";
import path from "path";
import { type DocFile } from "../types";

function findMonorepoRoot(startDir: string): string {
  let current = startDir;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return startDir;
}

export async function getKnowledgeBaseDocs(): Promise<DocFile[]> {
  const rootDir = findMonorepoRoot(process.cwd());
  const docsDir = path.join(rootDir, ".gemini", "docs");
  const adrDir = path.join(docsDir, "ADRs");
  const specDir = path.join(rootDir, ".gemini", "specs");

  const docs: DocFile[] = [];

  // 1. Load ADRs
  if (fs.existsSync(adrDir)) {
    const files = fs.readdirSync(adrDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = fs.readFileSync(path.join(adrDir, file), "utf-8");
        docs.push({
          title: file
            .replace(".md", "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          slug: `adr-${file.replace(".md", "")}`,
          category: "adr",
          content,
        });
      }
    }
  }

  // 2. Load Specs
  if (fs.existsSync(specDir)) {
    const files = fs.readdirSync(specDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = fs.readFileSync(path.join(specDir, file), "utf-8");
        docs.push({
          title: file
            .replace(".md", "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          slug: `spec-${file.replace(".md", "")}`,
          category: "spec",
          content,
        });
      }
    }
  }

  // 3. Crawl monorepo for READMEs (Mandate 6)
  const crawlReadmes = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (
        item.isDirectory() &&
        !item.name.startsWith(".") &&
        item.name !== "node_modules"
      ) {
        const subDir = path.join(dir, item.name);
        const readmePath = path.join(subDir, "README.md");
        if (fs.existsSync(readmePath)) {
          const content = fs.readFileSync(readmePath, "utf-8");
          const relativePath = path.relative(rootDir, subDir);
          docs.push({
            title: item.name.toUpperCase(),
            slug: `readme-${relativePath.replace(/\//g, "-")}`,
            category: "readme",
            content,
          });
        }
        if (dir === rootDir || dir.endsWith("apps") || dir.endsWith("packages"))
          crawlReadmes(subDir);
      }
    }
  };

  // Add Root README
  const rootReadme = path.join(rootDir, "README.md");
  if (fs.existsSync(rootReadme)) {
    docs.push({
      title: "Project Overview",
      slug: "readme-root",
      category: "readme",
      content: fs.readFileSync(rootReadme, "utf-8"),
    });
  }

  crawlReadmes(path.join(rootDir, "apps"));
  crawlReadmes(path.join(rootDir, "packages"));

  return docs;
}
