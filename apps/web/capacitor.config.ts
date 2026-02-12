import type { CapacitorConfig } from "@capacitor/cli";
import { execSync } from "child_process";
import { config as sousConfig } from "@sous/config";

// --- URL Resolution Logic ---
// 1. CI/CD Override (e.g. from GitHub Actions)
let serverUrl = process.env.CAPACITOR_SERVER_URL;

// 2. Dev Detection (if not in CI)
if (!serverUrl) {
  serverUrl = "http://10.0.2.2:3000"; 
  try {
    const output = execSync("hostname -I").toString().trim();
    const wslIp = output.split(" ").find(ip => ip !== "127.0.0.1" && ip.startsWith("172.")) || output.split(" ")[0];
    const port = sousConfig.web.port || "3000";
    if (wslIp) {
      serverUrl = `http://${wslIp}:${port}`;
      console.log("CapacitorConfig: BAKING_IN_URL (Dev):", serverUrl);
    }
  } catch (e) {
    console.warn("Could not detect WSL IP, falling back to 10.0.2.2");
  }
} else {
  console.log("CapacitorConfig: Using CI/CD Server URL:", serverUrl);
}

const config: CapacitorConfig = {
  appId: "com.sous.tools",
  appName: "sous",
  webDir: "out",
  server: {
    url: serverUrl,
    cleartext: true,
    allowNavigation: ["*"]
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
