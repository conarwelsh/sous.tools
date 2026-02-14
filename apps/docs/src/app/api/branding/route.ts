import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { brandingConfigSchema, config } from "@sous/config";

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

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rootDir = findMonorepoRoot(process.cwd());
    const configPath = path.join(rootDir, "branding.config.json");

    if (!fs.existsSync(configPath)) {
      return NextResponse.json({});
    }

    const content = fs.readFileSync(configPath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json(
      { error: "Failed to read branding config" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Only allow in development
  if (config.env !== "development") {
    return NextResponse.json(
      { error: "Direct saving only available in development" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const parsed = brandingConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid branding configuration",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const rootDir = findMonorepoRoot(process.cwd());
    const configPath = path.join(rootDir, "branding.config.json");

    fs.writeFileSync(configPath, JSON.stringify(parsed.data, null, 2));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save branding config" },
      { status: 500 },
    );
  }
}
