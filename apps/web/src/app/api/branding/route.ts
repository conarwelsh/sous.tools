import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "../../branding.config.json");

export async function GET() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const config = await req.json();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
